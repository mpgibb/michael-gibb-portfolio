import { spawn, execFileSync } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

export const environment = { RESEND_API_KEY: 'test-key-not-a-secret', CONTACT_TO_EMAIL: 'recipient@example.com', CONTACT_FROM_EMAIL: 'sender@example.com', UPSTASH_REDIS_REST_URL: 'https://store.example.com', UPSTASH_REDIS_REST_TOKEN: 'test-store-token', CONTACT_HASH_SECRET: 'test-only-key-of-at-least-thirty-two-characters', VERCEL: '1', VERCEL_ENV: 'production', TURNSTILE_SECRET_KEY: 'unit-test-turnstile-secret', NEXT_PUBLIC_TURNSTILE_SITE_KEY: 'unit-test-site-key', TURNSTILE_ALLOWED_HOSTNAMES: 'portfolio.example.com' };
export const inquiry = () => ({ name: 'Portfolio Test', email: 'visitor@example.com', company: '', phone: '', topic: 'Other', message: 'A clearly labeled synthetic inquiry.', website: '', requestId: randomUUID(), turnstileToken: randomUUID() });
export const request = (body, { path = '/api/contact', headers = {} } = {}) => new Request(`https://portfolio.example.com${path}`, { method: 'POST', headers: { origin: 'https://portfolio.example.com', 'content-type': 'application/json', 'x-vercel-forwarded-for': '192.0.2.12', ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body) });
export async function realRedis() {
  const directory = await mkdtemp(join(tmpdir(), 'portfolio-security-'));
  const socket = join(directory, 'redis.sock');
  const server = spawn('redis-server', ['--port', '0', '--unixsocket', socket, '--unixsocketperm', '700', '--save', '', '--appendonly', 'no'], { stdio: ['ignore', 'pipe', 'pipe'] });
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Redis did not start; install redis-server and redis-cli to run security tests.')), 5000);
    server.once('error', error => { clearTimeout(timeout); reject(error); });
    server.stdout.on('data', chunk => { if (chunk.toString().includes('Ready to accept connections')) { clearTimeout(timeout); resolve(); } });
    server.once('exit', code => { clearTimeout(timeout); if (code) reject(new Error('Redis exited before readiness.')); });
  });
  const command = (...values) => JSON.parse(execFileSync('redis-cli', ['-s', socket, '--json', ...values.map(String)], { encoding: 'utf8' }));
  return { command, close: async () => { const done = new Promise(resolve => server.once('exit', resolve)); server.kill(); await done; await rm(directory, { recursive: true, force: true }); } };
}

export function service(redis, { action = 'contact_submit', verification = {}, outage, mailStatus = 200, now = Date.now } = {}) {
  const calls = []; const events = [];
  const transport = async (url, options) => {
    const body = JSON.parse(options.body); calls.push({ url, body, headers: options.headers });
    if (url === environment.UPSTASH_REDIS_REST_URL) {
      if (outage === 'store') throw new Error('private store secret');
      return Response.json({ result: redis.command(...body) });
    }
    if (url.includes('challenges.cloudflare.com')) {
      if (outage === 'turnstile') throw new Error('private verification detail');
      if (outage === 'bad-json') return new Response('invalid');
      return Response.json({ success: true, hostname: 'portfolio.example.com', action, challenge_ts: new Date(now()).toISOString(), ...verification });
    }
    if (url === 'https://api.resend.com/emails') return Response.json({ id: 'provider-receipt' }, { status: mailStatus });
    throw new Error('Unexpected external service call');
  };
  return { transport, calls, events, logger: event => events.push(event) };
}
