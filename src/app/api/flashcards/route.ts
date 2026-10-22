import {getProfile,snapshot,respond,handleError} from '@/lib/study-server';
export async function GET(req:Request){try{const s=snapshot(await getProfile());const due=new URL(req.url).searchParams.get('due')==='true';return respond({success:true,data:s.cards.filter(c=>!due||new Date(c.due)<=new Date())})}catch(e){return handleError(e)}}
export async function POST(){return respond({success:false,error:'Hãy dùng /api/study với mã từ để lưu thẻ có nguồn.'},410)}
