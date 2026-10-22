import {getProfile,snapshot,respond,handleError} from '@/lib/study-server';import {derive} from '@/lib/study-engine';
export async function GET(){try{const s=snapshot(await getProfile(true)),stats=derive(s);return respond({success:true,data:{name:s.profile.name,xp:stats.xp,level:s.profile.start_level}})}catch(e){return handleError(e)}}
export async function POST(){return respond({success:false,error:'Điểm được tính từ bài làm đã chấm. Hãy dùng /api/study để lưu câu trả lời.'},410)}
