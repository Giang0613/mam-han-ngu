import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {bookAudioTracks,playableBookAudio} from '../src/lib/hsk/book-audio';

assert.equal(bookAudioTracks.length,584);
assert.equal(bookAudioTracks.filter(a=>a.collection==='textbook').length,93);
assert.equal(bookAudioTracks.filter(a=>a.collection==='workbook').length,491);
assert.equal(new Set(bookAudioTracks.map(a=>a.id)).size,584);
assert.equal(new Set(bookAudioTracks.map(a=>a.url)).size,584);
assert.equal(playableBookAudio.length,583);
assert.ok(!playableBookAudio.some(a=>a.id==='01-1'));
for(const track of bookAudioTracks){
 assert.ok(track.lesson>=1&&track.lesson<=16,track.id);
 assert.match(track.url,/^\/hsk1-materials\/(?:audio|workbook-audio)\/[a-zA-Z0-9-]+\.mp3$/);
 const file=path.join('public',track.url.slice(1));
 const bytes=fs.readFileSync(file);
 assert.ok(bytes.length>1000&&bytes.length<100_000_000,file);
 assert.ok(bytes.subarray(0,3).toString()==='ID3'||(bytes[0]===255&&(bytes[1]&224)===224),'Not an MP3 header: '+file);
 if(track.collection==='workbook')assert.ok(track.duration!>0,track.id);
}
const manifest=JSON.parse(fs.readFileSync('EXPORT-MANIFEST.json','utf8'));
const exported=new Set<string>(manifest.files.map((file:{path:string})=>file.path));
for(const track of bookAudioTracks)assert.ok(exported.has('public'+track.url));
for(const file of ['textbook.pdf','workbook.pdf','writing.pdf'])assert.ok(exported.has('public/hsk1-materials/'+file));
assert.equal([...exported].filter(file=>file.startsWith('public/hsk1-materials/pages/')&&file.endsWith('.webp')).length,298);
assert.ok(exported.has('src/lib/hsk/material-answer-keys.json'));
assert.ok(exported.has('src/components/study/Hsk1Materials.tsx'));
assert.match(fs.readFileSync('README.md','utf8'),/Cre:Thompson HSK 3\.0/);
assert.match(fs.readFileSync('README.md','utf8'),/Experimental preview/);
assert.doesNotMatch(fs.readFileSync('src/app/layout.tsx','utf8'),/ExperimentalNotice/);
console.log(JSON.stringify({audioFiles:584,playable:583,checks:'unique audio URLs, actual MP3 files, expected counts, archived recording preference, included PDFs/book images/answers with personal-data exclusion, and GitHub-only experimental notice passed'}));
