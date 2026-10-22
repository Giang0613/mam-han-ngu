import {mandarinAudio,mandarinAudioRevision} from '@/lib/server/mandarin-audio';
import {validSpeechReading} from '@/lib/speech-reading';
export const runtime='nodejs';
export async function GET(request:Request){
 const params=new URL(request.url).searchParams,text=params.get('text')?.normalize('NFC').trim()||'';
 const requestedRate=Number(params.get('rate')??1);
 if(!Number.isFinite(requestedRate)||requestedRate<0.5||requestedRate>1.2)return Response.json({error:'Tốc độ đọc chưa hợp lệ.'},{status:400});
 const rate=Math.round(requestedRate*100)/100;
 if(!text||text.length>2400||!/[\p{Script=Han}]/u.test(text)||!/^[\p{Script=Han}\d\s，。！？、；：…“”‘’（）％%·]+$/u.test(text))return Response.json({error:'Văn bản đọc không hợp lệ.'},{status:400});
 const reading=params.get('py')||'';
 if(reading.length>12000||!validSpeechReading(text,reading))return Response.json({error:'Pinyin chưa khớp với chữ Hán.'},{status:400});
 try{const audio=await mandarinAudio(text,rate,reading);return new Response(new Uint8Array(audio),{headers:{'Content-Type':'audio/wav','Cache-Control':'private, max-age=86400','X-Audio-Revision':mandarinAudioRevision(text,reading),'X-Content-Type-Options':'nosniff'}});}
 catch{return Response.json({error:'Chưa tạo được giọng mẫu. Hãy kiểm tra kết nối mạng và thử lại.'},{status:503,headers:{'Cache-Control':'no-store'}});}
}
