import {cookies} from 'next/headers';
import {randomBytes,createHash} from 'node:crypto';
import {sqlite} from '@/db';
import type {Profile,Snapshot,Attempt,StudyCard} from './study-types';
import {getLocale} from './i18n/server';
import {localizeResource} from './i18n/resource-server';
export class StudyError extends Error{constructor(public status:number,message:string){super(message)}}
export async function respond(data:unknown,status=200){return Response.json(localizeResource(data,await getLocale()),{status,headers:{'Cache-Control':'private, no-store','Vary':'Cookie'}})}
export function handleError(error:unknown){if(error instanceof StudyError)return respond({error:error.message},error.status);console.error('Study request failed',error);return respond({error:'Chưa lưu được dữ liệu. Hãy giữ bài làm và thử lại.'},503)}
export async function getProfile(create=false){const jar=await cookies();const token=jar.get('superweb_learner')?.value;let id=token&&/^[a-f0-9]{64}$/.test(token)?createHash('sha256').update(token).digest('hex'):null;if(id&&sqlite.prepare('SELECT id FROM study_profiles WHERE id=?').get(id))return id;if(!create)throw new StudyError(401,'Hồ sơ chưa sẵn sàng. Hãy tải lại trang.');const secret=randomBytes(32).toString('hex');id=createHash('sha256').update(secret).digest('hex');const now=new Date().toISOString();
 sqlite.transaction(()=>{
  const adopted=sqlite.prepare("SELECT value FROM study_meta WHERE key='legacy_adopted'").get();
  const hasLegacyTable=(name:string)=>!!sqlite.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?").get(name);
  // A fresh community installation has only the study schema. Legacy tables
  // are optional, and may exist independently in older installations.
  const legacy=!adopted&&hasLegacyTable('users')
   ?sqlite.prepare('SELECT name,xp FROM users WHERE id=1').get() as {name:string;xp:number}|undefined
   :undefined;
  sqlite.prepare('INSERT INTO study_profiles(id,name,legacy_xp,created_at) VALUES(?,?,?,?)').run(id,legacy?.name||'Học viên',legacy?.xp||0,now);
  if(!adopted){
   sqlite.prepare("INSERT INTO study_meta(key,value) VALUES('legacy_adopted',?)").run(id);
   const oldCards=hasLegacyTable('flashcards')
    ?sqlite.prepare('SELECT * FROM flashcards').all() as {id:number;hanzi:string;pinyin:string;meaning:string;interval:number;repetition:number;ease_factor:number;next_review_at:number}[]
    :[];
   const insert=sqlite.prepare('INSERT INTO study_cards(profile_id,id,hanzi,pinyin,meaning,source,interval,repetition,ease,due,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)');
   for(const c of oldCards)insert.run(id,`legacy-${c.id}`,c.hanzi,c.pinyin,c.meaning,'Thẻ đã có',c.interval,c.repetition,c.ease_factor/1000,new Date(c.next_review_at*1000).toISOString(),now);
  }
 })();
 jar.set('superweb_learner',secret,{httpOnly:true,sameSite:'lax',path:'/',maxAge:365*86400,secure:process.env.NODE_ENV==='production'});return id;
}
export function services(){return {ai:!!(process.env.AI_API_KEY&&process.env.AI_BASE_URL&&process.env.AI_MODEL),speech:!!(process.env.AZURE_SPEECH_KEY&&process.env.AZURE_SPEECH_REGION)}}
export function snapshot(id:string):Snapshot{return {profile:sqlite.prepare('SELECT name,goal,start_level,pinyin,rate,muted,legacy_xp FROM study_profiles WHERE id=?').get(id) as Profile,attempts:sqlite.prepare('SELECT event_id,exercise_id,answer,correct,hint,concept,skill,version,created_at FROM study_attempts WHERE profile_id=? ORDER BY created_at').all(id) as Attempt[],cards:sqlite.prepare('SELECT id,hanzi,pinyin,meaning,language,source,interval,repetition,ease,due,revision FROM study_cards WHERE profile_id=? ORDER BY due').all(id) as StudyCard[],bookmarks:(sqlite.prepare('SELECT grammar_id FROM study_bookmarks WHERE profile_id=?').all(id) as {grammar_id:string}[]).map(x=>x.grammar_id),reviewDays:(sqlite.prepare('SELECT created_at FROM study_review_events WHERE profile_id=?').all(id) as {created_at:string}[]).map(x=>x.created_at),placement:(sqlite.prepare('SELECT result,created_at FROM study_placements WHERE profile_id=? ORDER BY created_at DESC LIMIT 1').get(id) as Snapshot['placement'])||null,services:services()}}
export async function readBody(req:Request,max=18000){const origin=req.headers.get('origin'),requestUrl=new URL(req.url),host=req.headers.get('host');const expectedOrigin=host?new URL(`${requestUrl.protocol}//${host}`).origin:requestUrl.origin;if(origin&&origin!==expectedOrigin)throw new StudyError(403,'Nguồn yêu cầu không hợp lệ.');if(!req.headers.get('content-type')?.includes('application/json'))throw new StudyError(415,'Cần dữ liệu JSON.');const data=await req.text();if(data.length>max)throw new StudyError(413,'Nội dung quá dài.');try{return JSON.parse(data)}catch{throw new StudyError(400,'Dữ liệu chưa hợp lệ.')}}
export function reserveUsage(id:string,kind:string,limit:number){const day=new Date().toISOString().slice(0,10);const row=sqlite.prepare('INSERT INTO study_usage(profile_id,day,kind,count) VALUES(?,?,?,1) ON CONFLICT(profile_id,day,kind) DO UPDATE SET count=count+1 WHERE count < ? RETURNING count').get(id,day,kind,limit);if(!row)throw new StudyError(429,'Bạn đã dùng hết lượt dịch vụ hôm nay. Hãy tiếp tục luyện theo mẫu.');}
