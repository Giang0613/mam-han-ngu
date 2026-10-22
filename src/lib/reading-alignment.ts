import {pinyin} from 'pinyin-pro';
import phones from './mandarin-phones.json';
import readingWords from './reading-words.json';
export type ReadingUnit={text:string;reading?:string};
const syllables=new Set(Object.keys(phones));
const words=new Set(readingWords);
const marks='āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ';
const bases='aaaaeeeeiiiioooouuuuvvvv';
const isHan=(c:string)=>/\p{Script=Han}/u.test(c);
function base(raw:string){let value='',tones=0;for(const c of raw.toLowerCase()){const n=marks.indexOf(c);if(n>=0){value+=bases[n];tones++;}else if(/[1-5]/.test(c))tones++;else value+=c==='ü'?'v':c;}return tones<=1?value:undefined;}
/** Align the supplied reading, including compact spellings and erhua. Do not
 * replace a contextual reading with a dictionary guess just to fit the layout. */
export function alignReading(text:string,provided:string):ReadingUnit[]|undefined{
 const chars=[...text],han=chars.filter(isHan),hanPositions=chars.flatMap((c,i)=>isHan(c)?[i]:[]);if(!han.length)return [{text}];if(han.length>256)return;
 let raw=provided.normalize('NFC').replace(/u:/gi,'ü');
 // Literal acronyms in titles have no Hanzi syllable below them.
 for(const literal of text.match(/\b[A-Z]{2,}\b/g)||[])raw=raw.replace(new RegExp(`\\b${literal}\\b`,'g'),'');
 const matches=[...raw.matchAll(/[a-züāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]+[1-5]?/gi)],chunks=matches.map(m=>m[0]),sequence=chunks.join(''),joiners=new Map<number,string>();
 let sequencePos=0,rawEnd=0;for(const m of matches){if(/['’]/.test(raw.slice(rawEnd,m.index)))joiners.set(sequencePos,"'");sequencePos+=m[0].length;rawEnd=m.index+m[0].length;}
 const boundaries=new Set<number>();let at=0;for(const c of chunks){at+=c.length;boundaries.add(at);}
 const expected=pinyin(han.join(''),{type:'array',toneType:'none',toneSandhi:false}).map(s=>s.replace(/ü/g,'v'));
 type Choice={score:number;units:{reading:string;count:number;before:string}[]};const memo=new Map<string,Choice|null>();
 function walk(pos:number,index:number):Choice|null{
  if(index===han.length)return pos===sequence.length?{score:0,units:[]}:null;
  const key=`${pos}:${index}`;if(memo.has(key))return memo.get(key)!;let best:Choice|null=null;
  for(let end=pos+1;end<=Math.min(sequence.length,pos+8);end++){
   if([...boundaries].some(b=>b>pos&&b<end))break;
   const reading=sequence.slice(pos,end),plain=base(reading);if(!plain)continue;
   for(const count of [1,2]){
    const erhua=count===2&&han[index+1]==='儿'&&hanPositions[index+1]===hanPositions[index]+1&&plain.endsWith('r')&&syllables.has(plain.slice(0,-1));
    if(count===1?!syllables.has(plain):!erhua)continue;
    const tail=walk(end,index+count);if(!tail)continue;
    const score=tail.score+Number((erhua?plain.slice(0,-1):plain)!==expected[index]);
    if(!best||score<best.score)best={score,units:[{reading,count,before:joiners.get(pos)||' '},...tail.units]};
   }
  }
  memo.set(key,best);return best;
 }
 const match=walk(0,0);if(!match)return;
 const units:(ReadingUnit&{before?:string})[]=[],positions:{from:number;to:number}[]=[];let cursor=0;
 for(const part of match.units){while(cursor<chars.length&&!isHan(chars[cursor])){units.push({text:chars[cursor]});positions.push({from:cursor,to:cursor+1});cursor++;}const start=cursor;let consumed=0,zh='';while(cursor<chars.length&&consumed<part.count){zh+=chars[cursor];if(isHan(chars[cursor]))consumed++;cursor++;}units.push({text:zh,reading:part.reading,before:part.before});positions.push({from:start,to:cursor});}
 while(cursor<chars.length){units.push({text:chars[cursor]});positions.push({from:cursor,to:cursor+1});cursor++;}
 // Word boundaries keep compound words and names together when wrapping.
 // A frozen course word list gives identical server/browser wrapping. Browser
 // and Node Intl dictionaries can disagree on word boundaries during hydration.
 const ranges:{from:number;to:number}[]=[];let offset=0;
 while(offset<chars.length){let size=1;if(isHan(chars[offset])){for(let n=Math.min(8,chars.length-offset);n>=2;n--)if(words.has(chars.slice(offset,offset+n).join(''))){size=n;break;}}else{while(offset+size<chars.length&&!isHan(chars[offset+size]))size++;}ranges.push({from:offset,to:offset+size});offset+=size;}
 const result:ReadingUnit[]=[];let group=-1;
 for(let i=0;i<units.length;i++){const range=ranges.findIndex(r=>positions[i].from>=r.from&&positions[i].to<=r.to);const u=units[i],prev=result.at(-1);if(range>=0&&range===group&&prev&&!!u.reading===!!prev.reading){prev.text+=u.text;if(u.reading)prev.reading+=(u.before||' ')+u.reading;}else{result.push({text:u.text,reading:u.reading});group=range;}}
 return result;
}
