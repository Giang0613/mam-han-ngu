'use client';
import {Localize,useLocale} from '@/components/i18n/LocaleProvider';
import {HAS_IMPORTED_MATERIALS} from '@/lib/edition';
import Link from 'next/link';
import {useState} from 'react';
import {ArrowLeft,ArrowRight,CheckCircle2} from 'lucide-react';
import {hskLevels,hskModules,hskExercises,hskTasks,hskLevelModules} from '@/lib/hsk/catalog';
import {hskGrammar} from '@/lib/hsk/grammar';
import vocabularySummary from '@/lib/hsk/vocabulary-summary.json';
import {hskProgress} from '@/lib/hsk/progress';
import {progressPercent} from '@/lib/study-engine';
import {useStudyStore} from '@/store/useStudyStore';
import {Button} from '@/components/ui/button';
import {PageHeading} from './common';
import {ExerciseCard} from './Exercise';
import {HskOpenTask} from './HskOpenTask';

export function HskOverview(){
 const {data,ready}=useStudyStore(),stats=hskProgress(data),[band,setBand]=useState('all');
 return <Localize>{<main className="workspace"><PageHeading title="HSK 3.0. Từng bậc, từng kỹ năng." description="Lộ trình HSK 1–9 với hướng dẫn, bài luyện, giải thích đáp án và bản nháp cho viết, nói, dịch."/>
  <section className="hsk-intro surface"><div><span className="pill">Lộ trình 9 bậc</span><h2>Bắt đầu ở nơi phù hợp với bạn.</h2><p>Học theo thứ tự: làm quen ngôn ngữ → luyện từng dạng → xem lại lỗi → thực hành viết và nói. Có thể mở bất kỳ bậc nào để xem yêu cầu.</p><Link href={`/hsk/${stats.next.level}/${stats.next.key}`} className="button-link">{ready&&stats.answered.size?'Tiếp tục luyện':'Bắt đầu luyện'}<ArrowRight size={17}/></Link></div><div className="hsk-bank-count"><strong>{hskExercises.length}</strong><span>câu có đáp án tự chấm</span><strong>{hskTasks.length}</strong><span>nhiệm vụ viết, nói, dịch</span></div></section>
  <div className="filters hsk-filter"><label>Chọn nhóm trình độ <select className="form-select" aria-label="Nhóm HSK" value={band} onChange={e=>setBand(e.target.value)}><option value="all">Tất cả HSK 1–9</option><option>Sơ cấp</option><option>Trung cấp</option><option>Cao cấp</option></select></label><span>{stats.answered.size} câu đã làm · {stats.passed.size} câu đúng độc lập</span></div>
  <div className="hsk-level-grid">{hskLevels.filter(l=>band==='all'||band===l.band).map(l=>{const us=hskLevelModules(l.level),items=us.flatMap(u=>u.exercises),correct=items.filter(e=>stats.passed.has(e.id)).length;return <Link className="hsk-level-card" data-tone={l.tone} href={`/hsk/${l.level}`} key={l.level}><div className="row-between"><span className="hsk-level-mark">HSK {l.level}</span><span className="pill">{l.band}</span></div><h2>{l.title}</h2><p>{l.goal}</p><div className="hsk-topic-row">{l.topics.map(t=><span key={t}>{t}</span>)}</div><div className="meter"><span style={{width:`${progressPercent(correct,items.length)}%`}}/></div><div className="row-between"><small>{correct}/{items.length} câu đúng độc lập · {us.length} phần học</small><ArrowRight size={19}/></div></Link>})}</div>
  
 </main>}</Localize>;
}
export function HskLevelPage({level}:{level:number}){
 const {t}=useLocale();
 const info=hskLevels[level-1],units=hskLevelModules(level),data=useStudyStore(s=>s.data),stats=hskProgress(data);
 return <Localize>{<main className="workspace"><Link className="breadcrumb" href="/hsk"><ArrowLeft size={16}/>Lộ trình HSK 1–9</Link><PageHeading title={`HSK ${level} · ${info.title}`} description={info.goal}/>
  <section className="surface hsk-exam"><h3>{level>=7?'Cấu trúc bài thi chung HSK 7–9':'Cấu trúc tham khảo của bậc này'}</h3><div className="hsk-exam-parts">{info.structure.map(s=><div key={s.name}><strong>{s.name}</strong><span>{s.questions} câu · khoảng {s.minutes} phút</span></div>)}</div><p>Tổng khoảng {info.examMinutes} phút{level>=3&&level<=6?`; phần nói riêng khoảng ${info.speakingMinutes} phút`:''}. {level<=6?'Tổng thời gian phần viết/đọc/nghe có tính thời gian điền thông tin và phiếu trả lời.':'Kết quả bài thi chung phân bậc 7, 8 hoặc 9; không có ba đề thi độc lập.'}</p></section>
  <VocabularyLevelSummary level={level}/>
  {level===1&&HAS_IMPORTED_MATERIALS&&<section className="surface material-entry"><div><span className="pill">Học & thực hành trực tiếp</span><h2>15 bài học · 93 bản thu</h2><p>Hội thoại, từ mới, ngữ pháp và bài tập có pinyin, nút dịch tiếng Việt, luyện nói và luyện viết.</p></div><Link href="/hsk/1/materials" className="button-link">Mở bài học HSK 1<ArrowRight size={17}/></Link></section>}
  <div className="section-heading"><h2>Học và luyện theo dạng</h2><span>{units.length} phần học</span></div><div className="hsk-unit-grid">{units.map((u,i)=>{const done=u.exercises.filter(e=>stats.passed.has(e.id)).length;return <Link className="hsk-unit-card" href={`/hsk/${level}/${u.key}`} key={u.id} data-tone={info.tone}><div className="row-between"><span className="pill">{String(i+1).padStart(2,'0')} · {u.skill}</span>{u.supplement&&<small>Bổ trợ</small>}</div><h3>{u.title}</h3><p>{u.goal}</p><div className="row-between"><small>{u.exercises.length?`${done}/${u.exercises.length} câu đúng độc lập`:`${u.tasks.length} nhiệm vụ tự luyện`}</small><ArrowRight size={18}/></div></Link>})}</div>
  <section className="surface hsk-language-map"><h3>Ngữ pháp trọng tâm của lộ trình</h3><p>Phân bậc dưới đây là đề xuất giảng dạy của Mầm Hán Ngữ; không phải danh mục ngữ pháp đầy đủ của CTI.</p><div>{hskGrammar.filter(g=>g.level===level).map(g=><details key={g.focus}><summary><ChineseText text={t(g.focus)} audio={false}/></summary><p><ChineseText text={g.note}/></p><div><ChineseText text={g.sentence.replace('___',g.answer)}/></div></details>)}</div><Link href={`/hsk/${level}/cloze`} className="text-link">Luyện các cấu trúc này<ArrowRight size={16}/></Link></section>
  <section className="soft-note hsk-plan"><h3>Chu trình ôn đề xuất</h3><ol><li>Đọc cách làm và luyện một nhóm câu, chưa cần chạy theo tốc độ.</li><li>Xem lại giải thích, luyện lại câu sai; chỉ tính đúng độc lập khi không dùng gợi ý.</li><li>Làm bài viết hoặc nói, lưu bản nháp rồi tự sửa bằng khung tiêu chí.</li><li>Đối chiếu mẫu đề chính thức trước khi luyện tốc độ; không quy đổi tỉ lệ đúng ở đây thành điểm thi.</li></ol>{level>1&&<Link href={`/hsk/${level-1}`} className="text-link">Ôn lại HSK {level-1}</Link>}{level<9&&<Link href={`/hsk/${level+1}`} className="text-link">Xem mục tiêu HSK {level+1}<ArrowRight size={15}/></Link>}</section>
  
 </main>}</Localize>;
}
function VocabularyLevelSummary({level}:{level:number}){const {locale}=useLocale();
 const s=vocabularySummary.levels.find(x=>x.level===level);
 if(!s?.words)return null;
 return <Localize>{<section className="surface vocabulary-level-summary" data-tone={level<=3?'mint':level<=6?'blue':'coral'}><div><span className="pill">Kho từ vựng HSK</span><h2>{s?.words.toLocaleString((locale==='en'?'en-US':'vi-VN'))} mục từ · {s?.lessons} bài ngắn</h2><p>Học theo chủ đề với pinyin, nút nghe, nghĩa tiếng Việt và kiểm tra hai chiều. Mỗi bài tối đa 16 từ.</p></div><Link href={`/hsk/${level}/vocabulary`} className="button-link">Học từ HSK {level}<ArrowRight size={17}/></Link></section>}</Localize>;
}
export function HskModulePage({id}:{id:string}){
 const u=hskModules.find(x=>x.id===id)!,{data,ready}=useStudyStore(),stats=hskProgress(data);
 const [position,setPosition]=useState(0),[playing,setPlaying]=useState(false),[finished,setFinished]=useState(false),[run,setRun]=useState(0);
 const answered=u.exercises.filter(e=>stats.answered.has(e.id)).length;
 function start(all=false){const missing=u.exercises.findIndex(e=>!stats.answered.has(e.id));setPosition(all||missing<0?0:missing);setRun(n=>n+1);setFinished(false);setPlaying(true);}
 return <Localize>{<main className="workspace hsk-unit-workspace"><Link className="breadcrumb" href={`/hsk/${u.level}`}><ArrowLeft size={16}/>HSK {u.level} · Các phần học</Link><PageHeading title={u.title} description={u.goal}/><section className="surface hsk-guide"><div><h3>Cách làm từng bước</h3><ol>{u.method.map(s=><li key={s}><ChineseText text={s}/></li>)}</ol></div><div><h3>Những lỗi cần tránh</h3><ul>{u.mistakes.map(s=><li key={s}><ChineseText text={s}/></li>)}</ul></div></section>
  <p className="content-note">Bài luyện do Mầm Hán Ngữ tự biên soạn, có đoạn rút gọn; chưa được giáo viên duyệt. {u.supplement?'Đây là luyện kỹ năng bổ trợ, không phải một phần thi riêng của bậc này.':''}</p>
  {!!u.exercises.length&&<><div className="hsk-run-summary"><span>{answered}/{u.exercises.length} câu đã làm · {u.exercises.filter(e=>stats.passed.has(e.id)).length} đúng độc lập</span>{!playing&&<Button disabled={!ready} onClick={()=>start()}>{answered&&answered<u.exercises.length?'Tiếp tục phần đang luyện':'Bắt đầu phần luyện'}<ArrowRight/></Button>}</div>{playing?<><div className="lesson-progress" role="progressbar" aria-valuenow={position} aria-valuemin={0} aria-valuemax={u.exercises.length} aria-label="Tiến độ phần HSK"><span style={{width:`${progressPercent(position,u.exercises.length)}%`}}/></div><p className="hsk-question-position">Câu {position+1}/{u.exercises.length}</p><ExerciseCard key={`${run}-${u.exercises[position].id}`} exercise={u.exercises[position]} onNext={()=>{if(position+1<u.exercises.length)setPosition(position+1);else {setPlaying(false);setFinished(true)}}} nextLabel={position+1===u.exercises.length?'Xem kết quả phần luyện':'Câu tiếp theo'}/></>:finished&&<section className="completion"><CheckCircle2 size={38}/><h2>Đã lưu các lượt luyện.</h2><p>{u.exercises.filter(e=>stats.passed.has(e.id)).length}/{u.exercises.length} câu đúng độc lập. Lượt dùng gợi ý không tính là đã nhớ độc lập.</p><Button variant="outline" onClick={()=>start(true)}>Làm lại từ đầu</Button></section>}</>}
  {!!u.tasks.length&&<div className="stack hsk-task-list">{u.tasks.map(t=><HskOpenTask key={t.id} task={t}/>)}</div>}
  <Link href={`/hsk/${u.level}`} className="text-link hsk-back">Về lộ trình bậc này<ArrowRight size={16}/></Link>
 </main>}</Localize>;
}

import {ChineseText} from "./ChineseText";
