'use client';
import {Localize} from '@/components/i18n/LocaleProvider';
import {hasChinese,readingFor,chineseSpeechText} from '@/lib/chinese-reading';
import {useStudyStore} from '@/store/useStudyStore';
import {AudioButton} from './common';

/** Audio is deliberately separate from selection buttons and form labels. */
export function ChineseText({text,pinyin,audio=true,showPinyin=true,className='',label}:{text:string;pinyin?:string;audio?:boolean;showPinyin?:boolean;className?:string;label?:string}){
 const enabled=useStudyStore(s=>!!s.data.profile.pinyin),han=hasChinese(text);
 return <Localize>{<span className={`chinese-text ${han&&audio?'has-audio':''} ${className}`}><span className="chinese-original" lang={han&&!/[a-zA-ZÀ-ỹ]/u.test(text)?'zh-Hans':undefined}>{text}</span>{han&&enabled&&showPinyin&&<span className="pinyin" lang="zh-Latn">{readingFor(text,pinyin)}</span>}{han&&audio&&<span className="chinese-audio"><AudioButton text={chineseSpeechText(text)} pinyin={pinyin} label={label||`Nghe ${chineseSpeechText(text)}`} compact/></span>}</span>}</Localize>;
}
