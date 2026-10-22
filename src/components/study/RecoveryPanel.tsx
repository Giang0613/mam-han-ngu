'use client';
import {useState,useEffect} from 'react';
import {Download,KeyRound} from 'lucide-react';
import {useLocale} from '@/components/i18n/LocaleProvider';
import {recoveryCopy} from '@/lib/i18n/recovery';
import {useStudyStore} from '@/store/useStudyStore';
import {Button} from '@/components/ui/button';

export function RecoveryPanel(){
 const {locale}=useLocale(),t=recoveryCopy[locale];
 const {load,announce}=useStudyStore();
 const [code,setCode]=useState(''),[entered,setEntered]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 useEffect(()=>setError(''),[locale]);
 async function request(payload:unknown){
  const response=await fetch('/api/profile/recovery',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  const result=await response.json();
  if(!response.ok)throw Error(result.error||t.failed);
  return result;
 }
 async function generate(){
  setBusy(true);setError('');setCode('');
  try{const result=await request({action:'create'});setCode(result.code);}
  catch(e){setError(e instanceof Error?e.message:t.failed);}finally{setBusy(false);}
 }
 async function restore(){
  setBusy(true);setError('');
  try{await request({action:'restore',code:entered.trim()});setCode('');setEntered('');await load();announce(t.restored);}
  catch(e){setError(e instanceof Error?e.message:t.failed);}finally{setBusy(false);}
 }
 function download(){
  const url=URL.createObjectURL(new Blob([code+'\n'],{type:'text/plain'})),a=document.createElement('a');
  a.href=url;a.download='mandarin-sprout-recovery.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 return <section className="surface recovery-panel">
  <h3><KeyRound size={18} aria-hidden="true" style={{display:'inline',marginRight:8}}/>{t.title}</h3>
  <p className="content-note">{t.description}</p>
  <p className="content-note">{t.warning}</p>
  <Button variant="outline" disabled={busy} onClick={()=>void generate()}>{busy?t.restoring:t.generate}</Button>
  {code&&<div style={{marginTop:16}}>
   <label className="field"><span>{t.saved}</span><textarea value={code} readOnly rows={3} autoComplete="off" spellCheck={false} aria-label={t.label}/></label>
   <Button variant="outline" onClick={download}><Download size={16}/>{t.download}</Button>
  </div>}
  <form onSubmit={event=>{event.preventDefault();void restore();}} style={{marginTop:20}}>
   <label className="field"><span>{t.label}</span><input value={entered} onChange={event=>setEntered(event.target.value)} maxLength={100} autoComplete="off" spellCheck={false} placeholder="MHS-…" required/></label>
   <p className="content-note">{t.different}</p>
   <Button type="submit" disabled={busy||!entered.trim()}>{busy?t.restoring:t.restore}</Button>
  </form>
  <p className="content-note">{t.noCode}</p>
  {error&&<p className="feedback incorrect" role="alert">{error}</p>}
 </section>;
}
