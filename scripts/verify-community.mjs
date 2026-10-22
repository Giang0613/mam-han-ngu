import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';

const manifest=JSON.parse(await fs.readFile('EXPORT-MANIFEST.json','utf8'));
assert.equal(manifest.edition,'community');
assert.equal(manifest.hsk30Credit,'Cre:Thompson HSK 3.0');
const privatePath=/(^|\/)(?:\.git|node_modules|\.cache|__pycache__|recordings)(\/|$)|(?:^|\/)\.env(?!\.example$)|\.(?:db|sqlite|sqlite3)(?:-|$)|\.(?:pem|key|p12|pfx|pyc|log|tsbuildinfo)$/i;
const names=new Set();
for(const name of ['local.db','local.db-wal','.env.local','.cache/model.bin','recordings/personal.webm','node_modules/package/index.js'])assert.ok(privatePath.test(name),'Private path guard failed: '+name);
assert.ok(!privatePath.test('.env.example'));
for(const item of manifest.files){
 assert.ok(!names.has(item.path),'Duplicate file: '+item.path);names.add(item.path);
 assert.ok(!path.isAbsolute(item.path)&&!item.path.includes('\\')&&!item.path.split('/').includes('..'),'Unsafe path');
 assert.ok(!privatePath.test(item.path),'Private file: '+item.path);
 assert.ok(!item.path.startsWith('data/i18n-private'),'Use the published book translation catalog');
 const data=await fs.readFile(item.path);
 assert.equal(createHash('sha256').update(data).digest('hex'),item.sha256,'Changed source: '+item.path);
}
const readJson=async name=>JSON.parse(await fs.readFile(name,'utf8'));
assert.equal((await readJson('data/hsk-vocabulary.json')).length,manifest.resources.vocabularyEntries);
assert.equal((await readJson('data/hsk-vocabulary-lessons.json')).length,manifest.resources.vocabularyLessons);
assert.equal([...names].filter(name=>name.endsWith('.mp3')).length,manifest.resources.audioFiles);
assert.equal([...names].filter(name=>/^public\/hsk1-materials\/[^/]+\.pdf$/.test(name)).length,manifest.resources.bookPdfs);
assert.equal([...names].filter(name=>/^public\/hsk1-materials\/reference\/[^/]+\.pdf$/.test(name)).length,manifest.resources.publisherReferencePdfs);
assert.equal([...names].filter(name=>name.startsWith('public/hsk1-materials/pages/')&&name.endsWith('.webp')).length,manifest.resources.bookPageImages);
for(const file of ['LICENSE','THIRD_PARTY_NOTICES.md','CREDITS.md','docs/RESOURCE_SOURCES.md','public/hanzi/LICENSE.txt','public/fonts/OFL-Manrope.txt','data/cedict-source.txt','data/cedict-meta.json','data/materials.en.json','src/lib/hsk/material-answer-keys.json'])assert.ok(names.has(file),'Missing source or notice: '+file);
const env=await fs.readFile('.env.example','utf8');
assert.ok(!env.split(/\r?\n/).some(line=>/^\s*[A-Z_][A-Z0-9_]*\s*=\s*\S/.test(line)));
assert.match(await fs.readFile('src/lib/edition.ts','utf8'),/HAS_IMPORTED_MATERIALS = true/);
assert.match(await fs.readFile('README.md','utf8'),/Cre:Thompson HSK 3\.0/);
console.log(JSON.stringify({files:names.size,...manifest.resources,checks:'all source hashes, full HSK resources, credit, licenses, blank environment and personal-data exclusion passed'}));
