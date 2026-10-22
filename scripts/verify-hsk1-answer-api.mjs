import assert from 'node:assert/strict';
const base=process.env.SUPERWEB_TEST_URL||'http://localhost:3000',api='/api/hsk/materials/draft';
async function profile(){const r=await fetch(base+'/api/study');assert.equal(r.status,200);return {cookie:r.headers.get('set-cookie').split(';')[0],snapshot:await r.json()}}
const test=await profile(),other=await profile(),headers={cookie:test.cookie,'Content-Type':'application/json',origin:base};
const id='native-workbook-018-edited-4-item-0';
const submission={revision:'hsk1-publisher-answers-2026-10-07-v1',answer:'ū',firstAnswer:'ao',attempts:2,submittedAt:'2026-10-07T00:02:00Z'};
const payload={pageId:'workbook-018',revision:'hsk1-books-2026-10-07-v1',draft:{answers:{[id]:'ū'},notes:'Isolated grading test',done:false,submissions:{[id]:submission}}};
assert.equal((await fetch(base+api,{method:'POST',headers:{...headers,origin:'https://example.org'},body:JSON.stringify(payload)})).status,403);
for(let i=0;i<2;i++)assert.equal((await fetch(base+api,{method:'POST',headers,body:JSON.stringify(payload)})).status,200);
const load=await (await fetch(base+api+'?pageId=workbook-018',{headers})).json();assert.deepEqual(load.draft,payload.draft);
assert.equal((await (await fetch(base+api+'?pageId=workbook-018',{headers:{cookie:other.cookie}})).json()).draft,null);
for(const bad of [{...submission,attempts:0},{...submission,answer:'你'.repeat(1001)},{...submission,submittedAt:'bad'}])assert.equal((await fetch(base+api,{method:'POST',headers,body:JSON.stringify({...payload,draft:{...payload.draft,submissions:{[id]:bad}}})})).status,400);
const old={...payload,draft:{answers:{[id]:'u'},notes:'Legacy draft',done:false}};
assert.equal((await fetch(base+api,{method:'POST',headers,body:JSON.stringify(old)})).status,200);assert.deepEqual((await (await fetch(base+api+'?pageId=workbook-018',{headers})).json()).draft,old.draft);
const after=await (await fetch(base+'/api/study',{headers:{cookie:test.cookie}})).json();assert.equal(after.profile.legacy_xp,test.snapshot.profile.legacy_xp);assert.deepEqual(after.attempts,test.snapshot.attempts);
console.log('PASS: grading submissions save/reload, duplicate POST idempotence, first-attempt preservation, profile isolation, validation and legacy drafts; no XP awarded and no user profile changed.');
