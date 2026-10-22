'use client';
import {Localize} from '@/components/i18n/LocaleProvider';
import {useEffect,useRef,useState} from 'react';
import {Mic,Square,Save} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {useStudyStore} from '@/store/useStudyStore';
import {HSK_REVISION,type HskTask} from '@/lib/hsk/catalog';
import {ExercisePicture} from './ExercisePicture';
import {ChineseText} from './ChineseText';
import {useVoiceRecorder} from '@/hooks/useVoiceRecorder';
import {progressPercent} from '@/lib/study-engine';

export function VoicePractice(){
 const voice=useVoiceRecorder(120000),replay=useRef<HTMLAudioElement|null>(null);
 const active=voice.phase==='recording',busy=voice.phase!=='idle';
 return <Localize>{<div className="hsk-voice"><Button variant="outline" disabled={busy&&!active} onClick={()=>{if(active)voice.stop();else{replay.current?.pause();void voice.start();}}}>{active?<Square/>:<Mic/>}{voice.phase==='requesting'?'Đang mở micro…':voice.phase==='processing'?'Đang chuẩn bị bản ghi…':active?'Dừng ghi âm':'Ghi âm tự luyện'}</Button>{busy&&!active&&<Button variant="ghost" onClick={voice.cancel}>Hủy ghi âm</Button>}<small>Tối đa 2 phút · Khử nhiễu, cân bằng âm lượng · Bản ghi chỉ dùng trong phiên này</small>{voice.url&&!busy&&<audio ref={replay} controls src={voice.url} className="recording-player" aria-label="Nghe lại bản ghi HSK"/>}{voice.message&&<p role="status">{voice.message}</p>}</div>}</Localize>;
}
export function HskOpenTask({task:t}:{task:HskTask}){
 const ready=useStudyStore(s=>s.ready);
 const [text,setText]=useState(''),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[error,setError]=useState(''),[loadError,setLoadError]=useState(false),[status,setStatus]=useState(''),[retry,setRetry]=useState(0),[checks,setChecks]=useState<string[]>([]);
 const alive=useRef(true);useEffect(()=>{alive.current=true;return()=>{alive.current=false}},[]);
 useEffect(()=>{if(!ready)return;const controller=new AbortController();setLoading(true);setError('');setLoadError(false);void fetch(`/api/hsk/draft?taskId=${encodeURIComponent(t.id)}`,{cache:'no-store',signal:controller.signal}).then(async r=>{const d=await r.json();if(!r.ok)throw Error(d.error);if(!controller.signal.aborted){setText(d.draft?.text||'');setStatus(d.draft?'Đã mở bản nháp đã lưu.':'');}}).catch(e=>{if(!controller.signal.aborted){setError(e instanceof Error?e.message:'Chưa đọc được bản nháp.');setLoadError(true);}}).finally(()=>{if(!controller.signal.aborted)setLoading(false)});return()=>controller.abort()},[ready,t.id,retry]);
 async function save(){setSaving(true);setError('');try{const r=await fetch('/api/hsk/draft',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({taskId:t.id,revision:HSK_REVISION,text})});const d=await r.json();if(!r.ok)throw Error(d.error);if(alive.current)setStatus('Đã lưu bản nháp vào hồ sơ trên máy chủ localhost. Chưa chấm điểm.');}catch(e){if(alive.current)setError(e instanceof Error?e.message:'Chưa lưu được. Bài làm vẫn ở ô nhập.');}finally{if(alive.current)setSaving(false);}}
 const count=[...text].filter(c=>/\p{Script=Han}/u.test(c)).length;
 return <Localize>{<article className="surface hsk-open-task"><div className="row-between"><h3>{t.title}</h3><span className="pill">Tự luyện · chưa chấm</span></div><p><ChineseText text={t.prompt}/></p>{t.material&&<div className="exercise-passage"><ChineseText text={t.material} label="Nghe văn bản bài tự luyện"/></div>}{t.pictures&&<div className="hsk-story-pictures">{t.pictures.map((name,i)=><div key={`${name}-${i}`}><ExercisePicture name={name} label={`Khung ${i+1}: ${name}`}/><small>Khung {i+1}</small></div>)}</div>}{t.kind==='speaking'&&<VoicePractice/>}
  {t.chart&&<figure className="hsk-chart"><figcaption>Lượt người dùng thư viện · số liệu giả định để luyện</figcaption>{t.chart.map(r=><div key={r.year}><span>{r.year}</span><div className="hsk-chart-track"><span style={{width:`${progressPercent(r.value,Math.max(...t.chart!.map(x=>x.value)))}%`}}/></div><strong>{r.value} người</strong></div>)}</figure>}
  <label className="field"><span>{t.kind==='speaking'?'Ghi chú chuẩn bị và tự nhận xét':'Bài làm của bạn'}</span><textarea aria-label={`Bản nháp: ${t.title}`} maxLength={6000} rows={7} value={text} disabled={loading||loadError||saving} onChange={e=>{setText(e.target.value);setStatus('Có thay đổi chưa lưu.');}} placeholder={loading?'Đang mở bản nháp…':'Nhập nội dung của bạn; có thể dùng bàn phím chữ Hán.'}/><small>{count} chữ Hán{t.minimum?` · Mục tiêu luyện ${t.minimum} chữ`:''} · tối đa 6.000 ký tự</small></label>
  <div className="row"><Button disabled={loading||loadError||saving} onClick={()=>void save()}><Save/>{saving?'Đang lưu…':'Lưu bản nháp'}</Button>{loadError&&<Button variant="outline" onClick={()=>setRetry(n=>n+1)}>Đọc lại bản nháp</Button>}</div>{status&&<p className="hsk-save-status" role="status">{status}</p>}{error&&<p className="feedback incorrect" role="alert">{error}</p>}
  <details className="hsk-help"><summary>Xem khung gợi ý và tự kiểm tra</summary><p><ChineseText text={t.model} label="Nghe mẫu gợi ý"/></p>{t.checklist.map(c=><label className="hsk-self-check" key={c}><input type="checkbox" checked={checks.includes(c)} onChange={e=>setChecks(e.target.checked?[...checks,c]:checks.filter(x=>x!==c))}/><ChineseText text={c} audio={false}/></label>)}<small>Danh sách này hỗ trợ tự sửa bài. Số chữ và các ô đã đánh dấu không chứng minh điểm viết, nói hay dịch.</small></details>
 </article>}</Localize>;
}
