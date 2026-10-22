import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';

const root=process.cwd();
const manifest=JSON.parse(await fs.readFile('EXPORT-MANIFEST.json','utf8'));
assert.equal(manifest.edition,'community');
const names=new Set();
for(const item of manifest.files){
 assert.ok(!names.has(item.path),`Duplicate file: ${item.path}`);names.add(item.path);
 assert.ok(!item.path.includes('\\')&&!item.path.split('/').includes('..')&&!path.isAbsolute(item.path),'Unsafe manifest path');
 assert.ok(!/(^|\/)(?:\.git|node_modules|\.cache|__pycache__)(\/|$)|\.db(?:-|$)|\.pdf$|\.pyc$|\.env\.(?!example$)/i.test(item.path),`Private resource: ${item.path}`);
 assert.ok(!item.path.startsWith('data/hsk1-materials/'),'Book pages and answer data must remain excluded');
 if(item.path.startsWith('public/hsk1-materials/')||item.path.endsWith('.mp3'))assert.match(item.path,/^public\/hsk1-materials\/(?:audio|workbook-audio)\/[a-zA-Z0-9-]+\.mp3$/);
 assert.ok(!/\/material-(?:answer-(?:keys|layout)|audio-placement)\.json$/.test(item.path),'Book answer keys and page layouts must remain excluded');
 assert.ok(!item.path.startsWith('data/i18n-private'),'Personal translations must remain private');
 const data=await fs.readFile(path.join(root,item.path));
 assert.equal(createHash('sha256').update(data).digest('hex'),item.sha256,`Changed source: ${item.path}`);
}
const entries=JSON.parse(await fs.readFile('data/hsk-vocabulary.json','utf8'));
const lessons=JSON.parse(await fs.readFile('data/hsk-vocabulary-lessons.json','utf8'));
assert.equal(entries.length,manifest.resources.vocabularyEntries);
assert.equal(lessons.length,manifest.resources.vocabularyLessons);
assert.equal([...names].filter(name=>name.endsWith('.mp3')).length,manifest.resources.audioFiles);
const env=await fs.readFile('.env.example','utf8');assert.ok(!env.split(/\r?\n/).some(line=>/^\s*[A-Z_][A-Z0-9_]*\s*=\s*\S/.test(line)));
for(const file of ['LICENSE','THIRD_PARTY_NOTICES.md','docs/RESOURCE_SOURCES.md','public/hanzi/LICENSE.txt','public/fonts/OFL-Manrope.txt','data/cedict-source.txt','data/cedict-meta.json'])assert.ok(names.has(file),`Missing attribution: ${file}`);
assert.match(await fs.readFile('src/lib/edition.ts','utf8'),/HAS_IMPORTED_MATERIALS = false/);
assert.match(await fs.readFile('src/app/layout.tsx','utf8'),/Mầm Hán Ngữ/);
console.log(JSON.stringify({files:names.size,vocabulary:entries.length,lessons:lessons.length,audio:manifest.resources.audioFiles,checks:'source hashes, requested vocabulary/audio, excluded PDFs/book pages/answers, blank environment, provenance and community edition passed'}));
