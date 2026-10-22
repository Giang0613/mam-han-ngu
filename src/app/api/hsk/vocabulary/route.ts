import {vocabularyLessons} from '@/lib/hsk/vocabulary-server';
import {localizedJson} from '@/lib/i18n/http';
export const runtime='nodejs';
export async function GET(req:Request){
 const p=new URL(req.url).searchParams,levels=p.getAll('level');
 if(levels.length!==1||!/^[1-9]$/.test(levels[0]))return localizedJson({error:'Chọn HSK từ 1 đến 9.'},400);
 const level=Number(levels[0]);
 const raw=Number(p.get('page')||0),page=Number.isInteger(raw)?Math.max(0,Math.min(1000,raw)):0;
 try{return await localizedJson(vocabularyLessons(level,(p.get('topic')||'').slice(0,40),(p.get('q')||'').trim().slice(0,100),page))}
 catch{return localizedJson({error:'Chưa tải được danh sách từ vựng.'},503)}
}
