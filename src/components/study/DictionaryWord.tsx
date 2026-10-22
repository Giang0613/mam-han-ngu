'use client';
import {Localize} from '@/components/i18n/LocaleProvider';
import {useState} from 'react';
import Link from 'next/link';
import {BookmarkPlus,Check,ArrowRight} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {useStudyStore} from '@/store/useStudyStore';
import type {DictionaryEntry} from '@/lib/dictionary-server';
import {chineseSpeechText} from '@/lib/chinese-reading';
import {AudioButton} from './common';
import {ChineseText} from './ChineseText';
import {useLocale} from '@/components/i18n/LocaleProvider';
import {formatDictionaryMeaning} from '@/lib/dictionary-format';

export function DictionaryWord({word:w,lessonLink=true}:{word:DictionaryEntry;lessonLink?:boolean}){
 const {locale}=useLocale();
 const {data,ready,mutate,announce}=useStudyStore(),[saving,setSaving]=useState(false);
 const saved=data.cards.some(c=>c.id===w.id);
 const details=w.dictionaryDetails||formatDictionaryMeaning(w.meaningEn||w.meaning);
 const english=details.definitions.join('; ')||'See spelling and usage notes.';
 const englishMeaning=locale==='en'||w.language==='en',longMeaning=englishMeaning&&english.length>220;
 const englishPreview=longMeaning?english.split(';').slice(0,3).join(';')+'…':english;
 async function save(){setSaving(true);try{await mutate({action:'saveWord',wordId:w.id});announce('Đã lưu từ vào danh sách ôn.')}catch(e){announce(e instanceof Error?e.message:'Chưa lưu được từ.')}finally{setSaving(false)}}
 return <Localize>{<article className="dictionary-result">
  {w.level&&<div className="vocabulary-tags"><span className="pill" data-tone={w.level<=3?'mint':w.level<=6?'blue':'coral'}>HSK {w.level}</span><small>{w.topicTitle}</small></div>}
  <div className="row-between"><strong className="word-zh" lang="zh-Hans">{w.hanzi}</strong><AudioButton text={chineseSpeechText(w.hanzi)} pinyin={w.pinyin} compact label={`Nghe ${w.hanzi}`}/></div>
  <span className="pinyin" lang="zh-Latn" translate="no">{w.pinyin}</span>
  {!!w.aliases?.length&&<small className="dictionary-traditional">Cách viết khác: {w.aliases.join(' / ')}</small>}
  {w.traditional&&w.traditional!==w.hanzi&&<small className="dictionary-traditional">Phồn thể: {w.traditional}</small>}
  <p className="translation"><small className="dictionary-language">{locale==='en'?'English meaning':w.language==='vi'?'Nghĩa tiếng Việt':'Nghĩa tiếng Anh'}</small><br/>{englishMeaning?<span lang="en" translate="no">{englishPreview}</span>:w.meaning}</p>
  {!!details.classifiers.length&&<div className="dictionary-classifiers"><small>{locale==='en'?'Measure words':'Lượng từ'}</small><div>{details.classifiers.map(c=><span className="dictionary-classifier" key={c.hanzi+'-'+c.pinyin}><span lang="zh-Hans" translate="no">{c.hanzi}</span>{c.pinyin&&<span lang="zh-Latn" translate="no">{c.pinyin}</span>}</span>)}</div></div>}
  {(locale==='en'?w.meaningStatus==='draft':w.translationStatus==='draft')&&<p className="translation-draft">Nghĩa dịch tự động · cần đối chiếu ngữ cảnh</p>}
  <div className="dictionary-actions"><Button variant="outline" size="sm" disabled={!ready||saved||saving} onClick={()=>void save()}>{saved?<Check/>:<BookmarkPlus/>}{saved?'Đã lưu':saving?'Đang lưu…':'Lưu để ôn'}</Button>{(w.meaningSource==='CC-CEDICT'||w.source==='CC-CEDICT')&&<small className="dictionary-language">CC-CEDICT</small>}</div>
  {(w.senses?.some(s=>s.example||s.partOfSpeech)||w.meaningEn||details.notes.length||longMeaning)&&<details className="vocabulary-word-details"><summary>Ví dụ & cách dùng</summary>
   {!!details.notes.length&&<div className="dictionary-usage-notes"><small>{locale==='en'?'Spelling and usage notes':'Ghi chú cách viết và cách dùng'}</small><ul>{details.notes.map(note=><li key={note} lang="en" translate="no">{note}</li>)}</ul></div>}
   {longMeaning&&<div><small>Full dictionary entry</small><p lang="en" translate="no">{english}</p></div>}
   {w.senses?.map((s,i)=><div className="vocabulary-sense" key={i}>{s.partOfSpeech&&<small>{s.partOfSpeech}</small>}{w.senses!.length>1&&<p>{s.meaning}</p>}{s.example&&<><ChineseText text={s.example} pinyin={s.examplePinyin}/>{s.exampleMeaning&&<p>{s.exampleMeaning}</p>}</>}</div>)}
   {w.meaningEn&&locale==='vi'&&<div><small>Nghĩa tiếng Anh</small><p lang="en" translate="no">{english}</p></div>}
   {locale==='en'&&w.senses?.some(s=>s.exampleMeaning)&&<small>Example translations are drafts and may need context corrections.</small>}
  </details>}
  {lessonLink&&w.lessonId&&<Link href={`/hsk/${w.level}/vocabulary/${w.lessonId}`} className="text-link vocabulary-word-lesson">{w.lessonTitle}<ArrowRight size={15}/></Link>}
  <div className="character-buttons" aria-label="Chọn chữ để luyện viết">{[...new Set([...w.hanzi])].filter(c=>/\p{Script=Han}/u.test(c)).map(c=><Link key={c} href={`/practice?char=${encodeURIComponent(c)}`} aria-label={`Luyện viết chữ ${c}`}>{c}</Link>)}</div>
  <p className="source">Chọn một chữ để luyện viết.</p>
 </article>}</Localize>;
}
