import {dictionarySearch} from '@/lib/dictionary-server';
import {localizedJson} from '@/lib/i18n/http';
export const runtime='nodejs';
export async function GET(req:Request){
 const p=new URL(req.url).searchParams,q=(p.get('q')||'').trim().slice(0,100),raw=Number(p.get('page')||0),page=Number.isInteger(raw)?Math.max(0,Math.min(6000,raw)):0;
 const value=p.get('level'),level=value&&value!=='all'?Number(value):undefined;
 if(level!==undefined&&(!Number.isInteger(level)||!([1,2,3,4,5,6,7,8,9,79].includes(level))))return localizedJson({error:'Cấp HSK chưa hợp lệ.'},400);
 try{return localizedJson(dictionarySearch(q,page,24,{level,topic:(p.get('topic')||'').slice(0,40),scope:p.get('scope')||'all'}))}
 catch{return localizedJson({error:'Chưa tải được từ điển.'},503)}
}
