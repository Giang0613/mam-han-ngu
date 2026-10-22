import 'server-only';
import {spawn,type ChildProcessWithoutNullStreams} from 'node:child_process';
import {createHash} from 'node:crypto';
import {existsSync} from 'node:fs';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {createInterface} from 'node:readline';

const root=path.join(process.cwd(),'.cache','mandarin-audio');
export const MANDARIN_AUDIO_REVISION='mandarin-xiaoxiao-reference-v6';
const WORKER_REVISION=MANDARIN_AUDIO_REVISION+'-a2-v1';
export function mandarinAudioRevision(text:string,reading:string){return text==='啊'&&reading==='a2'?WORKER_REVISION:MANDARIN_AUDIO_REVISION;}
const python=process.env.SUPERWEB_AUDIO_PYTHON||path.join(root,'venv',process.platform==='win32'?'Scripts':'bin',process.platform==='win32'?'python.exe':'python');
type Job={resolve:()=>void;reject:(error:Error)=>void;timer:ReturnType<typeof setTimeout>};
class MandarinWorker{
 revision=WORKER_REVISION;
 child:ChildProcessWithoutNullStreams|null=null;pending=new Map<string,Job>();
 start(){
  if(this.child)return;
  // The runtime/model are installed beside the app, outside the Next bundle.
  if(!existsSync(/* turbopackIgnore: true */ python))throw Error('Mandarin voice runtime unavailable');
  const child=spawn(/* turbopackIgnore: true */ python,['-u',path.join(process.cwd(),'scripts','mandarin-neural-worker.py')],{cwd:process.cwd(),windowsHide:true,stdio:'pipe'});this.child=child;
  // Some G2P libraries write progress to stderr. Keep it drained and private.
  child.stderr.on('data',()=>{});
  createInterface({input:child.stdout}).on('line',line=>{try{const response=JSON.parse(line),job=this.pending.get(response.key);if(!job)return;clearTimeout(job.timer);this.pending.delete(response.key);if(response.ok)job.resolve();else job.reject(Error('Mandarin synthesis failed'));}catch{/* Non-protocol library messages are ignored. */}});
  const failed=()=>{if(this.child!==child)return;this.child=null;for(const job of this.pending.values()){clearTimeout(job.timer);job.reject(Error('Mandarin worker stopped'));}this.pending.clear();};
  child.on('error',failed);child.on('exit',failed);
 }
 create(key:string,text:string,rate:number,reading:string){
  if(this.pending.size>=4)throw Error('Mandarin voice busy');this.start();
  return new Promise<void>((resolve,reject)=>{const timer=setTimeout(()=>{this.pending.delete(key);reject(Error('Mandarin synthesis timeout'));},85000);this.pending.set(key,{resolve,reject,timer});this.child!.stdin.write(JSON.stringify({key,text,rate,reading})+'\n',error=>{if(error){clearTimeout(timer);this.pending.delete(key);reject(error)}});});
 }
}
const globalAudio=globalThis as typeof globalThis&{mandarinWorker?:MandarinWorker;mandarinJobs?:Map<string,Promise<void>>};
if(globalAudio.mandarinWorker&&globalAudio.mandarinWorker.revision!==WORKER_REVISION){globalAudio.mandarinWorker.child?.kill();globalAudio.mandarinWorker=undefined;globalAudio.mandarinJobs=undefined;}
const worker=globalAudio.mandarinWorker??=new MandarinWorker(),jobs=globalAudio.mandarinJobs??=new Map<string,Promise<void>>();
export async function mandarinAudio(text:string,rate=1,reading=''){
 const key=createHash('sha256').update(`${mandarinAudioRevision(text,reading)}\0${rate.toFixed(2)}\0${text}\0${reading}`).digest('hex'),file=path.join(root,'clips',key+'.wav');
 if(!existsSync(file)){let job=jobs.get(key);if(!job){job=worker.create(key,text,rate,reading);jobs.set(key,job);}try{await job;}finally{if(jobs.get(key)===job)jobs.delete(key);}}
 return readFile(file);
}
