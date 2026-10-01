import fs from 'node:fs';
import crypto from 'node:crypto';
import ts from 'typescript';
const read = p => fs.readFileSync(p, 'utf8');
const catalog = JSON.parse(read('lib/program-catalog.json'));
const projectSource = read('lib/projects.ts').replace('import completedStudies from "./completed-studies.json";', `const completedStudies = ${read('lib/completed-studies.json')};`);
const { projects } = await import(`data:text/javascript;base64,${Buffer.from(ts.transpile(projectSource, { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext })).toString('base64')}`);
function visibleText(file) { const source = ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX); const parts = []; function visit(node) { if (ts.isJsxText(node)) parts.push(node.text.trim()); else if (ts.isJsxExpression(node) && node.expression && ts.isStringLiteral(node.expression)) parts.push(node.expression.text); else if (ts.isJsxAttribute(node) && ['headline', 'finding', 'coverage'].includes(node.name.getText(source)) && node.initializer && ts.isStringLiteral(node.initializer)) parts.push(node.initializer.text); ts.forEachChild(node, visit); } visit(source); return parts.filter(Boolean).join(' ').replace(/\s+/g, ' '); }
const route = read('app/research/[slug]/page.tsx');
const components = Object.fromEntries([...route.matchAll(/import \{ (\w+) \} from "@\/components\/([a-z-]+)"/g)].map(m => [m[1],m[2]]));
const views = Object.fromEntries([...route.matchAll(/study\.id === "(S\d{2})"\) return <(\w+)/g)].map(m => [m[1],components[m[2]]]));
const documents = catalog.filter(s => !['withheld', 'draft'].includes(s.publicationStatus)).map(s => {
  const published = s.publicationStatus === 'published';
  const body = published ? ['Status: Evaluated published study'] : [s.question, 'Status: PLANNED: no published evaluation or findings. The following describes intended work only.', s.methodSummary, s.design, s.evaluation, s.limitations];
  let bounds = '';
  if (published) {
    const result = JSON.parse(read(`lib/program-results/${s.resultFile}`));
    const page = visibleText(`components/${views[s.id]}.tsx`);
    // Published evidence replaces the original proposal, which may describe methods never run.
    bounds = JSON.stringify({ target: result.target, uncertainty: result.uncertainty, assumptions: result.assumptions, limitations: result.limitations });
    body.push(page, JSON.stringify({ data: result.data, models: result.models, metrics: result.metrics, primary_difference: result.tables?.primary_difference }));
  }
  return { id: s.id, title: s.title, publicationStatus: s.publicationStatus, executionStatus: s.executionStatus, updated: s.updated, status: published ? 'Evaluated study' : 'Planned research', url: published ? `https://michaelpgibb.com/research/${s.slug}` : `https://michaelpgibb.com/research?status=agenda#topic-${s.id}`, tags: [s.industry, ...s.methods, s.decisionType], bounds, text: body.join('\n') };
});
for (const p of projects) documents.push({ id: p.slug, title: p.title, status: 'Synthetic demonstration', url: `https://michaelpgibb.com/projects/${p.slug}`, tags: [p.category], text: JSON.stringify({ question: p.question, executive: p.executive, decision: p.decision, method: p.method, data: p.data, evaluation: p.evaluation, assumptions: p.assumptions, limitations: p.limitations }) });
// Biography uses only text already published in the home page, never career files.
const home = read('app/page.tsx'); const about = home.slice(home.lastIndexOf('<section',home.indexOf('id="about"')), home.indexOf('</section>', home.indexOf('id="about"')));
const aboutText = about.replace(/<[^>]*>/g, ' ').replace(/\{[^}]*\}/g, ' ').replace(/\s+/g, ' ').trim();
documents.push({ id: 'biography', title: 'Michael P. Gibb — professional approach', status: 'Published biography', url: 'https://michaelpgibb.com/#about', tags: ['career', 'leadership', 'experience'], text: aboutText });
for (const doc of documents) { if (/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(doc.text)) throw new Error('Email address in knowledge source'); doc.version = crypto.createHash('sha256').update(JSON.stringify(doc)).digest('hex').slice(0, 16); }
const output = JSON.stringify({ version: crypto.createHash('sha256').update(JSON.stringify(documents)).digest('hex'), documents }, null, 2) + '\n';
const target = 'lib/experience/knowledge.json';
if (process.argv.includes('--check')) { if (read(target) !== output) throw new Error('Knowledge source stale: pnpm knowledge:build'); } else fs.writeFileSync(target, output);
console.log(`Knowledge index: ${documents.length} approved public documents; withdrawn/draft excluded.`);
