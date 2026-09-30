// Local-only end-to-end fixture. Provider calls terminate in synthetic doubles.
// Never imported into application routes or a production bundle.
import { randomUUID } from 'node:crypto';
import { createContactHandler } from '../lib/contact-server.ts';
import { createChatSessionHandler } from '../lib/chat-security.ts';
import { createServer } from 'node:http';
import { writeFile, readFile } from 'node:fs/promises';
import next from 'next';
import { environment as fixture, realRedis, service } from './security-fixture.mjs';
if(process.env.VERCEL||process.env.NODE_ENV==='production')throw new Error('Local development only');
const port=3103;
const environment={...fixture,VERCEL:undefined,VERCEL_ENV:'production',NODE_ENV:'development',TURNSTILE_ALLOWED_HOSTNAMES:'127.0.0.1,localhost',NEXT_PUBLIC_TURNSTILE_SITE_KEY:'1x00000000000000000000AA',AI_ENABLED:'true',OPENAI_API_KEY:'synthetic-only',ANALYTICS_ENABLED:'true',POSTHOG_HOST:'https://us.i.posthog.com',POSTHOG_PROJECT_TOKEN:'synthetic-only',REPLAY_ENABLED:'false'};
for(const [key,value] of Object.entries(environment))if(value===undefined)delete process.env[key];else process.env[key]=value;
const redis=await realRedis();const nativeFetch=globalThis.fetch;const captured=[];
globalThis.fetch=async(url,options)=>{
 const target=String(url);let mode='success';try{mode=(await readFile('/tmp/portfolio-experience-mode','utf8')).trim()}catch{}
 if(target===fixture.UPSTASH_REDIS_REST_URL)return Response.json({result:redis.command(...JSON.parse(options.body))});
 if(target.includes('challenges.cloudflare.com/turnstile/v0/siteverify'))return Response.json({success:mode!=='verification-outage',hostname:'127.0.0.1',action:JSON.parse(options.body).idempotency_key?lastAction:'contact_submit',challenge_ts:new Date().toISOString()});
 if(target==='https://api.resend.com/emails') {captured.push({kind:'delivery',idempotency:options.headers['Idempotency-Key']});await save();return Response.json({id:'synthetic-provider-receipt'},{status:mode==='email-failure'?503:200});}
 if(target==='https://api.openai.com/v1/responses'){
  if(mode==='provider-failure')return Response.json({},{status:503});
  const input=JSON.parse(options.body);const evidence=JSON.parse(input.input).evidence;const words=`Synthetic fixture response: ${evidence[0]?.title ?? 'research'} explores a documented decision. Review the linked evidence for methods and limitations. `;
  const encoder=new TextEncoder();return new Response(new ReadableStream({async start(c){try{for(const word of words.split(' ')){if(options.signal.aborted)throw new Error('cancel');c.enqueue(encoder.encode(`data: ${JSON.stringify({type:'response.output_text.delta',delta:word+' '})}\n\n`));await new Promise(r=>setTimeout(r,30));}c.enqueue(encoder.encode(`data: ${JSON.stringify({type:'response.completed',response:{usage:{input_tokens:200,output_tokens:80}}})}\n\n`));c.close();}catch{c.error(new Error('cancelled'));}}}));
 }
 if(target.startsWith('https://us.i.posthog.com/')) {captured.push({kind:'analytics',...JSON.parse(options.body)});await save();return Response.json({status:1});}
 return nativeFetch(url,options);
};
let lastAction='contact_submit';async function save(){await writeFile('/tmp/portfolio-experience-captured.json',JSON.stringify(captured,null,2));}
const app=next({dev:true,hostname:'127.0.0.1',port});await app.prepare();const handle=app.getRequestHandler();
const server=createServer(async(req,res)=>{
 req.headers["x-forwarded-for"]="127.0.0.1";
 if(req.method==='POST' && ['/api/contact','/api/assistant/session'].includes(req.url)) {
  lastAction=req.url.includes('assistant')?'chat_init':'contact_submit';
  const chunks=[];for await(const chunk of req)chunks.push(chunk);const body=JSON.parse(Buffer.concat(chunks).toString());
  // Cloudflare's always-pass testing widget returns the same dummy string on
  // every render. Unique fixture values permit multi-flow browser testing;
  // single-use enforcement is separately tested against real Redis.
  if(body.turnstileToken)body.turnstileToken=randomUUID();
  const request=new Request(`http://127.0.0.1:${port}${req.url}`,{method:'POST',headers:req.headers,body:JSON.stringify(body)});
  const handler=lastAction==='chat_init'?createChatSessionHandler({environment}):createContactHandler({environment});const response=await handler(request);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(await response.text());return;
 }
 return handle(req,res);
});
server.listen(port,'127.0.0.1',()=>console.log(`SYNTHETIC EXPERIENCE FIXTURE http://127.0.0.1:${port}`));
for(const sig of ['SIGINT','SIGTERM'])process.once(sig,async()=>{server.close();await app.close();await redis.close();process.exit(0)});
