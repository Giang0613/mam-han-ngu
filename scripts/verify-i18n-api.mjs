import assert from 'node:assert/strict';
const origin=process.env.STUDY_TEST_ORIGIN||'http://localhost:3000';
async function get(path,locale){
 const response=await fetch(origin+path,{headers:{Cookie:'mam_locale='+locale}});
 assert.equal(response.status,200,path);
 assert.match(response.headers.get('cache-control'),/private/);
 assert.match(response.headers.get('vary'),/Cookie/);
 return response.json();
}
// Read-only: no learner profiles, answers or progress are created or changed.
for(const [hanzi,reading,definition] of [['爱','ài',/to love/],['爱好','ài hào',/hobby/],['八','bā',/^eight$/],['爸爸','bà ba',/dad/],['吧','ba',/modal particle/]]){
 const result=await get('/api/dictionary?scope=cedict&q='+encodeURIComponent(hanzi),'en');
 const entry=result.results.find(w=>w.hanzi===hanzi&&w.pinyin===reading);
 assert.ok(entry,hanzi+' '+reading);assert.match(entry.meaning,definition);
}
const en=await get('/api/dictionary?scope=hsk','en'),vi=await get('/api/dictionary?scope=hsk','vi');
assert.deepEqual(en.results.map(w=>[w.id,w.hanzi,w.pinyin,w.lessonId]),vi.results.map(w=>[w.id,w.hanzi,w.pinyin,w.lessonId]));
if(en.hskWords){
 const neutral=en.results.find(w=>w.hanzi==='吧');assert.equal(neutral.pinyin,'ba');assert.match(neutral.meaning,/modal particle/);
 for(const word of en.results){
  const sequence=/·\s*(\d+)$/.exec(vi.results.find(w=>w.id===word.id).lessonTitle)?.[1];
  assert.equal(word.lessonTitle,word.topicTitle+' · '+sequence);
  assert.ok(!/Love; Love|Dad; Dad|_Other Organiser/.test(word.meaning+' '+word.lessonTitle));
 }
 const search=await get('/api/dictionary?scope=hsk&q=hobby','en');assert.ok(search.results.some(w=>w.hanzi==='爱好'));
}
for(const [hanzi,pinyin] of [['包','bāo'],['杯子','bēi zi'],['爸爸','bà ba']]){
 const result=await get('/api/dictionary?scope=cedict&q='+encodeURIComponent(hanzi),'en');
 const word=result.results.find(w=>w.hanzi===hanzi&&w.pinyin===pinyin);assert.ok(word);
 assert.ok(!/CL:|\[[A-Za-z]+[0-5]\]|\p{Script=Han}\|\p{Script=Han}/u.test(word.meaning));
 assert.ok(word.dictionaryDetails.classifiers.length);
}
console.log('PASS: English lexical meanings, tone-specific lookup, unchanged pinyin and IDs, structured lesson titles, English search, and locale cache isolation.');
