import {z} from 'zod';
import {sqlite} from '@/db';
import {HSK1_MATERIAL_REVISION,validMaterialPageId} from '@/lib/hsk/materials-catalog';
import {getProfile,respond,readBody,handleError,StudyError} from '@/lib/study-server';
export const runtime='nodejs';
const answerId=z.string().regex(/^(?:\d{1,2}|native-[a-z0-9-]{1,80})$/);
const submission=z.object({revision:z.string().max(100),answer:z.string().max(1000),firstAnswer:z.string().max(1000),attempts:z.number().int().min(1).max(10000),submittedAt:z.string().datetime()});
const schema=z.object({pageId:z.string().refine(validMaterialPageId),revision:z.literal(HSK1_MATERIAL_REVISION),draft:z.object({answers:z.record(answerId,z.string().max(1000)).refine(x=>Object.keys(x).length<=120),notes:z.string().max(6000),done:z.boolean(),submissions:z.record(answerId,submission).refine(x=>Object.keys(x).length<=120).optional()})});
export async function GET(req:Request){try{const profile=await getProfile(),id=new URL(req.url).searchParams.get('pageId');
 if(!id){const rows=sqlite.prepare('SELECT task_id,text FROM study_hsk_drafts WHERE profile_id=? AND revision=?').all(profile,HSK1_MATERIAL_REVISION) as {task_id:string;text:string}[];return respond({completed:rows.filter(r=>JSON.parse(r.text).done).map(r=>r.task_id)});}
 if(!validMaterialPageId(id))throw new StudyError(404,'Không tìm thấy trang học.');
 const row=sqlite.prepare('SELECT text,updated_at FROM study_hsk_drafts WHERE profile_id=? AND task_id=? AND revision=?').get(profile,id,HSK1_MATERIAL_REVISION) as {text:string;updated_at:string}|undefined;
 return respond({draft:row?JSON.parse(row.text):null,updatedAt:row?.updated_at});
 }catch(e){return handleError(e)}}
export async function POST(req:Request){try{const profile=await getProfile(),parsed=schema.safeParse(await readBody(req,400000));if(!parsed.success)throw new StudyError(400,'Bài làm chưa hợp lệ.');const d=parsed.data,now=new Date().toISOString();
 sqlite.prepare('INSERT INTO study_hsk_drafts VALUES(?,?,?,?,?) ON CONFLICT(profile_id,task_id,revision) DO UPDATE SET text=excluded.text,updated_at=excluded.updated_at').run(profile,d.pageId,d.revision,JSON.stringify(d.draft),now);
 return respond({saved:true,updatedAt:now});
 }catch(e){return handleError(e)}}
