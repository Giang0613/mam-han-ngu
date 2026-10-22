import {displayPinyin} from './pinyin-format';
import {formatDictionaryMeaning,type DictionaryMeaning} from './dictionary-format';

type LexicalEntry={hanzi:string;traditional?:string;pinyin:string;pinyinSource?:string;meaning:string;meaningEn?:string;language?:string;aliases?:string[]};
export type EnglishMeaning={meaning:string;source:string;status:'dictionary'|'provided';details:DictionaryMeaning};
// Tone and case belong to the lexical identity: ba != bā, bái != Bái.
export const readingIdentity=(reading:string)=>displayPinyin(reading).normalize('NFC').replace(/[\s'’\-]/g,'');
export function uniqueEnglishGloss(text:string){
 const seen=new Set<string>();
 return text.split(';').map(s=>s.trim()).filter(s=>{const key=s.toLowerCase().replace(/[.\s]+$/g,'');if(!key||seen.has(key))return false;seen.add(key);return true;}).join('; ');
}
export function createEnglishLookup(entries:LexicalEntry[]){
 const present=(text:string,source:string,status:EnglishMeaning['status']):EnglishMeaning=>{
  const details=formatDictionaryMeaning(uniqueEnglishGloss(text));
  return {meaning:details.definitions.join('; ')||'See spelling and usage notes.',source,status,details};
 };
 const index=new Map<string,LexicalEntry[]>();
 for(const entry of entries){
  if(entry.language!=='en')continue;
  for(const hanzi of new Set([entry.hanzi,entry.traditional].filter((s):s is string=>!!s))){
   const key=hanzi+'\0'+readingIdentity(entry.pinyinSource||entry.pinyin);
   const bucket=index.get(key)||[];bucket.push(entry);index.set(key,bucket);
  }
 }
 return (word:LexicalEntry):EnglishMeaning|undefined=>{
  if(word.language==='en')return present(word.meaning,'CC-CEDICT','dictionary');
  if(word.meaningEn?.trim())return present(word.meaningEn,'Provided English','provided');
  // Imported source strings can include PDF notation such as /bā/. The
  // selected, validated display reading identifies the intended pronunciation.
  const reading=readingIdentity(word.pinyin);
  const matches=[...new Set([word.hanzi,...(word.aliases||[])])].flatMap(hanzi=>index.get(hanzi+'\0'+reading)||[]);
  if(!matches.length)return undefined;
  const result=present(matches.map(w=>w.meaning).join('; '),'CC-CEDICT','dictionary');
  // Several traditional forms can collapse to one simplified headword. A
  // historical-form record must not describe the current spelling as its own
  // obsolete variant. Name the actual historical glyph in the usage notes.
  for(const match of matches){
   if(match.hanzi!==word.hanzi||!match.traditional||match.traditional===word.hanzi)continue;
   const note=formatDictionaryMeaning(match.meaning).notes;
   for(const text of note)if(/^(?:old )?variant of /i.test(text)&&text.includes(word.hanzi)){
    const index=result.details.notes.indexOf(text);if(index>=0)result.details.notes.splice(index,1);
    const label=/^old /i.test(text)?'Older form':'Alternative form';
    const readable=`${label}: ${match.traditional} (${displayPinyin(match.pinyin)}).`;
    if(!result.details.notes.includes(readable))result.details.notes.push(readable);
   }
  }
  return result;
 };
}
