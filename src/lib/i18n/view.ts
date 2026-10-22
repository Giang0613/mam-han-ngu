import {cloneElement,isValidElement,type ReactNode} from 'react';
import {translate} from './translate';
import type {Locale} from './types';

const visibleAttributes=new Set(['title','description','label','placeholder','aria-label','alt','eyebrow','nextLabel']);
/** Translate React output only. Form values, answer IDs, handlers and URLs are
 * left intact. No DOM rewriting, network translation or HTML injection. */
export function localizeView(view:ReactNode,locale:Locale):ReactNode{
 if(typeof view==='string')return translate(view,locale);
 if(Array.isArray(view))return view.map((child,index)=>{
  const localized=localizeView(child,locale);
  // JSX static children become a new array here. Give only unkeyed elements a
  // stable positional key in BOTH locales so switching language keeps state.
  return isValidElement(localized)&&localized.key===null?cloneElement(localized,{key:`i18n-${index}`}):localized;
 });
 if(!isValidElement<Record<string,unknown>>(view))return view;
 const props=view.props;
 const protectedContent=props.translate==='no'||props['data-no-localize']!==undefined||
  (typeof props.className==='string'&&/(?:^|\s)(?:pinyin|reading-pinyin|pinyin-chart)(?:\s|$)/.test(props.className))||
  (typeof props.lang==='string'&&/^zh\b/.test(props.lang))||['input','textarea','script','style','code','pre'].includes(String(view.type));
 const changes:Record<string,unknown>={};
 if(locale==='en'&&props.lang==='vi'&&props.translate!=='no')changes.lang='en';
 // Labels on a Chinese input are English even though its value remains Hanzi.
 for(const key of visibleAttributes)if(typeof props[key]==='string')changes[key]=translate(props[key],locale);
 if(!protectedContent&&Object.hasOwn(props,'children'))changes.children=localizeView(props.children as ReactNode,locale);
 return cloneElement(view,changes);
}
