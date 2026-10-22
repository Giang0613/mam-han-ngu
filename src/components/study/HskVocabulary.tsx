'use client';
import {Localize,useLocale} from '@/components/i18n/LocaleProvider';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {ArrowLeft,ArrowRight,BookOpen,CheckCircle2} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {useStudyStore} from '@/store/useStudyStore';
import type {Exercise} from '@/lib/course';
import {progressPercent} from '@/lib/study-engine';
import type {VocabularyLesson,VocabularyEntry,LessonIndex} from '@/lib/hsk/vocabulary-types';
import {PageHeading,SearchInput,LoadingCards,EmptyState} from './common';
import {DictionaryWord} from './DictionaryWord';
import {ChineseText} from './ChineseText';
import {ExerciseCard} from './Exercise';

export function HskVocabularyPage({level}:{level:number}){const {locale}=useLocale();
 const {data}=useStudyStore(),[topic,setTopic]=useState(''),[q,setQ]=useState(''),[page,setPage]=useState(0),[index,setIndex]=useState<LessonIndex|null>(null),[busy,setBusy]=useState(true),[error,setError]=useState('');
 useEffect(()=>{const controller=new AbortController();setBusy(true);setError('');
  const timer=setTimeout(()=>fetch(`/api/hsk/vocabulary?${new URLSearchParams({level:String(level),topic,q,page:String(page)})}`,{signal:controller.signal}).then(async r=>{const d=await r.json();if(!r.ok)throw Error(d.error);setIndex(d)}).catch(e=>{if(e.name!=='AbortError')setError(e.message)}).finally(()=>{if(!controller.signal.aborted)setBusy(false)}),200);
  return()=>{clearTimeout(timer);controller.abort()};
 },[level,topic,q,page,locale]);
 const saved=new Set(data.cards.map(c=>c.id));
 const passed=new Set(data.attempts.filter(a=>a.correct&&!a.hint).map(a=>a.exercise_id));
 return <Localize>{<main className="workspace"><Link className="breadcrumb" href={`/hsk/${level}`}><ArrowLeft size={16}/>HSK {level} · Lộ trình</Link><PageHeading title={`HSK ${level}. Từ vựng có liên kết.`} description={index?`${index.words.toLocaleString((locale==='en'?'en-US':'vi-VN'))} mục từ được chia thành bài theo chủ đề. Mỗi bài tối đa 16 từ, có pinyin, âm thanh, kiểm tra nghĩa theo hai chiều.`:'Học từng nhóm nhỏ, nghe phát âm và ôn đúng lúc.'}/>
  <section className="surface vocabulary-study-intro"><BookOpen size={27}/><div><h2>Hiểu trước. Nghe kỹ. Ôn lại.</h2><p>Học từ trong cùng chủ đề → nghe và xem ví dụ → kiểm tra hai chiều → lưu từ cần nhớ vào danh sách ôn.</p></div><Link href={`/dictionary?level=${level}`} className="button-link secondary">Tra từ HSK {level}<ArrowRight size={16}/></Link></section>
  <div className="filters vocabulary-lesson-filters"><SearchInput value={q} onChange={v=>{setQ(v);setPage(0)}} placeholder="Tìm bài chứa từ, pinyin hoặc nghĩa…" label="Tìm bài từ vựng"/><label>Chủ đề<select className="form-select" value={topic} onChange={e=>{setTopic(e.target.value);setPage(0)}}><option value="">Tất cả chủ đề</option>{index?.topics.map(t=><option key={t.id} value={t.id}>{t.title} · {t.count} bài</option>)}</select></label></div>
  {error?<p className="feedback incorrect" role="alert">{error}</p>:busy?<LoadingCards label="Đang tải bài từ vựng…"/>:!index?.results.length?<EmptyState title="Chưa có bài phù hợp" description="Thử một từ ngắn hơn hoặc chọn chủ đề khác."/>:<><div className="hsk-unit-grid">{index.results.map(l=>{const correct=l.wordIds.reduce((n,id)=>n+Number(passed.has(`hskv1-${id}-m`))+Number(passed.has(`hskv1-${id}-r`)),0);return <Link key={l.id} href={`/hsk/${level}/vocabulary/${l.id}`} className="hsk-unit-card vocabulary-lesson-card" data-tone={['mint','blue','amber','coral'][(l.sequence-1)%4]}><div className="row-between"><span className="pill">Bài {String(l.sequence).padStart(2,'0')}</span>{l.wordIds.length>0&&correct===l.wordIds.length*2&&<CheckCircle2 size={18}/>}</div><h3>{l.title}</h3><div className="vocabulary-preview">{l.preview.map((w,i)=><ChineseText key={`${w}-${i}`} text={w} pinyin={l.previewPinyin?.[i]} audio={false}/>)}</div><p>{l.wordIds.length} mục từ · {l.wordIds.filter(id=>saved.has(id)).length} đã lưu</p><div className="row-between"><small>{correct}/{l.wordIds.length*2} câu đúng độc lập</small><ArrowRight size={17}/></div></Link>})}</div><div className="pagination"><Button variant="outline" disabled={!page} onClick={()=>setPage(p=>p-1)}>Trang trước</Button><span>{index.total} bài phù hợp · Trang {page+1}</span><Button variant="outline" disabled={!index.hasMore} onClick={()=>setPage(p=>p+1)}>Trang sau</Button></div></>}
 </main>}</Localize>;
}

