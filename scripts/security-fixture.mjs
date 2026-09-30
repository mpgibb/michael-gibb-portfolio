import { spawn, execFileSync } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';

export const environment = { RESEND_API_KEY: 'test-key-not-a-secret', CONTACT_TO_EMAIL: 'recipient@example.com', CONTACT_FROM_EMAIL: 'sender@example.com', UPSTASH_REDIS_REST_URL: 'https://store.example.com', UPSTASH_REDIS_REST_TOKEN: 'test-store-token', CONTACT_HASH_SECRET: 'test-only-key-of-at-least-thirty-two-characters', VERCEL: '1', VERCEL_ENV: 'production', TURNSTILE_SECRET_KEY: 'unit-test-turnstile-secret', NEXT_PUBLIC_TURNSTILE_SITE_KEY: 'unit-test-site-key', TURNSTILE_ALLOWED_HOSTNAMES: 'portfolio.example.com' };
export const inquiry = () => ({ name: 'Portfolio Test', email: 'visitor@example.com', company: '', phone: '', topic: 'Other', message: 'A clearly labeled synthetic inquiry.', website: '', requestId: randomUUID(), turnstileToken: randomUUID() });
export const request = (body, { path = '/api/contact', headers = {} } = {}) => new Request(`https://portfolio.example.com${path}`, { method: 'POST', headers: { origin: 'https://portfolio.example.com', 'content-type': 'application/json', 'x-vercel-forwarded-for': '192.0.2.12', ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body) });
export async function realRedis() {
  const directory = await mkdtemp(join(tmpdir(), 'portfolio-security-'));
  const socket = join(directory, 'redis.sock');
  const server = spawn('redis-server', ['--port', '0', '--unixsocket', socket, '--unixsocketperm', '700', '--save', '', '--appendonly', 'no'], { stdio: 'ignore' });
  let startupError;
  server.once('error', error => { startupError = error; });
  const stopped = new Promise(resolve => server.once('close', resolve));
  const close = async () => {
    if (server.exitCode === null && server.signalCode === null && server.pid) server.kill();
    const force = setTimeout(() => server.kill('SIGKILL'), 1000);
    await stopped;
    clearTimeout(force);
    await rm(directory, { recursive: true, force: true });
  };
  try {
    const deadline = Date.now() + 5000;
    while (true) {
      if (startupError) throw startupError;
      if (server.exitCode !== null || server.signalCode !== null) throw new Error('Redis exited before readiness.');
      try {
        // Protocol readiness works across Redis versions whose startup log text differs.
        const pong = execFileSync('redis-cli', ['-s', socket, 'PING'], { encoding: 'utf8', timeout: 250, stdio: ['ignore', 'pipe', 'ignore'] });
        if (pong.trim() === 'PONG') break;
      } catch { /* The socket may not exist yet. Retry only within the startup deadline. */ }
      if (Date.now() >= deadline) throw new Error('Redis did not start; install redis-server and redis-cli to run security tests.');
      await delay(50);
    }
  } catch (error) {
    await close();
    throw error;
  }
  const command = (...values) => JSON.parse(execFileSync('redis-cli', ['-s', socket, '--json', ...values.map(String)], { encoding: 'utf8' }));
  return { command, close };
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
