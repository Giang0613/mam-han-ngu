import {localizedJson} from '@/lib/i18n/http';
import {writingDetail,searchWriting} from '@/lib/writing-server';
export const runtime='nodejs';
export async function GET(request:Request){
 const params=new URL(request.url).searchParams;
 if(['character','level','strokes','page','q'].some(key=>params.getAll(key).length>1))return localizedJson({error:'Bộ lọc luyện viết chưa hợp lệ.'},400);
 const character=params.get('character');
 if(character!==null&&!/^\p{Script=Han}$/u.test(character))return localizedJson({error:'Hãy chọn một chữ Hán.'},400);
 const level=params.get('level')||'0',strokes=params.get('strokes')||'0',page=params.get('page')||'0',q=(params.get('q')||'').trim();
 if(!/^(?:0|[1-6]|79)$/.test(level)||!['0','1','6','11','16'].includes(strokes)||!/^\d{1,3}$/.test(page)||q.length>80)return localizedJson({error:'Bộ lọc luyện viết chưa hợp lệ.'},400);
 try{
  if(character!==null){const detail=writingDetail(character);return detail?await localizedJson(detail):localizedJson({error:'Chữ này chưa có trong kho luyện viết.'},404);}
  return await localizedJson(searchWriting(q,Number(level),Number(strokes),Number(page)));
 }catch{return localizedJson({error:'Chưa tải được kho luyện viết. Hãy thử lại.'},503);}
}
