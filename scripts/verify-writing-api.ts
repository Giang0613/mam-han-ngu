import assert from 'node:assert/strict';
import {writingCharacters} from '../src/lib/writing-server';
const origin=process.env.STUDY_TEST_ORIGIN||'http://127.0.0.1:3000';
async function main(){
 const catalog=writingCharacters();
 for(const locale of ['en','vi']){
  const get=(path:string)=>fetch(origin+path,{headers:{Cookie:'mam_locale='+locale}});
  const response=await get('/api/writing'),index=await response.json();assert.equal(response.status,200);assert.equal(index.corpus,3039);assert.equal(index.results.length,28);assert.equal(index.total,catalog.length);assert.match(response.headers.get('cache-control')||'',/no-store/);
  for(const level of [1,2,3,4,5,6,79]){const response=await get('/api/writing?level='+level),data=await response.json();assert.equal(response.status,200);assert.equal(data.total,catalog.filter(item=>item.levels.includes(level)).length);}
  const responseDetail=await get('/api/writing?character='+encodeURIComponent('学')),detail=await responseDetail.json();assert.equal(responseDetail.status,200);assert.equal(detail.character,'学');assert.ok(detail.examples.length);assert.ok(detail.examples.every((word:{hanzi:string;pinyin:string;meaning:string})=>word.hanzi.includes('学')&&word.pinyin&&word.meaning));
  if(locale==='en')assert.ok(detail.examples.every((word:{meaning:string})=>!/[đĐăĂơƠưƯ\u1ea0-\u1ef9]/u.test(word.meaning)));
  const stroke=await (await get('/api/writing?level=1&strokes=6')).json();assert.ok(stroke.results.every((item:{strokes:number;levels:number[]})=>item.strokes>=6&&item.strokes<=10&&item.levels.includes(1)));
  const female=await (await get('/api/writing?q=nu%3A3')).json();assert.ok(female.results.some((item:{character:string})=>item.character==='女'));
  for(const query of ['level=NaN','level=7','level=10','level=1&level=2','strokes=3','page=-1','page=Infinity','page=1.2','character=','character=abc','character='+encodeURIComponent('你好')]){const response=await get('/api/writing?'+query);assert.equal(response.status,400,query);assert.equal(typeof (await response.json()).error,'string');}
  assert.equal((await get('/api/writing?character='+encodeURIComponent('𠀀'))).status,404);
 }
 for(const character of ['你','女','学','餐','警','赢']){const response=await fetch(origin+'/hanzi/'+encodeURIComponent(character)+'.json');assert.equal(response.status,200,character);const data=await response.json();assert.ok(data.strokes.length&&data.strokes.length===data.medians.length);}
 assert.equal((await fetch(origin+'/hanzi/'+encodeURIComponent('𠀀')+'.json')).status,404);
 console.log('PASS: bilingual writing API, complete corpus counts, HSK/stroke filters, ü search, word examples, invalid/missing characters and local beginner/advanced stroke assets.');
}
void main().catch(error=>{console.error(error);process.exitCode=1;});
