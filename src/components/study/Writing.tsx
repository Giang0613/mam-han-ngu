'use client';
import {Localize,useLocale} from '@/components/i18n/LocaleProvider';
import {useEffect,useRef,useState} from 'react';
import type HanziWriter from 'hanzi-writer';
import {Play,PenLine,RotateCcw,Search} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {writingReadings,writingAudioContexts} from '@/lib/writing-readings';
import {readingFor} from '@/lib/chinese-reading';
import type {WritingDetail,WritingIndex} from '@/lib/writing-types';
import {AudioButton} from './common';
import {ChineseText} from './ChineseText';

export function WritingLab({initial='你'}:{initial?:string}){
 const {locale}=useLocale(),number=(value:number)=>value.toLocaleString(locale==='en'?'en-US':'vi-VN');
 const [character,setCharacter]=useState(initial),[status,setStatus]=useState('Đang tải thứ tự nét…'),[ready,setReady]=useState(false),[quiz,setQuiz]=useState(false),[attempt,setAttempt]=useState(0),[reload,setReload]=useState(0),[chosenReading,setChosenReading]=useState('');
 const [q,setQ]=useState(''),[level,setLevel]=useState('0'),[strokes,setStrokes]=useState('0'),[page,setPage]=useState(0),[index,setIndex]=useState<WritingIndex|null>(null),[busy,setBusy]=useState(true),[error,setError]=useState(''),[retry,setRetry]=useState(0),[detail,setDetail]=useState<WritingDetail|null>(null);
 const selected=detail?.character===character?detail:null;
 const readings=selected?.readings||writingReadings[character]||[readingFor(character)],reading=readings.includes(chosenReading)?chosenReading:readings[0],audioContext=writingAudioContexts[`${character}|${reading}`];
 const canvas=useRef<HTMLDivElement>(null),writer=useRef<HanziWriter|null>(null),generation=useRef(0);
 function choose(char:string){setCharacter(char);setChosenReading('');}
 useEffect(()=>{
  const controller=new AbortController();setBusy(true);setError('');
  const timer=setTimeout(()=>{void fetch(`/api/writing?${new URLSearchParams({q,level,strokes,page:String(page)})}`,{signal:controller.signal}).then(async response=>{const data=await response.json();if(!response.ok)throw Error(data.error);if(!controller.signal.aborted)setIndex(data);}).catch(cause=>{if(!controller.signal.aborted)setError(cause instanceof Error?cause.message:'Chưa tải được kho luyện viết. Hãy thử lại.');}).finally(()=>{if(!controller.signal.aborted)setBusy(false);});},200);
  return()=>{clearTimeout(timer);controller.abort();};
 },[q,level,strokes,page,locale,retry]);
 useEffect(()=>{
  const controller=new AbortController();setDetail(null);
  void fetch(`/api/writing?character=${encodeURIComponent(character)}`,{signal:controller.signal}).then(async response=>{if(!response.ok)return;const data=await response.json();if(!controller.signal.aborted)setDetail(data);}).catch(()=>{});
  return()=>controller.abort();
 },[character,locale]);
 useEffect(()=>{
  let active=true;const run=++generation.current,controller=new AbortController();setReady(false);setQuiz(false);setStatus('Đang tải thứ tự nét…');
  const target=canvas.current!,size=()=>Math.min(280,Math.floor(target.parentElement?.getBoundingClientRect().width||280));target.replaceChildren();
  const observer=new ResizeObserver(()=>{const width=size();writer.current?.updateDimensions({width,height:width,padding:22});});observer.observe(target.parentElement!);
  void import('hanzi-writer').then(({default:Writer})=>{
   if(!active)return;const width=size();
   writer.current=Writer.create(target,character,{width,height:width,padding:22,strokeColor:'#111111',outlineColor:'#d6d9de',drawingColor:'#0b6548',radicalColor:'#111111',highlightColor:'#0b6548',strokeAnimationSpeed:.75,delayBetweenStrokes:250,showCharacter:true,showOutline:true,
    onLoadCharDataError:()=>{if(active&&run===generation.current){setReady(false);setStatus('Chưa có dữ liệu nét cho chữ này. Hãy chọn một chữ trong danh sách bên dưới.');}},
    charDataLoader:(char,complete,failed)=>{fetch(`/hanzi/${encodeURIComponent(char)}.json`,{signal:controller.signal}).then(response=>{if(!response.ok)throw Error('missing');return response.json();}).then(data=>{if(active&&run===generation.current){complete(data);setReady(true);setStatus('Xem thứ tự nét, rồi tự viết theo hướng dẫn.');}}).catch(()=>{if(active)failed();});},
   });
  }).catch(()=>{if(active)setStatus('Chưa tải được công cụ viết. Hãy thử lại.');});
  return()=>{active=false;generation.current++;controller.abort();observer.disconnect();writer.current?.cancelQuiz();void writer.current?.pauseAnimation().catch(()=>{});writer.current=null;target.replaceChildren();};
 },[character,reload]);
 function begin(){
  if(!writer.current||!ready)return;const run=generation.current;setQuiz(true);setStatus('Viết nét đầu tiên trên ô. Công cụ sẽ gợi ý nếu bạn cần.');
  void writer.current.quiz({showHintAfterMisses:2,onMistake:()=>{if(run===generation.current)setStatus('Nét này chưa khớp. Thử lại theo thứ tự và hướng nét nhé.');},onCorrectStroke:({strokeNum})=>{if(run===generation.current)setStatus(`Đúng nét ${strokeNum+1}. Tiếp tục nhé!`);},onComplete:({totalMistakes})=>{if(run!==generation.current)return;setQuiz(false);setAttempt(value=>value+1);setStatus(`Hoàn thành chữ ${character}! ${totalMistakes} lần cần thử lại. Đây là kết quả tập viết, không phải điểm thi.`);}});
 }
 return <Localize>{<div className="writing-layout">
  <section className="surface writing-main">
   <div className="row-between"><span className="pill">Luyện thứ tự nét</span><AudioButton text={audioContext?.zh||character} pinyin={audioContext?.py||reading} label={audioContext?`Nghe trong ${audioContext.zh}`:'Nghe chữ đang viết'} compact/></div>
   <div className="writing-canvas"><div className="grid-guide"/><div ref={canvas} aria-label={`Ô luyện viết chữ ${character}`} className="hanzi-target"/></div>
   <ChineseText text={character} pinyin={reading} audio={false} className="writing-reading"/>
   {selected&&<p className="writing-stroke-count">{selected.strokes} {locale==='en'?(selected.strokes===1?'stroke':'strokes'):'nét'}</p>}
   {readings.length>1&&<label className="field"><span>Cách đọc thường dùng</span><select className="form-select" aria-label="Cách đọc chữ đang viết" value={reading} onChange={event=>setChosenReading(event.target.value)}>{readings.map(py=><option value={py} key={py}>{py}</option>)}</select></label>}
   {audioContext&&<p className="content-note">Nghe cách đọc này trong <ChineseText text={audioContext.zh} pinyin={audioContext.py} audio={false}/> ({reading}).</p>}
   <p className="writing-status" role="status">{status}</p>
   <div className="button-row"><Button variant="outline" disabled={!ready} onClick={()=>{writer.current?.cancelQuiz();setQuiz(false);void writer.current?.animateCharacter();setStatus('Quan sát cách viết từng nét.');}}><Play/>Xem cách viết</Button><Button disabled={!ready||quiz} onClick={begin}><PenLine/>Tự viết</Button><Button variant="ghost" size="icon" aria-label="Tải lại ô viết" onClick={()=>setReload(value=>value+1)}><RotateCcw/></Button></div>
   <small>Đã hoàn thành {attempt} lượt trong phiên luyện này.</small>
   {selected&&<section className="writing-examples"><h3>Gặp chữ này trong từ vựng</h3>{selected.examples.map(word=><article key={word.id}><ChineseText text={word.hanzi} pinyin={word.pinyin}/><p>{word.meaning}</p><div className="character-buttons">{[...new Set([...word.hanzi])].filter(char=>/\p{Script=Han}/u.test(char)).map(char=><button type="button" key={char} aria-label={`Luyện viết chữ ${char}`} aria-pressed={char===character} onClick={()=>choose(char)}>{char}</button>)}</div></article>)}</section>}
  </section>
  <aside className="stack writing-library"><section className="surface">
   <span className="eyebrow">KHO CHỮ HÁN ĐỂ LUYỆN VIẾT</span>
   {index&&<p className="writing-library-count"><strong>{number(index.corpus)}</strong> chữ có dữ liệu nét</p>}
   <form className="writing-search" onSubmit={event=>{event.preventDefault();const char=[...q].find(value=>/\p{Script=Han}/u.test(value))||index?.results[0]?.character;if(char)choose(char);}}>
    <label className="search-input"><Search size={18}/><input aria-label="Tìm chữ, pinyin hoặc từ vựng" placeholder="VD: 学, xué, học" value={q} maxLength={80} onChange={event=>{setQ(event.target.value);setPage(0);}}/></label>
    <Button type="submit" disabled={!q.trim()||busy}>Chọn</Button>
   </form>
   <div className="writing-filters"><label className="field"><span>Nhóm từ vựng</span><select className="form-select" aria-label="Lọc chữ theo nhóm HSK" value={level} onChange={event=>{setLevel(event.target.value);setPage(0);}}><option value="0">Tất cả nhóm HSK</option>{[1,2,3,4,5,6].map(value=><option value={value} key={value}>HSK {value}</option>)}<option value="79">HSK 7–9</option></select></label><label className="field"><span>Số nét</span><select className="form-select" aria-label="Lọc theo số nét" value={strokes} onChange={event=>{setStrokes(event.target.value);setPage(0);}}><option value="0">Tất cả số nét</option><option value="1">1–5</option><option value="6">6–10</option><option value="11">11–15</option><option value="16">16+</option></select></label></div>
   <p className="content-note">Nhóm HSK dựa trên từ vựng chứa chữ.</p>
   {error?<div role="alert" className="feedback incorrect"><p>{error}</p><Button variant="outline" onClick={()=>setRetry(value=>value+1)}>Thử lại</Button></div>:busy?<p role="status" className="writing-library-status">Đang tìm chữ…</p>:!index?.results.length?<p className="writing-library-status">Chưa có chữ phù hợp. Thử từ khóa hoặc bộ lọc khác.</p>:<>
    <div className="character-picker" aria-label="Danh sách chữ luyện viết">{index.results.map(item=><Button key={item.character} variant={character===item.character?'default':'outline'} aria-label={`Luyện viết chữ ${item.character}`} aria-pressed={character===item.character} onClick={()=>choose(item.character)}><ChineseText text={item.character} pinyin={item.readings[0]} audio={false}/></Button>)}</div>
    <div className="writing-pagination"><Button variant="outline" disabled={!page||busy} onClick={()=>setPage(value=>value-1)}>Trang trước</Button><span>{number(index.total)} chữ · <span>Trang</span> {page+1}</span><Button variant="outline" disabled={!index.hasMore||busy} onClick={()=>setPage(value=>value+1)}>Trang sau</Button></div>
   </>}
  </section><section className="soft-note"><h3>Chậm một chút, đúng từng nét.</h3><p>Thường viết từ trên xuống, từ trái sang phải. Hãy xem mẫu của từng chữ vì có những trường hợp riêng.</p><p>Những nét bạn vẽ chỉ dùng để luyện tại đây.</p><p className="writing-source"><span>Nguồn dữ liệu nét:</span> <a href="https://github.com/chanind/hanzi-writer-data" target="_blank" rel="noreferrer">Hanzi Writer Data</a></p></section></aside>
 </div>}</Localize>;
}
