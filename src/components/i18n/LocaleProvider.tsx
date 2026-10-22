'use client';
import {createContext,useContext,useEffect,useMemo,useState,type ReactNode} from 'react';
import {isLocale,LOCALE_COOKIE,type Locale} from '@/lib/i18n/types';
import {localizeView} from '@/lib/i18n/view';
import {translate} from '@/lib/i18n/translate';

const Context=createContext({locale:'vi' as Locale,setLocale:(_locale:Locale)=>{},t:(text:string)=>text});
export function LocaleProvider({initialLocale,children}:{initialLocale:Locale;children:ReactNode}){
 const [locale,change]=useState(initialLocale);
 useEffect(()=>{document.documentElement.lang=locale;},[locale]);
 const value=useMemo(()=>({locale,t:(text:string)=>translate(text,locale),setLocale:(next:Locale)=>{
  if(!isLocale(next))return;
  document.cookie=`${LOCALE_COOKIE}=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
  try{localStorage.setItem(LOCALE_COOKIE,next);}catch{/* Cookie still persists the preference. */}
  change(next);
 }}),[locale]);
 return <Context.Provider value={value}>{children}</Context.Provider>;
}
export const useLocale=()=>useContext(Context);
export function Localize({children}:{children:ReactNode}){
 const {locale}=useLocale();return localizeView(children,locale);
}
