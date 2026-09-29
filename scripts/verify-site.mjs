import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { setTimeout } from "node:timers/promises";
import { createHash } from "node:crypto";
const base = process.env.TEST_BASE_URL ?? "http://127.0.0.1:3101";
const indexable = process.env.EXPECT_INDEXABLE === "true";
const canonicalOrigin = process.env.EXPECT_CANONICAL_ORIGIN ?? "https://michaelpgibb.com";
const names = ["marketing-incrementality", "revenue-forecasting", "customer-value", "operational-planning"];
const server = process.argv.includes("--start") ? spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", "3101"], { stdio: "inherit" }) : null;
try {
  if (server) {
    let ready = false;
    for (let i=0;i<60;i++) {
      if(server.exitCode !== null) throw new Error("Server exited before readiness");
      try { if((await fetch(base)).ok) { ready=true; break; } } catch {}
      await setTimeout(500);
    }
    assert(ready);
  }
  const titles = new Set();
  const checkedStyles = new Set();
  for (const path of ["/", "/research", ...names.map(name=>`/projects/${name}`)]) {
    const response = await fetch(new URL(path,base));
    assert.equal(response.status,200,path);
    const html = await response.text();
    const styles = [...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>/g)]
      .map(match => match[0].match(/href="([^"]+)"/)?.[1]).filter(Boolean);
    assert(styles.length, `Stylesheet missing: ${path}`);
    for (const href of styles) {
      if (checkedStyles.has(href)) continue;
      const stylesheet = await fetch(new URL(href.replaceAll('&amp;', '&'), base));
      assert.equal(stylesheet.status, 200, `Stylesheet: ${href}`);
      const css = await stylesheet.text();
      for (const selector of ['.research-menu', '.research-dropdown', '.collection-grid', '.executive-summary']) {
        assert(css.includes(selector), `Published stylesheet is missing ${selector}`);
      }
      checkedStyles.add(href);
    }
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
    assert(title?.includes("Michael P. Gibb")); titles.add(title);
    assert.match(html, /<meta name="description" content="[^"]+"/);
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
    assert(canonical); assert.equal(new URL(canonical).href,new URL(path,canonicalOrigin).href);
    assert.match(html,/href="mailto:mike@michaelpgibb.com"/);
    assert.match(html,/https:\/\/www.linkedin.com\/in\/mp-gibb\//);
    assert.match(html,/id="main"/);assert.match(html,/Skip to content/);
    assert.match(html,indexable ? /name="robots" content="index, follow"/ : /name="robots" content="noindex, nofollow"/);
    if(!indexable) assert.match(response.headers.get("x-robots-tag")??"",/noindex/);
    else assert(!response.headers.get("x-robots-tag")?.includes("noindex"));
    if(path.startsWith("/projects/")) {
      let last=-1;
      for(const id of ["executive-summary","decision","implication","evidence","data","methodology","limitations","code"]) {const position=html.indexOf(`id="${id}"`);assert(position>last,`Section order: ${id}`);last=position;}
      const slug=path.split('/').pop();
      assert.match(html,/Evaluated synthetic demonstration/);
      assert.match(html,/independent technical review is pending/);
      assert.match(html,/EXECUTIVE SUMMARY/);
      assert(!html.includes('Planned research'));
      assert.match(html,slug===names[0] ? /data-testid="incrementality-explorer"/ : /data-testid="commercial-evidence"/);
      assert(html.includes(`https://github.com/mpgibb/${slug}`));
      assert(html.includes(`/downloads/${slug}.zip`));
    } else if (path === "/research") {
      for(const id of ["commercial","sports","other-industries"]) assert(html.includes(`id="${id}"`));
      assert.match(html,/Future collection/);
      for(const name of names) assert(html.includes(`/projects/${name}`));
    } else {
      assert.match(html,/growth and better business decisions/);
      for(const name of names) assert(html.includes(`/projects/${name}`));
    }
    console.log(`PASS ${path}: metadata, contact, status, section order and indexing`);
  }
  assert.equal(titles.size,6);
  const manifest=await (await fetch(new URL('/downloads/manifest.json',base))).json();
  assert.equal(manifest.length,4);
  for(const item of manifest) {
    assert(names.includes(item.project));
    assert.match(item.commit,/^[a-f0-9]{40}$/);
    assert.equal(item.repository,`https://github.com/mpgibb/${item.project}`);
    const response=await fetch(new URL(`/downloads/${item.filename}`,base));assert.equal(response.status,200);
    const bytes=Buffer.from(await response.arrayBuffer());assert.equal(bytes.subarray(0,2).toString(),'PK');
    assert.equal(createHash('sha256').update(bytes).digest('hex'),item.sha256);
    console.log(`PASS download ${item.filename}: ZIP and SHA-256`);
  }
  for(const name of names.slice(1)) {
    const resultResponse=await fetch(new URL(`/downloads/${name}-results.json`,base));assert.equal(resultResponse.status,200);
    const study=await resultResponse.json();assert.equal(study.synthetic,true);assert.equal(study.study,name);assert.equal(study.scenarios.length,3);
    assert(Object.keys(study.source_hashes).length>=7);assert(Object.keys(study.data_hashes).length>=6);
  }
  const result=await(await fetch(new URL('/downloads/marketing-results.json',base))).json();assert.equal(result.synthetic,true);assert.equal(result.truth,8);assert.equal(result.config.customers,6000);
  // Pass retired URLs through the local audit environment, keeping obsolete
  // project names and content out of the published source and instructions.
  const removed=(process.env.RETIRED_PATHS??'').split(',').filter(Boolean);
  for(const path of ['/projects/not-a-project','/missing-page',...removed]) {
    const response=await fetch(new URL(path,base),{redirect:'manual'});
    assert([404,410].includes(response.status),`Removed/unknown route ${path}: ${response.status}`);
    assert(!response.headers.get('location'));console.log(`PASS unavailable route ${path}`);
  }
  assert.match(await(await fetch(new URL('/favicon.svg',base))).text(),/<svg/);
  const robots=await(await fetch(new URL('/robots.txt',base))).text();
  assert.match(robots,indexable ? /Allow: \// : /Disallow: \//);
  const sitemap=await(await fetch(new URL('/sitemap.xml',base))).text();
  assert.equal((sitemap.match(/<loc>/g)??[]).length,indexable?6:0);
  if(indexable) {assert(robots.includes(`Sitemap: ${canonicalOrigin}/sitemap.xml`));for(const name of names) assert(sitemap.includes(`${canonicalOrigin}/projects/${name}`));}
  console.log('PASS published stylesheets, results, favicon, robots, sitemap and removed URLs');
} finally {server?.kill('SIGTERM');}
