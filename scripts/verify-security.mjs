import assert from 'node:assert/strict';
import { test, before, after, beforeEach } from 'node:test';
import { randomUUID } from 'node:crypto';
import { createContactHandler } from '../lib/contact-server.ts';
import { securityConfiguration, keyedHash } from '../lib/request-security.ts';
import { createChatSessionHandler } from '../lib/chat-security.ts';
import { createProtectedChatHandler } from '../lib/protected-chat.ts';
import { environment, inquiry, request, realRedis, service } from './security-fixture.mjs';

let redis;
before(async () => { redis = await realRedis(); });
after(async () => { await redis?.close(); });
beforeEach(() => redis.command('FLUSHDB'));
const mailCount = services => services.calls.filter(call => call.url.includes('resend')).length;
const dependencies = services => ({ environment, ...services });

test('fresh contact verification checks Cloudflare and preserves fixed delivery and idempotency', async () => {
  const services = service(redis); const handler = createContactHandler(dependencies(services)); const data = inquiry();
  assert.equal((await handler(request(data))).status, 200);
  assert.equal((await handler(request(data))).status, 409); // consumed token cannot be reused
  assert.equal((await handler(request({ ...data, turnstileToken: randomUUID() }))).status, 200); // same inquiry, fresh verification
  assert.equal(mailCount(services), 1);
  const verification = services.calls.find(call => call.url.includes('cloudflare'));
  assert.equal(verification.body.secret, environment.TURNSTILE_SECRET_KEY);
  assert.equal(verification.body.response, data.turnstileToken);
  assert.equal(verification.body.remoteip, '192.0.2.12');
  const keys = redis.command('KEYS', '*');
  const stored = JSON.stringify(keys.map(key => [key, redis.command('TYPE', key) === 'string' ? redis.command('GET', key) : redis.command('HGETALL', key)]));
  for (const secret of [data.message, data.email, data.name, data.turnstileToken, '192.0.2.12']) assert(!stored.includes(secret));
});

test('missing, expired, used, invalid, wrong-host and wrong-action challenges cannot send mail', async () => {
  const cases = [
    [{ success: false, 'error-codes': ['timeout-or-duplicate'] }, 'expired_or_used'],
    [{ success: false, 'error-codes': ['invalid-input-response'] }, 'invalid_token'],
    [{ hostname: 'attacker.example.com' }, 'hostname_mismatch'],
    [{ action: 'chat_init' }, 'action_mismatch'],
    [{ challenge_ts: new Date(Date.now() - 301000).toISOString() }, 'expired_challenge'],
    [{ challenge_ts: new Date(Date.now() + 60000).toISOString() }, 'expired_challenge'],
  ];
  for (const [verification, category] of cases) {
    const services = service(redis, { verification });
    const response = await createContactHandler(dependencies(services))(request(inquiry()));
    assert.equal(response.status, 403); assert.equal((await response.json()).verificationRequired, true);
    assert.equal(services.events[0].category, category); assert.equal(mailCount(services), 0);
  }
  const services = service(redis);
  assert.equal((await createContactHandler(dependencies(services))(request({ ...inquiry(), turnstileToken: undefined }))).status, 403);
  assert.equal(services.calls.length, 1); // shared attempt counter, never Siteverify or delivery
});

test('outages fail closed and logs contain only an allowlisted outcome, category and timing', async () => {
  for (const outage of ['store', 'turnstile', 'bad-json']) {
    const services = service(redis, { outage }); const data = inquiry();
    const response = await createContactHandler(dependencies(services))(request(data));
    assert.equal(response.status, 503); assert.equal(mailCount(services), 0);
    for (const event of services.events) assert.deepEqual(Object.keys(event).sort(), ['action', 'category', 'event', 'latency_ms', 'outcome']);
    const logs = JSON.stringify(services.events);
    for (const privateValue of [data.turnstileToken, data.message, data.email, 'private', environment.TURNSTILE_SECRET_KEY]) assert(!logs.includes(privateValue));
    assert(!logs.includes('bot')); assert.equal(services.events[0].outcome, 'unavailable');
  }
});

