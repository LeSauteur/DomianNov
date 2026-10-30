import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { showcases } from './catalog-showcase.mjs';
const dirs=['.','districts','objects'];
const pages=dirs.flatMap(dir=>fs.readdirSync(dir).filter(f=>f.endsWith('.html')).map(f=>dir==='.'?f:dir+'/'+f));
let links=0;
const styles=new Set();
const errors=[];
for(const file of pages){
  const html=fs.readFileSync(file,'utf8');
  assert.match(html,/<html lang="ru">/,file+': language');
  assert.match(html,/<title>[^<]+<\/title>/,file+': title');
  if(file!=='presentation.html'){
    assert.equal((html.match(/<header /g)||[]).length,1,file+': one header');
    assert.equal((html.match(/<h1[ >]/g)||[]).length,1,file+': one h1');
    assert.match(html,/<main id="main-content"/,file+': skip target');
  }
  for(const m of html.matchAll(/(?:href|src)="([^"]+)"/g)){
    const link=m[1].replaceAll('&amp;','&');
    if(/^(?:https?:|tel:|mailto:|data:)/.test(link))continue;
    links++;
    const u=new URL(link,'https://local.test/'+file);
    const dest=decodeURIComponent(u.pathname).replace(/^\//,'');
    const resolved=dest.endsWith('/')?dest+'index.html':dest||'index.html';
    if(!fs.existsSync(resolved)){errors.push(`${file}: missing ${link}`);continue;}
    if(resolved.endsWith('.css'))styles.add(resolved);
    if(u.hash&&resolved.endsWith('.html')){
      const target=fs.readFileSync(resolved,'utf8');
      const id=decodeURIComponent(u.hash.slice(1));
      if(!target.includes(`id="${id}"`))errors.push(`${file}: missing anchor ${link}`);
    }
  }
}
let cssAssets=0;
for(const file of styles){
  const css=fs.readFileSync(file,'utf8');
  for(const match of css.matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/g)){
    const asset=match[2];
    if(/^(?:https?:|data:|#)/.test(asset))continue;
    cssAssets++;
    const dest=path.resolve(path.dirname(file),decodeURIComponent(asset));
    if(!fs.existsSync(dest))errors.push(`${file}: missing CSS resource ${asset}`);
  }
}
const sandbox={window:{}};vm.runInNewContext(fs.readFileSync('assets/js/place-data.js','utf8'),sandbox);
const data=sandbox.window.PLACE_DATA;
assert.equal(new Set(data.properties.map(p=>p.id)).size,data.properties.length,'unique listing IDs');
const sitemap=fs.readFileSync('sitemap.xml','utf8');
for(const format of showcases){
  const file=`objects/format-${format.id}.html`;
  assert.match(fs.readFileSync(file,'utf8'),/name="robots" content="noindex,follow"/,file+': illustrative format must not be indexed as a listing');
  assert(!sitemap.includes(file),file+': illustrative format excluded from sitemap');
}
for(const file of ['index.html','contacts.html']){
  const html=fs.readFileSync(file,'utf8');
  assert.equal((html.match(/id="administrator-title"/g)||[]).length,1,file+': exactly one administrator section');
  assert.match(html,/href="tel:\+79613213989"/,file+': administrator telephone');
  assert.match(html,/src="assets\/images\/team\/anastasia\.png"/,file+': supplied administrator portrait');
}
for(const p of data.properties){
  assert(p.price>0&&Number.isFinite(p.price),'source price is numeric');
  assert.match(p.source,/^https:\/\/(?:www\.|rostov\.)?cian\.ru\//,'source URL');
  assert.equal(p.verified,false,'source imports require owner confirmation');
  const html=fs.readFileSync(`objects/${p.id}.html`,'utf8');
  assert.match(html,/name="robots" content="noindex,follow"/,'unconfirmed source page must be noindex');
  assert(!sitemap.includes(`objects/${p.id}.html`),'unconfirmed source excluded from sitemap');
}
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log(`PASS: ${pages.length} pages; ${links} local links/assets/anchors; ${cssAssets} CSS resources; ${data.properties.length} source records; indexing safeguards.`);
