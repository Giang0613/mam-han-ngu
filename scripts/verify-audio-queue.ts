import assert from 'node:assert/strict';
import path from 'node:path';
import {MandarinWorker} from '../src/lib/server/mandarin-worker';
async function main(){
const diagnostics:string[]=[];
const options={executable:process.execPath,args:[path.resolve('scripts/fixtures/audio-worker.mjs')],cwd:process.cwd(),diagnostic:(code:string)=>diagnostics.push(code)};
const worker=new MandarinWorker({...options,capacity:8,timeoutMs:3000});
try{
 const order:number[]=[];
 const jobs=Array.from({length:8},(_,i)=>worker.create(String(i),'ready',1,'').then(()=>order.push(i)));
 await assert.rejects(worker.create('overflow','ready',1,''),/busy/);
 await Promise.all(jobs);
 assert.deepEqual(order,[0,1,2,3,4,5,6,7]);
 await assert.rejects(worker.create('error','private-error',1,''),/failed/);
 await worker.create('after-error','ready',1,'');
 const exited=await Promise.allSettled([worker.create('exit','exit',1,''),worker.create('queued','ready',1,'')]);
 assert.ok(exited.every(r=>r.status==='rejected'));
 assert.equal(worker.size,0);
 await worker.create('restart','ready',1,'');
 assert.ok(diagnostics.includes('runtime_error'));
 assert.ok(diagnostics.includes('synthesis_failed:ValueError'));
 assert.ok(!JSON.stringify(diagnostics).includes('PRIVATE_LEARNER_TEXT'));
}finally{worker.close();}
const timed=new MandarinWorker({...options,timeoutMs:200});
try{
 const results=await Promise.allSettled([timed.create('hang','hang',1,''),timed.create('wait','ready',1,'')]);
 assert.ok(results.every(r=>r.status==='rejected'));
 assert.equal(timed.size,0);
}finally{timed.close();}
const absent=new MandarinWorker({...options,executable:path.resolve('missing-runtime-for-queue-test')});
try{await assert.rejects(absent.create('missing','ready',1,''));assert.equal(absent.size,0);}finally{absent.close();}
console.log('PASS: FIFO beyond four requests, bounded backlog, failure/timeout cleanup, restart, unavailable runtime and private-text-free diagnostics.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
