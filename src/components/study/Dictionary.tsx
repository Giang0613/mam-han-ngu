'use client';
import {Localize,useLocale} from '@/components/i18n/LocaleProvider';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {countText} from '@/lib/i18n/counts';
import {ArrowRight} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {PageHeading,SearchInput,EmptyState,LoadingCards} from '@/components/study/common';
import {DictionaryWord} from './DictionaryWord';
import type {DictionaryEntry} from '@/lib/dictionary-server';
type Results={results:DictionaryEntry[];total:number;corpus:number;hskWords:number;hasMore:boolean;levelCounts:{level:number;count:number}[];topics:{id:string;title:string}[]};

export function DictionaryPage({initialQuery='',initialLevel='all'}:{initialQuery?:string;initialLevel?:string}){const {locale}=useLocale();
 const [q,setQ]=useState(initialQuery),[level,setLevel]=useState(initialLevel),[topic,setTopic]=useState(''),[page,setPage]=useState(0);
 const [result,setResult]=useState<Results|null>(null),[busy,setBusy]=useState(true),[error,setError]=useState('');
 useEffect(()=>{
  const cancel=new AbortController();setBusy(true);setError('');
  const timer=setTimeout(()=>{
   const params=new URLSearchParams({q,level,scope:'hsk',topic,page:String(page)});
   fetch(`/api/dictionary?${params}`,{signal:cancel.signal}).then(async r=>{const d=await r.json();if(!r.ok)throw Error(d.error);setResult(d)}).catch(e=>{if(e.name!=='AbortError')setError(e.message)}).finally(()=>{if(!cancel.signal.aborted)setBusy(false)});
  },250);
  return()=>{clearTimeout(timer);cancel.abort()};
 },[q,level,topic,page,locale]);
 return <Localize>{<main className="workspace"><PageHeading title="Từ điển. Học theo cấp, nhớ theo chủ đề." description={`Tra chữ Hán, pinyin hoặc nghĩa tiếng Việt. ${result?`${result.hskWords.toLocaleString((locale==='en'?'en-US':'vi-VN'))} mục từ, chia theo HSK 1–9.`:'Khám phá từ vựng từ HSK 1 đến HSK 9.'}`}/>
  <div className="filters dictionary-filters"><SearchInput value={q} onChange={s=>{setQ(s);setPage(0)}} placeholder="你好, xue sheng, học sinh…" label="Tra từ điển"/><Link href="/learn" className="button-link secondary">Từ đã lưu<ArrowRight size={15}/></Link></div>
  <section className="dictionary-filter-panel" aria-label="Bộ lọc từ điển">
   <label>Cấp HSK<select className="form-select" value={level} onChange={e=>{setLevel(e.target.value);setTopic('');setPage(0)}}><option value="all">Tất cả cấp HSK</option>{Array.from({length:9},(_,i)=><option key={i} value={String(i+1)}>HSK {i+1}{result?` · ${result.levelCounts[i]?.count.toLocaleString((locale==='en'?'en-US':'vi-VN'))} mục`:''}</option>)}<option value="79">HSK 7–9 · nâng cao</option></select></label>
   <label>Chủ đề<select className="form-select" value={topic} onChange={e=>{setTopic(e.target.value);setPage(0)}}><option value="">Tất cả chủ đề</option>{result?.topics.map(t=><option key={t.id} value={t.id}>{t.title}</option>)}</select></label>
  </section>
  {!!result&&!busy&&<div className="section-heading dictionary-count"><p aria-live="polite">{locale==='en'?`${countText(result.total,'result',locale)} · Page ${page+1}`:`${result.total.toLocaleString('vi-VN')} kết quả · Trang ${page+1}`}</p>{level!=='all'&&level!=='79'&&<Link href={`/hsk/${level}/vocabulary`} className="text-link">Học từ theo bài<ArrowRight size={15}/></Link>}</div>}
  {error?<p className="feedback incorrect" role="alert">{error} Hãy tải lại trang để thử lại.</p>:busy?<LoadingCards label="Đang tìm từ…"/>:!result?.results.length?<EmptyState title="Chưa tìm thấy từ" description="Thử chữ Hán, pinyin không dấu, một nghĩa ngắn hơn hoặc đổi bộ lọc."/>:<><div className="word-grid">{result.results.map(w=><DictionaryWord key={w.id} word={w}/>)}</div><div className="pagination"><Button variant="outline" disabled={page===0} onClick={()=>setPage(p=>p-1)}>Trang trước</Button><span>Trang {page+1} / {Math.max(1,Math.ceil(result.total/24))}</span><Button variant="outline" disabled={!result.hasMore} onClick={()=>setPage(p=>p+1)}>Trang sau</Button></div></>}
 </main>}</Localize>;
}
