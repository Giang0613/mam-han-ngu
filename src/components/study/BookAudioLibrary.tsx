'use client';
import {useRef,useState} from 'react';
import Link from 'next/link';
import {ArrowLeft,Headphones} from 'lucide-react';
import {Localize,useLocale} from '@/components/i18n/LocaleProvider';
import {Button} from '@/components/ui/button';
import {playableBookAudio} from '@/lib/hsk/book-audio';
import {PageHeading} from './common';

const pageSize=24;
export function BookAudioLibrary(){
 const {t,locale}=useLocale();
 const [collection,setCollection]=useState('textbook'),[lesson,setLesson]=useState('all'),[page,setPage]=useState(0);
 const [failed,setFailed]=useState<string[]>([]),[rate,setRate]=useState(1);
 const active=useRef<HTMLAudioElement|null>(null);
 const filtered=playableBookAudio.filter(a=>a.collection===collection&&(lesson==='all'||a.lesson===Number(lesson)));
 const lessons=[...new Set(playableBookAudio.filter(a=>a.collection===collection).map(a=>a.lesson))].sort((a,b)=>a-b);
 const tracks=filtered.slice(page*pageSize,(page+1)*pageSize);
 function stop(){active.current?.pause();active.current=null;}
 return <Localize><main className="workspace book-audio-workspace">
  <Link href="/hsk/1" className="breadcrumb"><ArrowLeft size={16}/>HSK 1 · Lộ trình</Link>
  <PageHeading title="Audio sách HSK 1" description="Nghe bản thu theo bài. Trang này chỉ có âm thanh, không kèm PDF, ảnh sách hoặc đáp án."/>
  <div className="surface book-audio-intro"><Headphones size={25}/><p>Chọn một bản thu để nghe. Chỉ một bản thu phát tại một thời điểm; các bản khác chỉ tải khi bạn mở nghe.</p></div>
  <div className="filters book-audio-filters">
   <label>Bộ audio<select className="form-select" value={collection} onChange={e=>{stop();setCollection(e.target.value);setLesson('all');setPage(0)}}><option value="textbook">Audio sách bài học</option><option value="workbook">Audio sách bài tập</option></select></label>
   <label>Chọn bài nghe<select className="form-select" value={lesson} onChange={e=>{stop();setLesson(e.target.value);setPage(0)}}><option value="all">Tất cả bài nghe</option>{lessons.map(n=><option value={n} key={n}>{n===16?t('Ôn tập tổng hợp'):`${t('Bài')} ${String(n).padStart(2,'0')}`}</option>)}</select></label>
   <label>Tốc độ nghe<select className="form-select" value={rate} onChange={e=>{const value=Number(e.target.value);setRate(value);if(active.current)active.current.playbackRate=value}}>{[.75,1,1.25].map(value=><option value={value} key={value}>{value}×</option>)}</select></label>
  </div>
  <p className="content-note">{filtered.length.toLocaleString(locale==='en'?'en-US':'vi-VN')} {t('bản thu trong danh sách')}</p>
  <div className="book-audio-grid">{tracks.map(track=><article className="surface book-audio-card" key={track.id}>
   <div className="row-between"><span className="pill">{track.lesson===16?t('Ôn tập tổng hợp'):`${t('Bài')} ${String(track.lesson).padStart(2,'0')}`}</span><small translate="no">{track.id}</small></div>
   <h2>{track.collection==='textbook'?`${t('Bản thu')} ${track.track}`:t('Đoạn nghe bài tập')}</h2>
   <audio controls preload="none" src={track.url} aria-label={`${t('Nghe bản thu')} ${track.id}`} onPlay={e=>{if(active.current!==e.currentTarget)active.current?.pause();active.current=e.currentTarget;e.currentTarget.playbackRate=rate}} onError={()=>setFailed(previous=>previous.includes(track.id)?previous:[...previous,track.id])}/>
   {failed.includes(track.id)&&<p role="status" className="feedback incorrect">Không tải được bản thu. Thử tải lại trang hoặc mở tệp âm thanh bên dưới.</p>}
   <a href={track.url} download className="text-link">Tải tệp âm thanh</a>
  </article>)}</div>
  <div className="pagination"><Button variant="outline" disabled={page===0} onClick={()=>{stop();setPage(p=>p-1)}}>Trang trước</Button><span>{t('Trang')} {page+1} / {Math.max(1,Math.ceil(filtered.length/pageSize))}</span><Button variant="outline" disabled={(page+1)*pageSize>=filtered.length} onClick={()=>{stop();setPage(p=>p+1)}}>Trang sau</Button></div>
  <p className="content-note">Bản thu thuộc bên cung cấp học liệu; giấy phép MIT của mã nguồn không áp dụng cho các tệp audio.</p>
 </main></Localize>;
}
