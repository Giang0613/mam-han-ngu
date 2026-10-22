const answerKeys: Record<string, MaterialAnswerKey> = {};
import {displayPinyin} from '@/lib/pinyin-format';

export const MATERIAL_ANSWER_REVISION='hsk1-publisher-answers-2026-10-07-v1';
export type AnswerSlot={label:string;policy:'choice'|'hanzi'|'pinyin'|'tone';accepted:string[];answer:string;pinyin?:string;explanation:string};
export type MaterialAnswerKey={pageId:string;blockId:string;source:string;sourcePage:number;slots:AnswerSlot[];hint?:string};
export type MaterialSubmission={revision:string;answer:string;firstAnswer:string;attempts:number;submittedAt:string};
export type SlotFeedback={outcome:'correct'|'incorrect'|'empty';answer:string;explanation:string};
export function materialAnswerKey(key:string,pageId:string):MaterialAnswerKey|undefined{return (answerKeys as Record<string,MaterialAnswerKey>)[`${pageId}:${key}`]}
export function canSubmitMaterialAnswer(answer:string,composing:boolean,editable:boolean){return editable&&!composing&&!!answer.trim()}

export function normalizeMaterialAnswer(value:string,policy:AnswerSlot['policy']){
 const normalized=value.replace(/[Ａ-Ｚａ-ｚ０-９]/g,c=>String.fromCharCode(c.charCodeAt(0)-0xfee0)).normalize('NFC').trim().toLowerCase().replace(/ɑ/g,'a').replace(/ɡ/g,'g');
 if(policy==='choice')return normalized.normalize('NFKC').replace(/[\s.,，、;；:：()（）]/g,'');
 if(policy==='hanzi')return normalized.replace(/[\s。！？!?，,、；;：:]/g,'');
 return displayPinyin(normalized.replace(/u:/g,'ü').replace(/v/g,'ü')).normalize('NFC').replace(/[\s'’·]/g,'');
}
export function materialAnswerParts(answer:string,count:number){
 if(count===1)return [answer];
 const byLine=answer.split(/\r?\n/);if(byLine.length===count)return byLine;
 const separated=answer.trim().split(/[\s,，、;；]+/);if(separated.length===count)return separated;
 // An older saved matching answer may use a compact sequence such as CBA.
 if(new RegExp(`^[A-Fa-f1-9]{${count}}$`).test(answer.trim()))return [...answer.trim()];
 return [answer,...Array(count-1).fill('')];
}
export function gradeMaterialAnswer(answer:string,key:MaterialAnswerKey):SlotFeedback[]{
 const parts=materialAnswerParts(answer,key.slots.length);
 return key.slots.map((slot,index)=>({outcome:!parts[index]?.trim()?'empty':slot.accepted.some(a=>normalizeMaterialAnswer(a,slot.policy)===normalizeMaterialAnswer(parts[index],slot.policy))?'correct':'incorrect',answer:slot.answer,explanation:slot.explanation}));
}
export function nextMaterialSubmission(previous:MaterialSubmission|undefined,answer:string,submittedAt:string):MaterialSubmission{
 const sameRevision=previous?.revision===MATERIAL_ANSWER_REVISION;
 return {revision:MATERIAL_ANSWER_REVISION,answer,firstAnswer:sameRevision?previous.firstAnswer:answer,attempts:sameRevision?previous.attempts+(previous.answer===answer?0:1):1,submittedAt};
}
