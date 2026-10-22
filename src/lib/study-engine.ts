import {exercises,exerciseById,grammar,lessons,grammarById,words,CONTENT_VERSION,type Exercise} from './course';
import {stories} from './reading-data';
import {type Snapshot,type Attempt} from './study-types';
import {hskExercises} from './hsk/catalog';
import {validVocabularyExerciseId} from './hsk/vocabulary-attempts';
export const grammarExercises:Exercise[]=grammar.map(g=>({id:`grammar-${g.id}`,lessonId:'grammar',kind:'order',skill:'grammar',prompt:`Sắp câu theo mẫu: ${g.formula}`,tokens:g.tokens,answer:g.tokens.join(''),explanation:`${g.zh} ${g.vi} ${g.note}`,concept:g.id}));
export const readingExercises:Exercise[]=stories.map(s=>({id:`reading-${s.id}`,lessonId:'reading',kind:'choice',skill:'reading' as Exercise['skill'],prompt:s.question,options:s.options.map((o,i)=>({id:String(i),text:o})),answer:String(s.answer),explanation:s.explanation,concept:`story-${s.id}`}));
export const toneExercises:Exercise[]=[{zh:'妈',py:'mā',tone:1},{zh:'麻',py:'má',tone:2},{zh:'马',py:'mǎ',tone:3},{zh:'骂',py:'mà',tone:4},{zh:'你',py:'nǐ',tone:3},{zh:'好',py:'hǎo',tone:3},{zh:'是',py:'shì',tone:4},{zh:'书',py:'shū',tone:1},{zh:'人',py:'rén',tone:2},{zh:'吗',py:'ma',tone:5}].map((x,i)=>({id:`tone-${i+1}`,lessonId:'pinyin',kind:'choice',skill:'pinyin' as Exercise['skill'],prompt:`“${x.py}” mang thanh nào?`,zh:x.zh,pinyin:x.py,options:[{id:'1',text:'Thanh 1 · cao và ngang'},{id:'2',text:'Thanh 2 · đi lên'},{id:'3',text:'Thanh 3 · thấp'},{id:'4',text:'Thanh 4 · đi xuống'},{id:'5',text:'Thanh nhẹ'}],answer:String(x.tone),explanation:`${x.zh} (${x.py}) là ${x.tone===5?'thanh nhẹ':`thanh ${x.tone}`}. Đây là bài nhận diện ký hiệu, chưa đánh giá âm thanh bạn phát ra.`,concept:`tone-${x.tone}`}));
export const allExercises={...exerciseById,...Object.fromEntries([...grammarExercises,...readingExercises,...toneExercises,...hskExercises].map(e=>[e.id,e]))};
export function localDay(d:Date|string){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(d))}
export function progressPercent(completedCount:number,totalCount:number){
 if(!Number.isFinite(completedCount)||!Number.isFinite(totalCount)||totalCount<=0)return 0;
 return Math.round(Math.min(1,Math.max(0,completedCount/totalCount))*100);
}
export function derive(s:Snapshot,now=new Date()){
 const valid=s.attempts.filter(a=>a.version===CONTENT_VERSION&&(allExercises[a.exercise_id]||validVocabularyExerciseId(a.exercise_id)));const completed=new Set(valid.map(a=>a.exercise_id)),passed=new Set(valid.filter(a=>a.correct&&!a.hint).map(a=>a.exercise_id));const completedLessons=lessons.filter(l=>{const items=exercises.filter(e=>e.lessonId===l.id);return items.length>0&&items.every(e=>completed.has(e.id))}).map(l=>l.id);
 const first=new Map<string,Attempt>();for(const a of valid)if(!first.has(a.exercise_id))first.set(a.exercise_id,a);
 const days=new Set([...valid.map(a=>localDay(a.created_at)),...s.reviewDays.map(d=>localDay(d))]);let streak=0;const cursor=new Date(now);if(!days.has(localDay(cursor)))cursor.setUTCDate(cursor.getUTCDate()-1);while(days.has(localDay(cursor))){streak++;cursor.setUTCDate(cursor.getUTCDate()-1)}
 const todayCount=new Set(valid.filter(a=>localDay(a.created_at)===localDay(now)).map(a=>a.exercise_id)).size+s.reviewDays.filter(d=>localDay(d)===localDay(now)).length;
 const weaknesses=[...new Set(valid.map(a=>a.concept))].map(concept=>{const recent=valid.filter(a=>a.concept===concept).slice(-5).reverse();return {concept,failures:recent.filter(a=>!a.correct).length,total:recent.length,lastCorrect:recent[0]?.correct===1}}).filter(x=>x.failures>=2&&!x.lastCorrect).sort((a,b)=>b.failures-a.failures);
 const mistakes=[...first.keys()].filter(id=>allExercises[id]).map(id=>{const latest=valid.filter(a=>a.exercise_id===id).at(-1)!;return {exercise:allExercises[id],latest}}).filter(x=>!x.latest.correct);
 const due=s.cards.filter(c=>new Date(c.due)<=now),next=lessons.find(l=>l.level>=s.profile.start_level&&!completedLessons.includes(l.id)&&(!l.prerequisite||completedLessons.includes(l.prerequisite)))||lessons.find(l=>!completedLessons.includes(l.id))||lessons[0];
 const weak=weaknesses[0],weakLesson=weak&&lessons.find(l=>l.grammarIds.includes(weak.concept)||l.wordIds.includes(weak.concept));
 const recommendation=due.length?{href:'/learn',title:`${due.length} thẻ đến lúc ôn`,reason:'Ôn những từ đến hạn trước khi học thêm.'}:weakLesson?{href:`/lesson/${weakLesson.id}`,title:weakLesson.title,reason:`Luyện lại ${grammarById[weak.concept]?.key||words.find(w=>w.id===weak.concept)?.zh||'điểm còn nhầm'}: còn ${weak.failures} lượt chưa đúng trong ${weak.total} lượt gần đây.`}:{href:`/lesson/${next.id}`,title:next.title,reason:completed.size?'Tiếp nối chặng học từ tiến độ đã lưu.':'Bắt đầu bằng một lời chào và những mẫu câu ngắn.'};
 const skills=['vocabulary','grammar','listening','writing','reading','pinyin'].map(skill=>{const rows=[...first.values()].filter(a=>a.skill===skill&&!a.hint);return {skill,total:rows.length,correct:rows.filter(a=>a.correct).length}});
 return {completed,passed,completedLessons,todayCount,streak,xp:s.profile.legacy_xp+passed.size*10,due,mistakes,weaknesses,recommendation,skills,days,accuracy:first.size?progressPercent([...first.values()].filter(a=>a.correct&&!a.hint).length,first.size):null};
}
