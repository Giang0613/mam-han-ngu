import layout from './material-answer-layout.json';
import {materialAnswerKey} from './material-grading';
import type {NativeMaterialBlock} from './materials-catalog';

// Audited against the original page and publisher keys. Old draft keys remain
// stored; OCR decoration/duplicate blanks do not become scored exercises.
const retiredByPage=layout.retiredByPage as Record<string,string[]>;
const tableCells=layout.tableCells as unknown as Record<string,[number,number,string][]>;
export function materialAnswerLayout(block:NativeMaterialBlock,pageId:string):NativeMaterialBlock{
 const retired=[...(block.retiredResponseKeys||[])];
 const hidden=retiredByPage[pageId]||[];
 const items=block.items.filter(i=>!(pageId==='textbook-085'&&i.zh==='4色心')).map(i=>{
  if(i.responseKey&&hidden.includes(i.responseKey)){retired.push(i.responseKey,...(i.extraResponses||[]));return {...i,zh:['native-textbook-052-20','native-textbook-053-61'].includes(i.responseKey)?i.zh.replace(/＿+/g,''):i.zh,responseKey:undefined,extraResponses:undefined,label:pageId==='workbook-043'?undefined:i.label}}
  const responseKey=i.responseKey||(materialAnswerKey(`native-${i.id}`,pageId)?`native-${i.id}`:undefined);
  const key=responseKey?materialAnswerKey(responseKey,pageId):undefined;
  if(key&&i.extraResponses?.length)retired.push(...i.extraResponses);
  const number=key?.slots.length===1?/^Câu (\d+)$/.exec(key.slots[0].label)?.[1]:undefined;
  return {...i,responseKey,extraResponses:key?undefined:i.extraResponses,label:pageId==='textbook-085'&&i.responseKey==='native-textbook-085-warmup-6'?'6':number||i.label};
 });
 let table=block.table?{...block.table,rows:block.table.rows.map(r=>[...r]),readings:block.table.readings?.map(r=>[...r])}:undefined;
 if(table){for(const [row,col,value] of tableCells[block.id]||[])table.rows[row][col]=value;
  if(pageId==='textbook-085'&&block.title==='Khởi động · Ghép từ với nghĩa'){table={...table,rows:table.rows.filter((_,i)=>i!==5).map((r,i)=>[String(i+1),...r.slice(1)]),readings:table.readings?.filter((_,i)=>i!==5)}}
 }
 return {...block,items,table,retiredResponseKeys:[...new Set(retired)]};
}