test('racing instances cannot reuse a token or deliver duplicate inquiries', async () => {
  const services = service(redis); const data = inquiry();
  const responses = await Promise.all(Array.from({ length: 12 }, () => createContactHandler(dependencies(services))(request(data))));
  assert.equal(responses.filter(response => response.status === 200).length, 1);
  assert.equal(mailCount(services), 1);
  assert.equal(services.calls.filter(call => call.url.includes('cloudflare')).length, 1);
  redis.command('FLUSHDB'); services.calls.length = 0;
  const fresh = await Promise.all(Array.from({ length: 8 }, () => createContactHandler(dependencies(services))(request({ ...data, turnstileToken: randomUUID() }))));
  assert(fresh.every(response => [200, 409].includes(response.status))); assert.equal(mailCount(services), 1);
});

test('attempt limits and contact limits are shared across handler instances', async () => {
  const services = service(redis, { verification: { success: false } });
  for (let i = 0; i < 20; i++) assert.equal((await createContactHandler(dependencies(services))(request(inquiry()))).status, 403);
  assert.equal((await createContactHandler(dependencies(services))(request(inquiry()))).status, 429);
  assert.equal(services.calls.filter(call => call.url.includes('cloudflare')).length, 20);
  redis.command('FLUSHDB'); const valid = service(redis);
  for (let i = 0; i < 5; i++) assert.equal((await createContactHandler(dependencies(valid))(request({ ...inquiry(), message: `Distinct inquiry number ${i}.` }))).status, 200);
  assert.equal((await createContactHandler(dependencies(valid))(request({ ...inquiry(), message: 'Another distinct inquiry.' }))).status, 429);
  assert.equal(mailCount(valid), 5);
});

test('configuration rejects testing keys and broad/invalid hosts in deployed environments', () => {
  for (const extra of [{ TURNSTILE_SECRET_KEY: '1x0000000000000000000000000000000AA' }, { NEXT_PUBLIC_TURNSTILE_SITE_KEY: '1x00000000000000000000AA' }, { TURNSTILE_ALLOWED_HOSTNAMES: '*' }, { TURNSTILE_ALLOWED_HOSTNAMES: 'localhost' }, { TURNSTILE_ALLOWED_HOSTNAMES: 'https://portfolio.example.com' }, { VERCEL_ENV: 'preview' }]) assert.equal(securityConfiguration({ ...environment, ...extra }), null);
  assert(securityConfiguration({ ...environment, VERCEL: undefined, VERCEL_ENV: undefined, NODE_ENV: 'test', TURNSTILE_SECRET_KEY: '1x0000000000000000000000000000000AA', TURNSTILE_ALLOWED_HOSTNAMES: 'localhost' }));
});

async function startSession(services, overrides = {}) {
  const token = randomUUID();
  const response = await createChatSessionHandler({ ...dependencies(services), ...overrides })(request({ turnstileToken: token }, { path: '/api/assistant/session' }));
  assert.equal(response.status, 200);
  const setCookie = response.headers.get('set-cookie');
  assert(setCookie.startsWith('__Host-portfolio-chat='));
  for (const attribute of ['Secure', 'HttpOnly', 'SameSite=Strict', 'Path=/', 'Max-Age=900']) assert(setCookie.includes(attribute));
  assert(!setCookie.includes('Domain=')); assert(!setCookie.includes(token));
  assert(!JSON.stringify(await response.json()).includes(setCookie.split(';')[0].split('=')[1]));
  return setCookie.split(';')[0];
}
function aiRequest(cookie, data = { requestId: randomUUID(), message: 'Explain a public study.' }, headers = {}) { return request(data, { path: '/api/assistant/message', headers: { ...(cookie ? { cookie } : {}), ...headers } }); }

