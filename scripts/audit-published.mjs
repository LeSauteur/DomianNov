import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// Read-only comparison with GitHub Pages. Line endings are normalized for text.
const base = 'https://lesauteur.github.io/DomianNov/';
const pages = ['.', 'districts', 'objects'].flatMap(dir => fs.readdirSync(dir)
  .filter(file => file.endsWith('.html')).map(file => path.posix.join(dir, file)));
const files = new Set(pages);
for (const file of files) {
  if (!/\.(html|css)$/.test(file)) continue;
  const source = fs.readFileSync(file, 'utf8');
  const refs = file.endsWith('.css') ? [...source.matchAll(/url\(['"]?([^)'"\s]+)/g)] : [...source.matchAll(/(?:src|href)="([^"?#]+)/g)];
  for (const [, ref] of refs) {
    if (/^(https?:|tel:|mailto:|data:|#)/.test(ref)) continue;
    const target = path.posix.normalize(path.posix.join(path.posix.dirname(file), ref));
    if (fs.existsSync(target) && fs.statSync(target).isFile()) files.add(target);
  }
}
const queue = [...files];
const results = [];
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
await Promise.all(Array.from({length: 6}, async () => {
  while (queue.length) {
    const file = queue.shift();
    try {
      const response = await fetch(base + encodeURI(file), {signal: AbortSignal.timeout(30000), cache:'no-store'});
      const published = Buffer.from(await response.arrayBuffer());
      const local = fs.readFileSync(file);
      const isText = /\.(html|css|js|svg|xml)$/.test(file);
      const normalize = bytes => isText ? bytes.toString('utf8').replace(/\r\n/g, '\n') : bytes;
      results.push({file, status:response.status, identical:response.ok && digest(normalize(local)) === digest(normalize(published)), byteIdentical:local.equals(published)});
    } catch (error) { results.push({file, identical:false, error:error.message}); }
  }
}));
results.sort((a,b) => a.file.localeCompare(b.file));
const report = {checkedAt:new Date().toISOString(), base, total:results.length, matches:results.filter(r=>r.identical).length, differences:results.filter(r=>!r.identical), results};
if (process.argv[2]) fs.writeFileSync(process.argv[2], JSON.stringify(report, null, 2));
console.log(JSON.stringify({checkedAt:report.checkedAt, base, total:report.total, matches:report.matches, differences:report.differences}, null, 2));
