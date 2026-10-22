'use client';
import {Localize} from '@/components/i18n/LocaleProvider';
import {useId,useRef} from 'react';
import {CheckCircle2,RotateCcw,XCircle} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {ChineseReading} from './ChineseReading';
import {readingFor} from '@/lib/chinese-reading';
import {canSubmitMaterialAnswer,gradeMaterialAnswer,materialAnswerParts,MATERIAL_ANSWER_REVISION,type MaterialAnswerKey,type MaterialSubmission} from '@/lib/hsk/material-grading';

function Explanation({text}:{text:string}){
 const parts=text.split(/(\p{Script=Han}[\p{Script=Han}\d，。！？、；：…“”‘’（）％%·\s]*)/u);
 return <Localize>{<p>{parts.map((part,index)=>/\p{Script=Han}/u.test(part)?<ChineseReading key={index} text={part} reading={readingFor(part)}/>:part)}</p>}</Localize>;
}

export function MaterialResponse({label,value,disabled,onChange,onSubmit,answerKey,submission,multiline=false,showHint=true}:{label:string;value:string;disabled:boolean;onChange:(v:string)=>void;onSubmit?:(v:string)=>void;answerKey?:MaterialAnswerKey;submission?:MaterialSubmission;multiline?:boolean;showHint?:boolean}){
 const id=useId(),composing=useRef(false);
 const graded=answerKey&&submission?.revision===MATERIAL_ANSWER_REVISION&&submission.answer===value;
 const feedback=graded?gradeMaterialAnswer(value,answerKey):undefined;
 const parts=answerKey?materialAnswerParts(value,answerKey.slots.length):[value];
 const count=answerKey?.slots.length||1;
 function change(index:number,answer:string){if(count===1)onChange(answer);else onChange(parts.map((v,i)=>i===index?answer:v).join('\n'))}
 return <Localize>{<div className="native-response-group">
  {showHint&&answerKey?.hint&&<p className="native-answer-hint">{answerKey.hint}</p>}
  {parts.map((part,index)=>{const fieldLabel=count>1?`${label} · ${answerKey!.slots[index].label}`:label;const result=feedback?.[index];const slot=answerKey?.slots[index];return <div className="native-answer-slot" key={index}>
   <label className="native-response" htmlFor={`${id}-${index}`}><span>{fieldLabel}</span>{multiline&&!answerKey?<textarea id={`${id}-${index}`} rows={3} maxLength={1000} disabled={disabled} value={part} onChange={e=>change(index,e.target.value)} onCompositionStart={()=>{composing.current=true}} onCompositionEnd={()=>{composing.current=false}} placeholder="Viết câu trả lời của bạn…"/>:<input id={`${id}-${index}`} maxLength={1000} disabled={disabled} value={part} onChange={e=>change(index,e.target.value)} onCompositionStart={()=>{composing.current=true}} onCompositionEnd={()=>{composing.current=false}} autoComplete="off" aria-describedby={result?`${id}-${index}-feedback`:undefined} placeholder="Nhập đáp án…"/>}</label>
   {result&&<div id={`${id}-${index}-feedback`} className={`native-answer-feedback ${result.outcome}`} role="status"><strong>{result.outcome==='correct'?<CheckCircle2 size={17}/>:<XCircle size={17}/>} {result.outcome==='correct'?'Chính xác!':result.outcome==='empty'?'Bạn chưa trả lời câu này.':'Chưa đúng.'}</strong><div className="native-answer-reference"><span>Đáp án:</span>{/\p{Script=Han}/u.test(result.answer)?<ChineseReading text={result.answer} reading={slot?.pinyin||readingFor(result.answer)}/>:<span lang={slot?.policy==='pinyin'||slot?.policy==='tone'?'zh-Latn':undefined}>{result.answer}</span>}</div><Explanation text={result.explanation}/></div>}
  </div>})}
  {answerKey&&onSubmit&&<Button className="native-answer-submit" type="button" size="sm" variant={graded?'outline':'default'} disabled={disabled||parts.every(p=>!p.trim())} onClick={()=>{if(canSubmitMaterialAnswer(value,composing.current,!disabled))onSubmit(value)}}>{graded?<><RotateCcw size={15}/>Kiểm tra lại</>:'Trả lời'}</Button>}
  {!answerKey&&onSubmit&&<><Button className="native-answer-submit" type="button" size="sm" variant="outline" disabled={disabled||!value.trim()} onClick={()=>{if(canSubmitMaterialAnswer(value,composing.current,!disabled))onSubmit(value)}}>Trả lời</Button>{submission?.answer===value&&<p className="native-open-feedback" role="status">Đã ghi nhận câu trả lời. Bài này có nhiều cách diễn đạt; hãy đối chiếu với mẫu câu và yêu cầu của bài.</p>}</>}
 </div>}</Localize>;
}
