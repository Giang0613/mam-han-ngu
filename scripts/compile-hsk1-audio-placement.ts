import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import audioIndex from '../src/lib/hsk/material-audio-index.json';
import type {NativeMaterialBlock,NativeMaterialPage} from '../src/lib/hsk/materials-catalog';

// Placement is separate from lesson content: moving a player must never
// rewrite Chinese, translations, headings, pinyin or saved answer keys.
const root='data/hsk1-materials';
const source=JSON.parse(fs.readFileSync(`${root}/editorial/audio-alignment-audit.json`,'utf8')) as {anchors:{lesson:number;track:number;page:number;row:number}[]};
const placements:{audioId:string;pageId:string;blockId:string}[]=[];
const evidence:{audioId:string;pageId:string;blockId:string;title:string;method:string;markerPage:number;markerRow:number}[]=[];
const removedRepeats:{audioId:string;pageId:string;keptPageId:string}[]=[];
const contentHashes:Record<string,string>={};
for(const audio of audioIndex.filter(a=>a.id!=='01-1')){
 const anchor=source.anchors.find(a=>a.lesson===audio.lesson&&a.track===audio.track)!;
 assert.ok(anchor,`${audio.id}: missing source marker`);
 const candidates:{pageId:string;blockId:string;title:string;method:string;spokenTurns:number}[]=[];
 for(const n of audio.pages){
  const pageId=`textbook-${String(n).padStart(3,'0')}`,bytes=fs.readFileSync(`${root}/native/${pageId}.json`);
  contentHashes[pageId]=createHash('sha256').update(bytes).digest('hex');
  const page=JSON.parse(bytes.toString()) as NativeMaterialPage;
  const blocks=page.blocks.filter(b=>b.practiceMode!=='with-others');
  let target:NativeMaterialBlock|undefined,method:string;
  if(audio.kind==='vocabulary'){
   target=blocks.find(b=>b.kind==='vocabulary');method='adjacent word group';
  }else if(audio.kind==='phonetics'){
   target=blocks.find(b=>b.kind==='phonetics');method='tone-reading section';
  }else if(n===anchor.page){
   // A page can start with the previous dialogue's vocabulary or a grammar
   // drill. The numbered source section, not the first dialogue, owns audio.
   const named=new RegExp(`hội thoại ${audio.section}(?:\\D|$)`,'i');
   target=blocks.find(b=>b.kind==='dialogue'&&named.test(b.title));
   method='numbered dialogue section';
   if(!target){target=blocks.find(b=>b.items.some(i=>i.id===`${pageId}-${anchor.row}`));method='explicit listening marker';}
   if(!target){target=blocks.find(b=>named.test(b.title));method='authored listening section';}
  }else{
   // Continuations may have a separate sidebar halfway through the dialogue.
   // Attach to its beginning, preserving the existing text and block order.
   target=blocks.find(b=>b.kind==='dialogue')||blocks.find(b=>b.items.some(i=>i.speaker||i.role==='utterance'));
   method='dialogue continuation';
  }
  if(audio.id==='03-3'&&n===27){
   // The existing photo dialogue is under Ghi nhớ. Move only its player;
   // preserve that heading and every line exactly as requested.
   target=blocks.find(b=>b.items.some(i=>i.id==='textbook-027-25'));
   method='photo-dialogue turns on the existing page';
  }
  assert.ok(target,`${audio.id} / ${pageId}: no visible source-related section`);
  const spokenTurns=blocks.flatMap(b=>b.items.filter(i=>i.practiceMode!=='with-others')).filter(i=>i.speaker||i.role==='utterance').length;
  candidates.push({pageId,blockId:target.id,title:target.title,method,spokenTurns});
 }
 let kept=candidates[0];
 if(candidates.length>1){
  // Source markers can be printed on the setup page while every spoken turn
  // is on the next page. Show the recording once, beside those turns only.
  const dialoguePages=candidates.filter(c=>c.spokenTurns>0);
  assert.equal(audio.kind,'dialogue',`${audio.id}: review repeated non-dialogue audio manually`);
  assert.equal(dialoguePages.length,1,`${audio.id}: review dialogue split across multiple content pages manually`);
  kept=dialoguePages[0];
  for(const c of candidates.filter(c=>c!==kept))removedRepeats.push({audioId:audio.id,pageId:c.pageId,keptPageId:kept.pageId});
 }
 assert.ok(kept,`${audio.id}: no placement`);
 placements.push({audioId:audio.id,pageId:kept.pageId,blockId:kept.blockId});
 evidence.push({audioId:audio.id,pageId:kept.pageId,blockId:kept.blockId,title:kept.title,method:kept.method,markerPage:anchor.page,markerRow:anchor.row});
}
assert.equal(new Set(placements.map(p=>p.audioId)).size,92);
assert.equal(placements.length,92,'Each recording has one location throughout the course');
fs.writeFileSync('src/lib/hsk/material-audio-placement.json',JSON.stringify(placements,null,2)+'\n');
fs.writeFileSync(`${root}/editorial/audio-placement-audit.json`,JSON.stringify({method:'One player per recording, beside lesson content. Repeated setup-page players omitted; lesson text and original source associations unchanged.',recordings:92,placements:placements.length,removedRepeatedPlacements:removedRepeats.length,contentHashes,evidence,removedRepeats},null,2)+'\n');
console.log(`PASS: ${placements.length} unique recording locations; ${removedRepeats.length} repeated setup-page players removed. No lesson text changed.`);
