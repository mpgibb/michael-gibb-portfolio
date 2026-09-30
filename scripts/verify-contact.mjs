import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomUUID } from 'node:crypto';
import { createContactHandler } from '../lib/contact-server.ts';

const env = { RESEND_API_KEY: 'test-key-not-a-secret', CONTACT_TO_EMAIL: 'recipient@example.com', CONTACT_FROM_EMAIL: 'sender@example.com', UPSTASH_REDIS_REST_URL: 'https://store.example.com', UPSTASH_REDIS_REST_TOKEN: 'test-store-token', CONTACT_HASH_SECRET: 'test-only-key-of-at-least-thirty-two-characters', VERCEL: '1', VERCEL_ENV: 'production', TURNSTILE_SECRET_KEY: 'unit-test-turnstile-secret', NEXT_PUBLIC_TURNSTILE_SITE_KEY: 'unit-test-site-key', TURNSTILE_ALLOWED_HOSTNAMES: 'portfolio.example.com' };
const valid = () => ({ name: 'Portfolio Test', email: 'visitor@example.com', company: '', phone: '', topic: 'Other', message: 'A clearly labeled test inquiry.', website: '', requestId: randomUUID(), turnstileToken: randomUUID() });
const request = (body = valid(), headers = {}) => new Request('https://portfolio.example.com/api/contact', { method: 'POST', headers: { origin: 'https://portfolio.example.com', 'content-type': 'application/json', 'x-vercel-forwarded-for': '192.0.2.12', ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body) });
function services({ reservation = [1, 'delivery-token'], provider = 200, storeFails = false, receiptFails = false, providerData = { id: 'provider-receipt' } } = {}) {
  const calls = [];
  const transport = async (url, options) => {
    const body = JSON.parse(options.body);
    if (url.includes('challenges.cloudflare.com')) return Response.json({ success: true, action: 'contact_submit', hostname: 'portfolio.example.com', challenge_ts: new Date().toISOString() });
    calls.push({ url, body, headers: options.headers });
    if (url === 'https://store.example.com') {
      if (storeFails || receiptFails && body[0] === 'SET') throw new Error('private upstream detail');
      return Response.json({ result: body[0] === 'EVAL' ? body[2] === 3 || body[2] === 2 ? 1 : reservation : 'OK' });
    }
    assert.equal(url, 'https://api.resend.com/emails');
    return Response.json(providerData, { status: provider });
  };
  return { calls, handler: createContactHandler({ environment: env, transport, logger: () => {} }) };
}

test('valid inquiry uses fixed recipient, verified sender configuration, safe Reply-To and plain text', async () => {
  const service = services();
  const data = { ...valid(), message: '<script>alert("test")</script>\nA literal message.' };
  const result = await service.handler(request(data));
  assert.equal(result.status, 200); assert.deepEqual(await result.json(), { accepted: true });
  const mail = service.calls.find(call => call.url.includes('resend'));
  assert.deepEqual(mail.body.to, [env.CONTACT_TO_EMAIL]);
  assert(mail.body.from.includes(env.CONTACT_FROM_EMAIL)); assert.equal(mail.body.reply_to, data.email);
  assert.equal(mail.body.html, undefined); assert(mail.body.text.includes(data.message));
  assert.equal(mail.headers['Idempotency-Key'], 'portfolio-contact/delivery-token');
  const store = JSON.stringify(service.calls.filter(call => call.url.includes('store')).map(call => call.body));
  for (const privateValue of [data.name, data.email, data.message, '192.0.2.12']) assert(!store.includes(privateValue));
  assert.equal(result.headers.get('cache-control'), 'no-store');
});

test('untrusted fields, control characters, malformed/oversized bodies and invalid required fields never reach providers', async () => {
  const service = services();
  for (const data of [{ ...valid(), to: 'attacker@example.com' }, { ...valid(), name: 'test\r\nBcc: attacker' }, { ...valid(), email: 'a@example.com\r\nBcc: b@example.com' }, { ...valid(), email: 'not-an-address' }, { ...valid(), message: 'x'.repeat(5001) }, { ...valid(), message: 'short' }, { ...valid(), website: 'bot.example' }, '{', ' '.repeat(20001)]) assert.equal((await service.handler(request(data))).status, 400);
  assert.equal(service.calls.length, 0);
  // The framework's internal request origin may differ from the public Host.
  const local = services();
  const forwardedRequest = new Request('https://localhost:3000/api/contact', { method: 'POST', headers: { origin: 'https://portfolio.example.com', host: 'portfolio.example.com', 'content-type': 'application/json', 'x-vercel-forwarded-for': '192.0.2.12' }, body: JSON.stringify(valid()) });
  assert.equal((await local.handler(forwardedRequest)).status, 200);
});

test('same-origin, content-type, network-address and preview guards fail closed', async () => {
  const service = services();
  assert.equal((await service.handler(request(valid(), { origin: 'https://other.example.com' }))).status, 403);
  assert.equal((await service.handler(request(valid(), { 'content-type': 'text/plain' }))).status, 415);
  assert.equal((await service.handler(request(valid(), { 'x-vercel-forwarded-for': '' }))).status, 403);
  for (const environment of [{}, { ...env, VERCEL_ENV: 'preview' }]) assert.equal((await createContactHandler({ environment, transport: async () => { throw new Error('must not call'); } })(request())).status, 503);
  assert.equal(service.calls.length, 0);
});

test('shared duplicate, pending, conflict and rate-limit decisions control every instance', async () => {
  for (const [state, expected] of [[2, 200], [3, 409], [4, 409], [5, 429]]) {
    const first = services({ reservation: [state, 'same-token'] });
    const second = services({ reservation: [state, 'same-token'] });
    for (const service of [first, second]) { assert.equal((await service.handler(request())).status, expected); assert.equal(service.calls.length, 2); }
  }
});

test('only actual provider acceptance yields success; private upstream details stay private', async () => {
  for (const options of [{ storeFails: true }, { provider: 403, providerData: { message: 'private provider detail' } }, { provider: 500 }, { providerData: {} }]) {
    const response = await services(options).handler(request());
    assert.equal(response.status, 503); const text = await response.text();
    assert(!text.includes('accepted')); assert(!text.includes('private')); assert(!text.includes('@'));
  }
  const response = await services({ receiptFails: true }).handler(request());
  assert.equal(response.status, 200); assert.deepEqual(await response.json(), { accepted: true });
});

test('provider retry keeps the same payload and idempotency token', async () => {
  const first = services({ provider: 500 }); const second = services(); const data = valid();
  assert.equal((await first.handler(request(data))).status, 503);
  assert.equal((await second.handler(request(data))).status, 200);
  const firstMail = first.calls.find(call => call.url.includes('resend'));
  const secondMail = second.calls.find(call => call.url.includes('resend'));
  assert.deepEqual(firstMail.body, secondMail.body); assert.deepEqual(firstMail.headers, secondMail.headers);
});
