import fs from 'node:fs';
import path from 'node:path';
import {searchKey} from './course';
import {vocabularyCorpus,vocabularyMatches} from './hsk/vocabulary-server';
import type {WritingCharacter,WritingDetail,WritingIndex} from './writing-types';
let cached:WritingCharacter[]|undefined;
export function writingCharacters(){return cached??=JSON.parse(fs.readFileSync(path.join(process.cwd(),'data','writing-characters.json'),'utf8')) as WritingCharacter[];}
export function writingDetail(character:string):WritingDetail|undefined{
 const entry=writingCharacters().find(item=>item.character===character);if(!entry)return;
 return {...entry,examples:entry.wordIds.map(id=>{const word=vocabularyCorpus().byId.get(id)!;return {id:word.id,hanzi:word.hanzi,pinyin:word.pinyin,meaning:word.meaning};})};
}
export function searchWriting(q='',level=0,strokes=0,page=0):WritingIndex{
 const all=writingCharacters(),key=searchKey(q);
 const phonetic=/[1-5üǖǘǚǜ:]/i.test(q);
 const matches=q?new Set(vocabularyCorpus().entries.filter(word=>phonetic?!!key&&searchKey(word.pinyin).includes(key):vocabularyMatches(word,q)).flatMap(word=>[...word.hanzi])):undefined;
 const rows=all.filter(item=>(!level||item.levels.includes(level))&&(!strokes||(strokes===16?item.strokes>=16:item.strokes>=strokes&&item.strokes<=strokes+4))&&(!q||q.includes(item.character)||!!key&&item.readings.some(reading=>searchKey(reading).includes(key))||matches!.has(item.character)));
 if(q)rows.sort((a,b)=>Number(q.includes(b.character))-Number(q.includes(a.character))||Number(b.readings.some(reading=>searchKey(reading)===key))-Number(a.readings.some(reading=>searchKey(reading)===key)));
 return {results:rows.slice(page*28,page*28+28),total:rows.length,corpus:all.length,page,hasMore:(page+1)*28<rows.length};
}
