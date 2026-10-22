import {pinyin} from 'pinyin-pro';
import phones from './mandarin-phones.json';
import {readingFor} from './chinese-reading';

const syllables=new Set(Object.keys(phones));
const marked='āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ';
const plain='aaaaeeeeiiiioooouuuuvvvv';
function decode(raw:string){
 let base='',tone=5,marks=0;
 for(const c of raw){const i=marked.indexOf(c);if(i>=0){base+=plain[i];tone=i%4+1;marks++}else if(/[1-5]/.test(c)){tone=Number(c);marks++}else base+=c==='ü'?'v':c;}
 return marks<=1&&syllables.has(base)?{base,tone}:null;
}
/** Resolve compact and spaced authored pinyin to one explicit syllable per Hanzi.
 * The character count and preferred lexical spelling resolve ambiguous splits;
 * malformed readings are never partially sent to the speech engine. */
export function speechReading(text:string,provided?:string):string|undefined{
 if(/\d/.test(text))return undefined; // Numeric text is expanded by the Mandarin frontend.
 const expected=pinyin(text,{type:'array',toneType:'none',toneSandhi:false,nonZh:'removed'}).map(s=>s.replace(/ü/g,'v'));
 const count=[...text].filter(c=>/\p{Script=Han}/u.test(c)).length;
 if(!count||count>256||count!==expected.length)return undefined;
 const raw=(provided||readingFor(text)).normalize('NFC').toLowerCase().replace(/u:/g,'ü');
 const chunks=raw.match(/[a-züāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ1-5]+/g)||[];
 const sequence=chunks.join(''),boundaries=new Set<number>();let offset=0;
 for(const c of chunks){offset+=c.length;boundaries.add(offset)}
 type Match={score:number;items:string[]};const memo=new Map<string,Match|null>();
 function walk(pos:number,index:number):Match|null{
  if(index===count)return pos===sequence.length?{score:0,items:[]}:null;
  const key=`${pos}:${index}`;if(memo.has(key))return memo.get(key)!;
  let best:Match|null=null;
  for(let end=pos+1;end<=Math.min(sequence.length,pos+7);end++){
   if([...boundaries].some(b=>b>pos&&b<end))break;
   const parsed=decode(sequence.slice(pos,end));if(!parsed)continue;
   const tail=walk(end,index+1);if(!tail)continue;
   const score=tail.score+Number(parsed.base!==expected[index]);
   if(!best||score<best.score)best={score,items:[`${parsed.base}${parsed.tone}`,...tail.items]};
  }
  memo.set(key,best);return best;
 }
 return walk(0,0)?.items.join(' ');
}

export function validSpeechReading(text:string,reading:string){
 if(!reading)return true;
 const items=reading.split(' '),count=[...text].filter(c=>/\p{Script=Han}/u.test(c)).length;
 return !/\d/.test(text)&&items.length===count&&items.every(s=>/^[a-z]+[1-5]$/.test(s)&&syllables.has(s.slice(0,-1)));
}

// These alternate readings need a real word around them. Keep that context
// visible on the playback control rather than introducing unexplained sounds.
const singleCharacterContexts:Record<string,{text:string;pinyin:string}>={
 '了|liao3':{text:'了解',pinyin:'liǎojiě'},
 '着|zhao2':{text:'着火',pinyin:'zháohuǒ'},
 '便|pian2':{text:'便宜',pinyin:'piányi'},
};
export function speechSample(text:string,pinyin?:string){
 const reading=speechReading(text,pinyin),context=singleCharacterContexts[`${text}|${reading}`];
 return context?{...context,reading:speechReading(context.text,context.pinyin),contextual:true}:{text,pinyin,reading,contextual:false};
}
