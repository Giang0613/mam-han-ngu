import {cookies} from 'next/headers';
import {randomBytes,createHash} from 'node:crypto';
import {sqlite} from '@/db';
import type {Profile,Snapshot,Attempt,StudyCard} from './study-types';
import {getLocale} from './i18n/server';
import {localizeResource} from './i18n/resource-server';
import {StudyError} from './server/study-error';
import {checkOrigin,reserveServiceUsage} from './server/study-guards';
import {profileForSession,SESSION_SECONDS} from './server/profile-access';
import {createStudyProfile} from './server/legacy-profile';
export {StudyError};
export async function respond(data:unknown,status=200){return Response.json(localizeResource(data,await getLocale()),{status,headers:{'Cache-Control':'private, no-store','Vary':'Cookie'}})}
export function handleError(error:unknown){if(error instanceof StudyError)return respond({error:error.message},error.status);console.error('Study request failed',error);return respond({error:'Chưa lưu được dữ liệu. Hãy giữ bài làm và thử lại.'},503)}
export async function getProfile(create=false){
 const jar=await cookies();
 const existing=profileForSession(sqlite,jar.get('superweb_learner')?.value);
 if(existing)return existing;
 if(!create)throw new StudyError(401,'Hồ sơ chưa sẵn sàng. Hãy tải lại trang.');
 const secret=randomBytes(32).toString('hex');
 const id=createHash('sha256').update(secret).digest('hex');
 createStudyProfile(sqlite,id,new Date().toISOString());
 await setLearnerSession(secret);
 return id;
}
export function services(){return {ai:!!(process.env.AI_API_KEY&&process.env.AI_BASE_URL&&process.env.AI_MODEL),speech:!!(process.env.AZURE_SPEECH_KEY&&process.env.AZURE_SPEECH_REGION)}}
export function snapshot(id:string):Snapshot{return {profile:sqlite.prepare('SELECT name,goal,start_level,pinyin,rate,muted,legacy_xp FROM study_profiles WHERE id=?').get(id) as Profile,attempts:sqlite.prepare('SELECT event_id,exercise_id,answer,correct,hint,concept,skill,version,created_at FROM study_attempts WHERE profile_id=? ORDER BY created_at').all(id) as Attempt[],cards:sqlite.prepare('SELECT id,hanzi,pinyin,meaning,language,source,interval,repetition,ease,due,revision FROM study_cards WHERE profile_id=? ORDER BY due').all(id) as StudyCard[],bookmarks:(sqlite.prepare('SELECT grammar_id FROM study_bookmarks WHERE profile_id=?').all(id) as {grammar_id:string}[]).map(x=>x.grammar_id),reviewDays:(sqlite.prepare('SELECT created_at FROM study_review_events WHERE profile_id=?').all(id) as {created_at:string}[]).map(x=>x.created_at),placement:(sqlite.prepare('SELECT result,created_at FROM study_placements WHERE profile_id=? ORDER BY created_at DESC LIMIT 1').get(id) as Snapshot['placement'])||null,services:services()}}
export async function setLearnerSession(secret:string){
 const jar=await cookies();
 jar.set('superweb_learner',secret,{httpOnly:true,sameSite:'lax',path:'/',maxAge:SESSION_SECONDS,secure:process.env.APP_ORIGIN?new URL(process.env.APP_ORIGIN).protocol==='https:':process.env.NODE_ENV==='production'});
}
export async function readBody(req:Request,max=18000){
 checkOrigin(req);
 if(!/^application\/json(?:\s*;|$)/i.test(req.headers.get('content-type')||''))throw new StudyError(415,'Cần dữ liệu JSON.');
 const reader=req.body?.getReader(),decoder=new TextDecoder();let data='',bytes=0;
 try{
  if(reader)while(true){
   const chunk=await reader.read();if(chunk.done)break;
   bytes+=chunk.value.byteLength;
   if(bytes>max*4){await reader.cancel();throw new StudyError(413,'Nội dung quá dài.');}
   data+=decoder.decode(chunk.value,{stream:true});
   if(data.length>max){await reader.cancel();throw new StudyError(413,'Nội dung quá dài.');}
  }
  data+=decoder.decode();
 }finally{reader?.releaseLock();}
 if(data.length>max)throw new StudyError(413,'Nội dung quá dài.');
 try{return JSON.parse(data)}catch{throw new StudyError(400,'Dữ liệu chưa hợp lệ.')}
}
export function reserveUsage(id:string,kind:'tutor'|'speech',limit:number,req?:Request){reserveServiceUsage(sqlite,id,kind,limit,req);}