test('every AI call needs a server session; invalid challenges, direct requests and outages cannot charge', async () => {
  let charges = 0;
  const services = service(redis, { action: 'chat_init' });
  const handler = createProtectedChatHandler({ ...dependencies(services), maximumTokens: 10000, execute: async () => { charges++; return Response.json({ ok: true }); } });
  assert.equal((await handler(aiRequest())).status, 401);
  assert.equal((await handler(aiRequest('__Host-portfolio-chat=client-verified'))).status, 401);
  for (const verification of [{ action: 'contact_submit' }, { hostname: 'other.example.com' }, { success: false }]) {
    const invalid = service(redis, { action: 'chat_init', verification });
    assert.equal((await createChatSessionHandler(dependencies(invalid))(request({ turnstileToken: randomUUID() }, { path: '/api/assistant/session' }))).status, 403);
  }
  const cookie = await startSession(services);
  assert.equal((await handler(aiRequest(cookie, undefined, { origin: 'https://other.example.com' }))).status, 403);
  assert.equal((await handler(aiRequest(cookie, { requestId: randomUUID(), message: 'x'.repeat(2001) }))).status, 400);
  assert.equal((await handler(aiRequest(cookie, ' '.repeat(10001)))).status, 400);
  assert.equal(charges, 0);
  const outage = service(redis, { outage: 'store' });
  const down = createProtectedChatHandler({ ...dependencies(outage), maximumTokens: 10000, execute: async () => { charges++; return Response.json({ ok: true }); } });
  assert.equal((await down(aiRequest(cookie))).status, 503); assert.equal(charges, 0);
  assert.equal((await handler(aiRequest(cookie, undefined, { cookie: `${cookie}; portfolio-consent=rejected` }))).status, 200);
  assert.equal(charges, 1);
});

test('expiry, changed network, session message limits and suspicious rate require re-verification', async () => {
  let clock = Date.now(); let charges = 0;
  const services = service(redis, { action: 'chat_init', now: () => clock });
  const create = () => createProtectedChatHandler({ ...dependencies(services), now: () => clock, maximumTokens: 1000, execute: async () => { charges++; return Response.json({ ok: true }); } });
  let cookie = await startSession(services, { now: () => clock });
  clock += 900001;
  assert.equal((await create()(aiRequest(cookie))).status, 401);
  cookie = await startSession(services, { now: () => clock });
  assert.equal((await create()(aiRequest(cookie, undefined, { 'x-vercel-forwarded-for': '192.0.2.99' }))).status, 401);
  assert.equal((await create()(aiRequest(cookie))).status, 401); assert.equal(charges, 0);
  cookie = await startSession(services, { now: () => clock });
  for (let i = 0; i < 3; i++) assert.equal((await create()(aiRequest(cookie))).status, 200);
  assert.equal((await create()(aiRequest(cookie))).status, 429);
  assert.equal((await create()(aiRequest(cookie))).status, 401); assert.equal(charges, 3);
  cookie = await startSession(services, { now: () => clock });
  const credential = cookie.split('=')[1];
  const key = `portfolio-security:production:session:${keyedHash(credential, environment.CONTACT_HASH_SECRET)}`;
  redis.command('HSET', key, 'messages', 20);
  assert.equal((await create()(aiRequest(cookie))).status, 401); assert.equal(charges, 3);
});

test('concurrent AI requests reserve one operation, duplicate IDs never bill twice and usage caps persist', async () => {
  let charges = 0; let release;
  const wait = new Promise(resolve => { release = resolve; });
  const services = service(redis, { action: 'chat_init' }); const cookie = await startSession(services);
  const execute = async () => { charges++; await wait; return Response.json({ ok: true }); };
  const first = createProtectedChatHandler({ ...dependencies(services), maximumTokens: 10000, execute });
  const other = createProtectedChatHandler({ ...dependencies(services), maximumTokens: 10000, execute });
  const data = { requestId: randomUUID(), message: 'Explain the work.' };
  const responses = [first(aiRequest(cookie, data)), other(aiRequest(cookie, data)), other(aiRequest(cookie))];
  await new Promise(resolve => setTimeout(resolve, 50)); release();
  const results = await Promise.all(responses); assert.equal(results.filter(result => result.status === 200).length, 1); assert.equal(charges, 1);
  assert.equal((await other(aiRequest(cookie, data))).status, 409); assert.equal(charges, 1);
  const limited = createProtectedChatHandler({ ...dependencies(services), environment: { ...environment, AI_DAILY_TOKEN_LIMIT: '10000' }, maximumTokens: 10000, execute });
  assert.equal((await limited(aiRequest(cookie))).status, 429); assert.equal(charges, 1);
});

