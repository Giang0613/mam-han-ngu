import {Localize} from '@/components/i18n/LocaleProvider';
import {alignReading} from '@/lib/reading-alignment';
export function ChineseReading({text,reading,showPinyin=true}:{text:string;reading?:string;showPinyin?:boolean}){
 const units=showPinyin&&reading?alignReading(text,reading):undefined;
 if(!units)return <Localize>{<span className="reading-fallback"><span lang="zh-Hans">{text}</span>{showPinyin&&reading&&<span className="pinyin" lang="zh-Latn">{reading}</span>}</span>}</Localize>;
 return <Localize>{<span className="aligned-reading">{units.map((u,i)=><span key={i} className={u.reading?'reading-word':'reading-literal'}><span className="reading-hanzi" lang="zh-Hans">{u.text}</span>{u.reading&&<span className="reading-pinyin" lang="zh-Latn">{u.reading}</span>}</span>)}</span>}</Localize>;
}
