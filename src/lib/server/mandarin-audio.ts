import 'server-only';
import {MandarinWorker} from './mandarin-worker';
import {createHash} from 'node:crypto';
import {existsSync} from 'node:fs';
import {readFile} from 'node:fs/promises';
import path from 'node:path';


const root=path.resolve(/* turbopackIgnore: true */ process.env.SUPERWEB_AUDIO_ROOT||path.join(process.cwd(),'.cache','mandarin-audio'));
export const MANDARIN_AUDIO_REVISION='mandarin-xiaoxiao-reference-v6';
const WORKER_REVISION=MANDARIN_AUDIO_REVISION+'-a2-v1';
export function mandarinAudioRevision(text:string,reading:string){return text==='啊'&&reading==='a2'?WORKER_REVISION:MANDARIN_AUDIO_REVISION;}
const python=process.env.SUPERWEB_AUDIO_PYTHON||path.join(root,'venv',process.platform==='win32'?'Scripts':'bin',process.platform==='win32'?'python.exe':'python');
const globalAudio=globalThis as typeof globalThis&{mandarinWorker?:MandarinWorker;mandarinJobs?:Map<string,Promise<void>>};
if(globalAudio.mandarinWorker&&globalAudio.mandarinWorker.revision!=='bounded-fifo-v1'){globalAudio.mandarinWorker.child?.kill();globalAudio.mandarinWorker=undefined;globalAudio.mandarinJobs=undefined;}
const worker=globalAudio.mandarinWorker??=new MandarinWorker({executable:python,args:['-u',path.join(process.cwd(),'scripts','mandarin-neural-worker.py')],cwd:process.cwd()}),jobs=globalAudio.mandarinJobs??=new Map<string,Promise<void>>();
export async function mandarinAudio(text:string,rate=1,reading=''){
 const key=createHash('sha256').update(`${mandarinAudioRevision(text,reading)}\0${rate.toFixed(2)}\0${text}\0${reading}`).digest('hex'),file=path.join(root,'clips',key+'.wav');
 if(!existsSync(file)){let job=jobs.get(key);if(!job){job=worker.create(key,text,rate,reading);jobs.set(key,job);}try{await job;}finally{if(jobs.get(key)===job)jobs.delete(key);}}
 return readFile(file);
}