test('email failures retain provider idempotency with a fresh verification token on retry', async () => {
  const failed = service(redis, { mailStatus: 500 }); const success = service(redis); const data = inquiry();
  assert.equal((await createContactHandler(dependencies(failed))(request(data))).status, 503);
  const key = redis.command('KEYS', 'portfolio-contact:production:message:*')[0];
  const stored = JSON.parse(redis.command('GET', key)); stored.next = 0;
  redis.command('SET', key, JSON.stringify(stored), 'KEEPTTL');
  assert.equal((await createContactHandler(dependencies(success))(request({ ...data, turnstileToken: randomUUID() }))).status, 200);
  const old = failed.calls.find(call => call.url.includes('resend')); const next = success.calls.find(call => call.url.includes('resend'));
  assert.deepEqual(old.headers, next.headers); assert.deepEqual(old.body, next.body);
});

test('chat initialization rejects missing/reused tokens, outages and excessive new sessions', async () => {
  const services = service(redis, { action: 'chat_init' }); const handler = createChatSessionHandler(dependencies(services));
  assert.equal((await handler(request({}, { path: '/api/assistant/session' }))).status, 403);
  const data = { turnstileToken: randomUUID() };
  assert.equal((await handler(request(data, { path: '/api/assistant/session' }))).status, 200);
  assert.equal((await handler(request(data, { path: '/api/assistant/session' }))).status, 409);
  for (let i = 0; i < 4; i++) assert.equal((await handler(request({ turnstileToken: randomUUID() }, { path: '/api/assistant/session' }))).status, 200);
  assert.equal((await handler(request({ turnstileToken: randomUUID() }, { path: '/api/assistant/session' }))).status, 429);
  for (const outage of ['store', 'turnstile']) {
    const failed = service(redis, { action: 'chat_init', outage });
    const response = await createChatSessionHandler(dependencies(failed))(request({ turnstileToken: randomUUID() }, { path: '/api/assistant/session' }));
    assert.equal(response.status, 503); assert.equal(response.headers.get('set-cookie'), null);
  }
});

test('global request caps, network caps and cancelled/provider-failed requests retain budget reservations', async () => {
  const services = service(redis, { action: 'chat_init' }); const cookie = await startSession(services); let charges = 0;
  const handler = createProtectedChatHandler({ ...dependencies(services), maximumTokens: 10000, execute: async () => { charges++; throw new Error('private provider details'); } });
  const cancelled = new Request(aiRequest(cookie), { signal: AbortSignal.abort() });
  assert.equal((await handler(cancelled)).status, 499); assert.equal(charges, 0);
  assert.equal((await handler(aiRequest(cookie))).status, 503); assert.equal(charges, 1);
  assert.equal(redis.command('GET', 'portfolio-security:production:chat:tokens'), '10000');
  const capped = createProtectedChatHandler({ ...dependencies(services), environment: { ...environment, AI_DAILY_REQUEST_LIMIT: '1' }, maximumTokens: 10000, execute: async () => { charges++; return Response.json({ ok: true }); } });
  assert.equal((await capped(aiRequest(cookie))).status, 429); assert.equal(charges, 1);
  const network = keyedHash('network:192.0.2.12', environment.CONTACT_HASH_SECRET);
  redis.command('SET', `portfolio-security:production:chat:network:${network}`, 30, 'EX', 3600);
  assert.equal((await handler(aiRequest(cookie))).status, 429); assert.equal(charges, 1);
});
