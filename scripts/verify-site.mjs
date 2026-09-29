import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { setTimeout } from "node:timers/promises";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
const catalog = JSON.parse(readFileSync(new URL("../lib/program-catalog.json", import.meta.url), "utf8"));
const published = catalog.filter(study => study.publicationStatus === "published");
const agenda = catalog.filter(study => study.publicationStatus !== "published");
assert.equal(catalog.length, 60);
assert.equal(new Set(catalog.map(study => study.industry)).size, 20);
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
  const logo = await fetch(new URL('/brand/michael-gibb-skyline-copper-base.svg', base));
  assert.equal(logo.status, 200);
  assert.equal(createHash('sha256').update(Buffer.from(await logo.arrayBuffer())).digest('hex'),
    'fc30bbe6b2bd0789241a97396d0cddb14fe072bbeed8ccd2a4dbf047c47197b0', 'Published logo must match the supplied SVG byte for byte');
  console.log('PASS exact supplied skyline logo');
  const titles = new Set();
  const checkedStyles = new Set();
  for (const path of ["/", "/research", "/privacy", "/terms", ...names.map(name=>`/projects/${name}`), ...published.map(study=>`/research/${study.slug}`)]) {
    const response = await fetch(new URL(path,base));
    assert.equal(response.status,200,path);
    const html = await response.text();
    const iconTags = [...html.matchAll(/<link\b[^>]*rel="(?:icon|shortcut icon|apple-touch-icon)"[^>]*>/g)].map(match=>match[0]);
    const iconPaths = iconTags.map(tag=>new URL(tag.match(/href="([^"]+)"/)[1].replaceAll('&amp;', '&'),base).pathname).sort();
    assert.deepEqual(iconPaths, ['/apple-icon.png','/favicon.ico','/icon.svg'], `Icon metadata: ${path}`);
    assert(iconTags.some(tag=>tag.includes('rel="apple-touch-icon"')&&tag.includes('sizes="180x180"')));
    const styles = [...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>/g)]
      .map(match => match[0].match(/href="([^"]+)"/)?.[1]).filter(Boolean);
    assert(styles.length, `Stylesheet missing: ${path}`);
    for (const href of styles) {
      if (checkedStyles.has(href)) continue;
      const stylesheet = await fetch(new URL(href.replaceAll('&amp;', '&'), base));
      assert.equal(stylesheet.status, 200, `Stylesheet: ${href}`);
      const css = await stylesheet.text();
      for (const selector of ['.research-menu', '.industry-panel', '.collection-grid', '.executive-summary', '.catalog-filters', '.program-explorer']) {
        assert(css.includes(selector), `Published stylesheet is missing ${selector}`);
      }
      checkedStyles.add(href);
    }
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
    assert(title?.includes("Michael P. Gibb")); titles.add(title);
    assert.match(html, /<meta name="description" content="[^"]+"/);
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
    assert(canonical); assert.equal(new URL(canonical).href,new URL(path,canonicalOrigin).href);
    assert(!/mailto:|[a-z0-9._%+-]+@michael(?:paul|p)gibb\.com/i.test(html), `No public contact address: ${path}`);
    assert.match(html, /href="\/#contact"/);
    assert.match(html, /href="\/privacy"/);
    assert.match(html, /href="\/terms"/);
    assert.equal((html.match(/<footer class="site-footer"/g) ?? []).length, 1);
    assert.match(html,/https:\/\/www.linkedin.com\/in\/mp-gibb\//);
    assert.match(html,/id="main"/);assert.match(html,/Skip to content/);
    assert.equal((html.match(/<header class="site-header"/g) ?? []).length, 1, `One shared header: ${path}`);
    assert.match(html,/class="wordmark-tagline">Analytics <span>•<\/span> AI <span>•<\/span> Leadership/);
    assert.match(html, /src="\/brand\/michael-gibb-skyline-copper-base\.svg"/, `Approved logo: ${path}`);
    assert(!html.includes("CHICAGO • OPEN TO REMOTE"), `Removed hero line: ${path}`);
    assert.match(html,/aria-label="Open navigation" aria-expanded="false" aria-controls="main-navigation"/);
    assert.match(html,indexable ? /name="robots" content="index, follow"/ : /name="robots" content="noindex, nofollow"/);
    if(!indexable) assert.match(response.headers.get("x-robots-tag")??"",/noindex/);
    else assert(!response.headers.get("x-robots-tag")?.includes("noindex"));
    if(path.startsWith("/projects/") || path.startsWith("/research/")) {
      assert.equal((html.match(/id="interactive-results"/g) ?? []).length, 1, `Single explorer anchor: ${path}`);
      assert.match(html, /href="#interactive-results">Explore the interactive results/);
      assert.match(html, /aria-label="Case study contents"/);
      assert.match(html, /class="study-next-steps"/);
    }
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
    } else if (path.startsWith("/research/")) {
      let last=-1;
      for(const id of ["decision","implication","evidence","data","method","code"]) {const position=html.indexOf(`id="${id}"`); assert(position>last,`Program section order: ${id}`); last=position;}
      assert.match(html,/Evaluated public-data study/);
      const study=published.find(item=>path===`/research/${item.slug}`);
      assert(study);
      if(study.id==="S28") assert.match(html,/data-testid="contact-priority-evidence"/);
      if(study.id==="S47") { assert.match(html,/data-testid="telecom-evidence"/); assert.match(html,/90 \/ 94/); assert.match(html,/0.0981/); assert.match(html,/0.1576/); assert.match(html,/4,072/); }
      if(study.id==="S03") { assert.match(html,/data-testid="customer-return-evidence"/); assert.match(html,/14,388/); assert.match(html,/0.990/); assert.match(html,/1.072/); assert.match(html,/0.68 percentage/); }
      if(study.id==="S31") { assert.match(html,/data-testid="insurance-evidence"/); assert.match(html,/136,271/); assert.match(html,/€147.76/); assert.match(html,/77.894/); }
      if(study.id==="S13") { assert.match(html,/data-testid="inspection-evidence"/); assert.match(html,/0.0626/); assert.match(html,/0.0765/); assert.match(html,/4 \/ 22/); }
      if(study.id==="S43") { assert.match(html,/data-testid="property-evidence"/); assert.match(html,/17.29%/); assert.match(html,/70.1%/); assert.match(html,/24,551/); }
      if(study.id==="S58") { assert.match(html,/data-testid="workflow-evidence"/); assert.match(html,/8.72 days/); assert.match(html,/8.58 days/); assert.match(html,/2,365/); }
      if(study.id==="S04") { assert.match(html,/data-testid="advertising-evidence"/); assert.match(html,/9.78/); assert.match(html,/9.86/); assert.match(html,/398,506/); }
      if(study.id==="S02") { assert.match(html,/data-testid="inventory-evidence"/); assert.match(html,/17.4%/); assert.match(html,/7,775.46/); assert.match(html,/0.8049/); }
      assert.match(html,/application\/ld\+json/);
      if(study.id==="S28") { assert.match(html,/934/); assert.match(html,/843/); assert.match(html,/0.0822/); }
      assert(html.includes(`/downloads/research/${study.id}.json`));
    } else if (path === "/research") {
      assert.match(html,/data-testid="research-catalog"/);
      assert(!html.includes("Research agenda"));
      assert(!html.includes("Original dataset selection position"));
      assert(!html.includes("of 60</strong>"));
      assert.match(html,/20/);
      for(const study of published) assert(html.includes(`/research/${study.slug}`));
      for(const study of agenda) assert(!html.includes(`href="/research/${study.slug}"`));
      for(const name of names) assert(html.includes(`/projects/${name}`));
    } else if (path === "/") {
      assert.match(html,/Analytics and AI leadership for <span class="hero-emphasis">growth and better business decisions\.<\/span>/);
      assert.match(html,/Statistical rigor\. Technical leadership\. Commercial impact\./);
      assert.match(html,/href="\/#work">Explore my work/);
      assert.match(html,/href="\/#contact">Get in touch/);
      assert.match(html,/class="signal-field"/);
      assert.match(html,/Pause animation/);
      assert.match(html,/S02 \/ FEATURED/);
      const curated=published.filter(study=>["S02","S28","S04","S58","S43","S13"].includes(study.id));
      assert(curated.length>=4&&curated.length<=6);
      for(const study of curated) assert(html.includes(`/research/${study.slug}`));
      assert(html.includes('href="/research"'));
    }
    console.log(`PASS ${path}: metadata, contact, status, section order and indexing`);
  }
  for (const industry of [...new Set(catalog.map(study => study.industry))]) {
    const response = await fetch(new URL(`/research?industry=${encodeURIComponent(industry)}&status=all`, base));
    assert.equal(response.status, 200);
    const html = await response.text();
    const cards = [...html.matchAll(/data-study-id="(S[0-9]{2})"/g)].map(match => match[1]);
    assert.deepEqual(cards.sort(), catalog.filter(study => study.industry === industry).map(study => study.id).sort(), `Industry collection: ${industry}`);
    assert(!html.includes('Research agenda'));
  }
  console.log('PASS all 20 industry destinations include their actual published and unfinished topics');
  assert.equal(titles.size,8+published.length);
  for (const study of published) {
    const response = await fetch(new URL(`/downloads/research/${study.resultFile}`,base)); assert.equal(response.status,200);
    const bytes=Buffer.from(await response.arrayBuffer());
    const expected=readFileSync(new URL(`../lib/program-results/${study.resultFile}`,import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),createHash('sha256').update(expected).digest('hex'));
    const result=JSON.parse(bytes); assert.equal(result.study_id,study.id); assert.match(result.code_version,/^[a-f0-9]{40}$/);
    assert.equal(study.executionStatus,'evaluated'); assert(study.codeUrl);
    console.log(`PASS ${study.id}: published result matches validated local artifact`);
  }
  for (const study of agenda) {
    const response=await fetch(new URL(`/research/${study.slug}`,base),{redirect:'manual'});
    assert.equal(response.status,404,`Unpublished study ${study.id}`);
  }
  console.log(`PASS ${agenda.length} unpublished study routes return 404`);
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
  const iconAssets = [
    ['/favicon.ico','app/favicon.ico',/image\/(?:x-icon|vnd\.microsoft\.icon)/],
    ['/icon.svg','app/icon.svg',/image\/svg\+xml/],
    ['/apple-icon.png','app/apple-icon.png',/image\/png/],
    ...[16,32,192,512].map(size=>[`/icons/favicon-${size}x${size}.png`,`public/icons/favicon-${size}x${size}.png`,/image\/png/]),
  ];
  for(const [url,file,type] of iconAssets) {
    const response=await fetch(new URL(url,base),{redirect:'manual'});
    assert.equal(response.status,200,`Icon URL: ${url}`);
    assert.match(response.headers.get('content-type')??'',type);
    const bytes=Buffer.from(await response.arrayBuffer());
    const expected=readFileSync(new URL(`../${file}`,import.meta.url));
    assert.deepEqual(bytes,expected,`Icon bytes: ${url}`);
  }
  assert.equal((await fetch(new URL('/favicon.svg',base),{redirect:'manual'})).status,404);
  console.log('PASS seven icon assets: exact bytes, content types, consistent metadata and retired SVG exclusion');
  const robots=await(await fetch(new URL('/robots.txt',base))).text();
  assert.match(robots,indexable ? /Allow: \// : /Disallow: \//);
  const sitemap=await(await fetch(new URL('/sitemap.xml',base))).text();
  assert.equal((sitemap.match(/<loc>/g)??[]).length,indexable?8+published.length:0);
  if(indexable) {assert(robots.includes(`Sitemap: ${canonicalOrigin}/sitemap.xml`));for(const name of names) assert(sitemap.includes(`${canonicalOrigin}/projects/${name}`));}
  for(const study of agenda) assert(!sitemap.includes(`/research/${study.slug}`));
  if(indexable) for(const study of published) assert(sitemap.includes(`${canonicalOrigin}/research/${study.slug}`));
  console.log('PASS published stylesheets, results, favicon, robots, sitemap and removed URLs');
} finally {server?.kill('SIGTERM');}
