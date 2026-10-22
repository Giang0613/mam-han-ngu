'use client';
import {Languages} from 'lucide-react';
import {useRouter} from 'next/navigation';
import {useLocale} from './LocaleProvider';
import {isLocale} from '@/lib/i18n/types';
import {useStudyStore} from '@/store/useStudyStore';
export function LanguageSwitch(){
 const {locale,setLocale}=useLocale(),router=useRouter();
 async function change(value:string){if(!isLocale(value))return;setLocale(value);router.refresh();
  if(useStudyStore.getState().loading)await new Promise<void>(resolve=>{const unsubscribe=useStudyStore.subscribe(state=>{if(!state.loading){unsubscribe();resolve();}})});
  await useStudyStore.getState().load();
 }
 return <label className="language-switch" translate="no"><Languages size={16} aria-hidden="true"/><span className="sr-only">{locale==='en'?'Interface language':'Ngôn ngữ giao diện'}</span><select aria-label={locale==='en'?'Interface language':'Ngôn ngữ giao diện'} value={locale} onChange={e=>void change(e.target.value)}><option value="vi" lang={locale==='en'?'en':'vi'}>{locale==='en'?'Vietnamese':'Tiếng Việt'}</option><option value="en" lang="en">English</option></select></label>;
}