export function VocabularyLessonPage({lesson,words,exercises,next}:{lesson:VocabularyLesson;words:VocabularyEntry[];exercises:Exercise[];next?:{id:string;title:string;level:number}}){
 const {data,ready}=useStudyStore(),[playing,setPlaying]=useState(false),[position,setPosition]=useState(0),[run,setRun]=useState(0),[finished,setFinished]=useState(false);
 const answered=new Set(data.attempts.map(a=>a.exercise_id)),passed=new Set(data.attempts.filter(a=>a.correct&&!a.hint).map(a=>a.exercise_id));
 const correct=exercises.filter(e=>passed.has(e.id)).length;
 function start(all=false){if(!exercises.length)return;const missing=exercises.findIndex(e=>!answered.has(e.id));setPosition(all||missing<0?0:missing);setRun(n=>n+1);setPlaying(true);setFinished(false);}
 return <Localize>{<main className="workspace hsk-unit-workspace"><Link className="breadcrumb" href={`/hsk/${lesson.level}/vocabulary`}><ArrowLeft size={16}/>HSK {lesson.level} · Từ vựng theo bài</Link><PageHeading title={lesson.title} description={lesson.goal}/>
  <section className="surface vocabulary-study-intro"><div><span className="pill">HSK {lesson.level} · Bài {lesson.sequence}</span><h2>{words.length} từ cho một lần học.</h2><p>Đọc nghĩa, nghe từng từ và mở câu ví dụ khi có. Sau đó kiểm tra nhận diện chữ và nghĩa tiếng Việt theo hai chiều.</p></div><Button disabled={!ready||playing||!exercises.length} onClick={()=>start()}>{exercises.some(e=>answered.has(e.id))?'Tiếp tục kiểm tra':'Kiểm tra vốn từ'}<ArrowRight/></Button></section>
  
  {playing?<><div className="lesson-progress" role="progressbar" aria-valuenow={position} aria-valuemin={0} aria-valuemax={exercises.length} aria-label="Tiến độ kiểm tra từ vựng"><span style={{width:`${progressPercent(position,exercises.length)}%`}}/></div><p className="hsk-question-position">Câu {position+1}/{exercises.length}</p><ExerciseCard key={`${run}-${exercises[position].id}`} exercise={exercises[position]} onNext={()=>{if(position+1<exercises.length)setPosition(p=>p+1);else{setPlaying(false);setFinished(true)}}} nextLabel={position+1===exercises.length?'Xem kết quả':'Câu tiếp theo'}/><Button variant="ghost" className="vocabulary-return" onClick={()=>setPlaying(false)}>Về danh sách từ</Button></>:<>
   {finished&&<section className="completion"><CheckCircle2 size={36}/><h2>Đã lưu lượt luyện của bạn.</h2><p>{correct}/{exercises.length} câu đúng độc lập. Đây là kết quả nhận diện từ, chưa đánh giá phát âm hoặc viết.</p><Button variant="outline" onClick={()=>start(true)}>Luyện lại từ đầu</Button>{next&&<Link href={`/hsk/${next.level}/vocabulary/${next.id}`} className="text-link">Bài tiếp theo: {next.title}<ArrowRight size={16}/></Link>}</section>}
   <div className="section-heading"><h2>Từ trong bài</h2><span>{correct}/{exercises.length} câu đúng độc lập</span></div><div className="word-grid">{words.map(w=><DictionaryWord key={w.id} word={w} lessonLink={false}/>)}</div>
  </>}
  <div className="vocabulary-next"><Link href={`/dictionary?level=${lesson.level}`} className="text-link">Từ điển HSK {lesson.level}<ArrowRight size={15}/></Link>{next&&<Link href={`/hsk/${next.level}/vocabulary/${next.id}`} className="text-link">{next.title}<ArrowRight size={15}/></Link>}</div>
 </main>}</Localize>;
}
