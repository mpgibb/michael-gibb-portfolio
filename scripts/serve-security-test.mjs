// Explicit local-only browser fixture. No real mail or model calls are possible.
// This script is not imported by any application route or production build.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import next from 'next';
import { createContactHandler } from '../lib/contact-server.ts';
import { createChatSessionHandler } from '../lib/chat-security.ts';
import { createProtectedChatHandler } from '../lib/protected-chat.ts';
import { environment as fixtureEnvironment, realRedis, service } from './security-fixture.mjs';

if (process.env.VERCEL || process.env.NODE_ENV === 'production') throw new Error('The security fixture must never run in production.');
const port = Number(process.env.SECURITY_TEST_PORT || 3102);
const environment = { ...fixtureEnvironment, VERCEL: undefined, VERCEL_ENV: undefined, NODE_ENV: 'development', TURNSTILE_ALLOWED_HOSTNAMES: '127.0.0.1,localhost', NEXT_PUBLIC_TURNSTILE_SITE_KEY: '1x00000000000000000000AA' };
for (const [key, value] of Object.entries(environment)) if (value === undefined) delete process.env[key]; else process.env[key] = value;
const redis = await realRedis();
const app = next({ dev: true, hostname: '127.0.0.1', port });
await app.prepare();
const handle = app.getRequestHandler();
let lastMode = '';
const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${port}`);
  if (!['/api/contact', '/api/assistant/session', '/api/assistant/message'].includes(url.pathname)) return handle(req, res);
  let mode = 'success';
  if (process.env.SECURITY_TEST_CONTROL_FILE) mode = (await readFile(process.env.SECURITY_TEST_CONTROL_FILE, 'utf8')).trim();
  if (mode !== lastMode) { redis.command('FLUSHDB'); lastMode = mode; }
  const verification = { hostname: '127.0.0.1', ...(mode === 'expired' ? { success: false, 'error-codes': ['timeout-or-duplicate'] } : {}) };
  const services = service(redis, { action: url.pathname.includes('assistant') ? 'chat_init' : 'contact_submit', verification, ...(mode === 'outage' ? { outage: 'turnstile' } : {}) });
  const dependencies = { environment, transport: services.transport, logger: event => console.info('TEST', JSON.stringify(event)) };
  const handler = url.pathname.endsWith('/session') ? createChatSessionHandler(dependencies) : url.pathname.endsWith('/message') ? createProtectedChatHandler({ ...dependencies, maximumTokens: 10000, execute: async () => Response.json({ text: 'Synthetic assistant response. No model was called.', id: randomUUID() }) }) : createContactHandler(dependencies);
  const request = new Request(url, { method: req.method, headers: req.headers, body: req, duplex: 'half' });
  const response = await handler(request);
  res.writeHead(response.status, Object.fromEntries(response.headers)); res.end(await response.text());
});
server.listen(port, '127.0.0.1', () => console.info(`LOCAL SECURITY FIXTURE http://127.0.0.1:${port} — synthetic delivery only`));
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, async () => { server.close(); await app.close(); await redis.close(); process.exit(0); });
