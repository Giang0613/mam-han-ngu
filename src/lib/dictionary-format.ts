import {displayPinyin} from './pinyin-format';

export type DictionaryClassifier={hanzi:string;traditional?:string;pinyin?:string};
export type DictionaryMeaning={definitions:string[];classifiers:DictionaryClassifier[];notes:string[]};
const word=String.raw`[\p{Script=Han}〇○A-Za-z0-9·・]+`;
const reference=()=>new RegExp(`(${word})(?:\\|(${word}))?\\[([^\\[\\]]+)\\]`,'gu');
const hasToneNumber=(s:string)=>/[A-Za-zÜüÊê:]+[0-5]/.test(s);
const isReading=(s:string)=>hasToneNumber(s)||/[āēīōūǎěǐǒǔǖǘǚǜáéíóúàèìòù]/u.test(s);
const classifierWord=String.raw`[\p{Script=Han}〇○]+`;
const classifierReference=`${classifierWord}(?:\\|${classifierWord})?(?:\\[[^\\[\\]]+\\])?`;
const classifierBlock=()=>new RegExp(`\\bCL:\\s*(${classifierReference}(?:\\s*,\\s*${classifierReference})*)`,'gu');
const unique=(items:string[])=>[...new Map(items.filter(Boolean).map(s=>[s.toLowerCase(),s])).values()];

/** Render CC-CEDICT references as plain text. Do not strip Chinese examples,
 * ordinary English brackets, or grammatical qualifiers from definitions. */
export function readableDictionaryText(text:string){
 return text.replace(reference(),(raw,traditional:string,simplified:string|undefined,reading:string)=>
  isReading(reading)?`${simplified||traditional} (${displayPinyin(reading)})`:raw)
 .replace(new RegExp(`(${classifierWord})\\|(${classifierWord})`,'gu'),'$2')
 .replace(/\[([^\[\]]+)\]/g,(raw,reading:string)=>isReading(reading)?displayPinyin(reading):raw);
}

function glosses(text:string){
 const result:string[]=[];let start=0,depth=0;
 for(let i=0;i<text.length;i++){
  if(text[i]==='('||text[i]==='[')depth++;
  else if(text[i]===')'||text[i]===']')depth=Math.max(0,depth-1);
  else if(text[i]===';'&&depth===0){result.push(text.slice(start,i).trim());start=i+1;}
 }
 result.push(text.slice(start).trim());return result;
}

/** A presentation view of the imported V1 export. Source records stay intact. */
export function formatDictionaryMeaning(text:string):DictionaryMeaning{
 const definitions:string[]=[],notes:string[]=[],classifiers:DictionaryClassifier[]=[];
 const seen=new Set<string>();
 for(const gloss of glosses(text)){
  const withoutClassifiers=gloss.replace(classifierBlock(),(_raw,body:string)=>{
   const references=new RegExp(`(${classifierWord})(?:\\|(${classifierWord}))?(?:\\[([^\\[\\]]+)\\])?`,'gu');
   for(const match of body.matchAll(references)){
    const [,traditional,simplified,rawReading]=match,hanzi=simplified||traditional;
    const pinyin=rawReading?displayPinyin(rawReading):undefined;
    const key=hanzi+'\0'+(pinyin||'');if(seen.has(key))continue;seen.add(key);
    classifiers.push({hanzi,...(simplified&&traditional!==simplified?{traditional}:{}),...(pinyin?{pinyin}:{})});
   }
   return '';
  }).replace(/\(\s*\)/g,'').replace(/\s+([,.;])/g,'$1').replace(/\s+/g,' ').trim();
  if(!withoutClassifiers)continue;
  const readable=readableDictionaryText(withoutClassifiers);
  const crossReference=/^(?:\([^)]*\)\s*)*(?:(?:old|archaic|ancient|erhua|contracted)\s+)*(?:variant of|form of|also written|see(?: also)?|abbr\. for|abbreviation for|same as)\b/i.test(withoutClassifiers)&&/\p{Script=Han}/u.test(withoutClassifiers);
  (crossReference?notes:definitions).push(readable);
 }
 return {definitions:unique(definitions),classifiers,notes:unique(notes)};
}
