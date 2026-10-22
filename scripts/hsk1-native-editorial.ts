import fs from 'node:fs';
import path from 'node:path';
import {readingFor} from '../src/lib/chinese-reading';
import {materialLessons,type NativeMaterialBlock,type NativeMaterialItem} from '../src/lib/hsk/materials-catalog';
type Row={text:string;confidence:number;box:number[][]};
const root=path.join(process.cwd(),'data/hsk1-materials');
const audit=JSON.parse(fs.readFileSync(path.join(root,'translation-audit.json'),'utf8')) as [string,string,string,string,string][];
const entries=fs.readFileSync(path.join(root,'editorial/translations.tsv'),'utf8').trim().split(/\r?\n/).map(line=>{const tab=line.indexOf('\t');return {index:Number(line.slice(0,tab)),vi:line.slice(tab+1)};});
if(entries.length!==audit.length||new Set(entries.map(e=>e.index)).size!==audit.length)throw Error('Editorial translation ledger incomplete');
const byId=new Map<string,string>(),byText=new Map<string,string>();
const canonical=(s:string)=>s.replace(/^[（(]?\d+[）).、．]?/,'').replace(/[\s。！？!?”“‘’「」（）()、,，；;：:＿_]/g,'');
for(const e of entries){if(!e.vi||!audit[e.index])throw Error('Invalid editorial entry');const [zh,,id]=audit[e.index];byId.set(id,e.vi);byText.set(canonical(zh),e.vi);}
const glossary:Record<string,string>={
 '点':'Giờ (dùng để nói thời điểm).','分':'Phút (đơn vị thời gian).','块':'Tệ; cách gọi khẩu ngữ của 元.','元':'Tệ; đơn vị cơ bản của nhân dân tệ.','毛':'Hào; 0,1 tệ, cách gọi khẩu ngữ của 角.','角':'Hào; 0,1 tệ.','钱':'Tiền.','斤':'Cân Trung Quốc; trong bài mua hàng, 1 斤 = 500 gam.',
 '饭店':'Nhà hàng (trong các hội thoại ăn uống của bài).','西安饭店':'Nhà hàng Tây An.','包子':'Bánh bao.','饺子':'Bánh chẻo; bánh có vỏ bột và nhân, thường luộc hoặc hấp.','面条儿':'Mì sợi.','米饭':'Cơm.','牛奶':'Sữa bò.','学生':'Học sinh; người đang học.','老师':'Giáo viên; thầy, cô.','同学':'Bạn học; học sinh (khi giáo viên gọi cả lớp).','女儿':'Con gái.','姐姐':'Chị gái.','妹妹':'Em gái.','弟弟':'Em trai.','哥哥':'Anh trai.',
 '件':'Lượng từ dùng cho quần áo; ở đây tương đương “chiếc”.','只':'Lượng từ dùng cho nhiều loại động vật; ở đây là “con”.','本':'Lượng từ dùng cho sách; tương đương “quyển”.','口':'Lượng từ đếm thành viên trong gia đình.','个':'Lượng từ thông dụng để đếm người hoặc một số sự vật.','些':'Một ít; một số (lượng không xác định).',
 '会':'Biết làm; có kỹ năng làm một việc nhờ đã học.','能':'Có thể làm do có năng lực hoặc điều kiện phù hợp.','可以':'Có thể; được phép.','想':'Muốn; dự định (khi đứng trước động từ).','要':'Muốn; dự định (trong mẫu năng nguyện của bài).','医':'Y học; ngành y.','读大学':'Học đại học.','下班':'Tan làm.','上班':'Đi làm; làm việc.','下课':'Tan học; kết thúc tiết học.','上课':'Học trên lớp; bắt đầu tiết học.','看病':'Khám bệnh.','生病':'Bị ốm; mắc bệnh.',
 '怎么':'Thế nào; bằng cách nào (hỏi cách thức).','怎么样':'Như thế nào; thấy thế nào (hỏi tình trạng hoặc ý kiến).','哪个':'Cái nào; … nào (hỏi lựa chọn).','哪':'Nào (dùng trong câu hỏi lựa chọn).','多少':'Bao nhiêu.','第':'Tiền tố tạo số thứ tự: thứ…','在':'Ở, tại; đặt trước địa điểm hoặc trước động từ tùy cấu trúc.','都':'Đều; tất cả đều.','也':'Cũng.','还':'Còn; vẫn; ngoài ra còn (trong bài này đọc hái).','吧':'Nhé; dùng cuối câu để đề nghị, bàn bạc hoặc khuyên nhủ.','呢':'Trợ từ cuối câu; nghĩa và chức năng phụ thuộc mẫu câu.','的':'Trợ từ kết cấu nối định ngữ với danh từ trung tâm, thường biểu thị “của”.','了':'Trợ từ biểu thị tình huống mới hoặc hành động đã xảy ra, tùy vị trí trong câu.',
 '大兴':'Đại Hưng (tên riêng).','大兴机场':'Sân bay Đại Hưng.','西安':'Tây An.','北京':'Bắc Kinh.','上海':'Thượng Hải.','中国人':'Người Trung Quốc.','法国人':'Người Pháp.','泰国人':'Người Thái Lan.','上午':'Buổi sáng (trước buổi trưa).','下午':'Buổi chiều.','早上':'Buổi sáng sớm.','中午':'Buổi trưa.','晚上':'Buổi tối.','时候':'Thời điểm; lúc.','小时':'Giờ đồng hồ (đơn vị thời lượng).','分钟':'Phút (đơn vị thời lượng).',
};
const correctedChinese:Record<string,string>={
 'textbook-020-6':'能听懂并使用中文姓名自我介绍。','textbook-025-6':'能听懂并使用“是”字句表达等同或类属。','textbook-025-8':'掌握结构助词“的”的用法。','textbook-025-9':'掌握用“吗”的是非问句的用法。','textbook-026-25':'“是”字句','textbook-027-20':'“谁”也可以读成“shuí”。',
 'textbook-031-5':'3–4人一组，互相介绍，然后请一组同学展示。','textbook-031-23':'1–3课：我的学习情况','textbook-035-10':'0–99的写法和读法','textbook-035-87':'九十、九十一','textbook-036-21':'“2”的写法和读法','textbook-039-6':'一飞忙吗？','textbook-044-73':'今天9月8号。','textbook-044-75':'今天是2025年5月22号。','textbook-044-77':'明天是2024年8月18号，星期天。',
 'textbook-051-22':'数字“1”要读成“yāo”。','textbook-058-4':'4–6课：我的学习情况','textbook-068-26':'福','textbook-074-77':'胡医生的爸爸在哪儿工作？','textbook-076-12':'了解当代中国人的休闲活动。','textbook-077-8':'“前边”也可以说成“前边儿”。','textbook-077-29':'“那个”在口语中也说成“nèi ge”。','textbook-083-11':'7–9课：我的学习情况',
 'textbook-095-5':'正反问格式是“A + 不/没 + A”。','textbook-095-6':'“A”是动词或形容词。动词正反问使用“不/','textbook-097-10':'（2）在/正在 + 动词 + 呢；（3）动词 + 呢。','textbook-097-11':'否定时使用“没（有）”。','textbook-099-11':'能愿动词“要”','textbook-101-8':'掌握语气助词“了（1）”的用法。','textbook-101-9':'掌握“太……了”格式的用法。','textbook-103-58':'语气助词“了（1）”','textbook-106-97':'杨同乐生病了吗？','textbook-108-15':'10–12课：我的学习情况',
 'textbook-110-9':'掌握“动词 + 一下”结构的用法。','textbook-112-41':'“动词 + 一下”结构','textbook-113-52':'服务员问王一雪什么问题了？','textbook-120-40':'动态助词“了（2）”','textbook-121-3':'“看病”“生病”','textbook-122-87':'白家月会写汉字了吗？','textbook-122-88':'陈天中会写汉字了吗？','textbook-125-5':'明年女儿和儿子都上小学吗？','textbook-127-9':'掌握并列复句“……，还/也……”。','textbook-127-10':'“……，还/也……”','textbook-128-69':'白家月爱吃哪个菜？','textbook-129-9':'并列复句“……，还/也……”','textbook-129-12':'“……，还/也……”','textbook-129-15':'还 / 也','textbook-135-4':'13–15课：我的学习情况',
 'workbook-024-2':'第4–5题：听问题，选择正确回答。每题听两次。','workbook-025-12':'第9–10题：听句子和问题，选择正确答案。每题听两次。','workbook-027-3':'第14–16题：匹配句子。','workbook-027-28':'第17–18题：选词填空。','workbook-028-9':'第19–20题：选择正确答案。','workbook-052-16':'我下午有事，晚上7:00见吧。','workbook-054-38':'妈妈今天休息，下午想去菜店买些菜。','workbook-069-7':'很高兴认识你。','workbook-097-20':'12:00了，你们怎么还在看电视？',
 'workbook-062-36':'女：好的，我7:00＿＿＿','workbook-101-4':'汉字书写（六）',
 'workbook-101-10':'是由言字旁“讠”和“人”组成的合体字。','workbook-101-30':'“目”“木”','workbook-130-3':'第6–10题','workbook-132-3':'第16–20题','workbook-135-2':'第26–30题','workbook-136-3':'第31–35题','workbook-137-2':'第36–40题',
};
const instruction=/^(?:[（(]?\d+[）).、]?)?(?:能听懂|掌握|了解.{4,}|朗读对话|分角色|两人一组|三人一组|多人活动|回答问题|选词填空|听录音|听两遍|听句子|听对话|大声朗读|先跟读|用本课|用所给|根据|给下面|第[\d–]+题)/;
const practiceWithOthers=/^(?:分角色|两人(?:一)?组|三人(?:一)?组|多人一组|多人活动|双人活动|\d+(?:[–～~－-]\d+)?人一组)/;
const xy=(r:Row)=>({x:Math.min(...r.box.map(p=>p[0])),right:Math.max(...r.box.map(p=>p[0])),y:Math.min(...r.box.map(p=>p[1]))});
function sourcePrefix(raw:string){const marker=raw.search(/(?:[A-Z][a-z]{2,}|(?:On|In|At|To|An|By|As|It)\s|[a-z]{9,})/);return (marker<0?raw:raw.slice(0,marker)).trim();}
const hanOnly=(s:string)=>[...s].filter(c=>/\p{Script=Han}/u.test(c)).join('');
// Translate the complete sentence after OCR fragments have been joined. A
// dictionary gloss such as “Tên gọi” must never be appended to dialogue prose.
const joinedTranslations:Record<string,string>={
 'textbook-021-4':'Xin hỏi, bạn tên là gì?',
 'textbook-025-21':'Tôi là người Pháp. Giáo viên tiếng Trung của tôi cũng là người Trung Quốc.',
 'textbook-083-5':'Làm theo cặp: một người đóng vai Bạch Gia Nguyệt, người kia đóng vai Trần Thiên Trung; dựa vào ba đoạn hội thoại của bài để luyện nói.',
 'textbook-090-64':'Không được. Đây là quần áo dành cho bé gái; quần áo dành cho bé trai ở đằng kia.',
 'textbook-130-16':'Mấy năm trước tôi đã đến Tây An, rất thú vị. Năm nay tôi cũng muốn đi Bắc Kinh.',
 'textbook-141-23':'Đặt câu hỏi.',
};
function restoreSource(i:NativeMaterialItem,row?:Row){
 if(!row)return;
 const original=sourcePrefix(row.text);
 if(i.zh.length>18&&hanOnly(original)===hanOnly(i.zh)&&original.length<550)i.zh=original.replaceAll('Al','AI');
 else{
  const occurrence=row.text.indexOf(i.zh);if(occurrence>=0&&/[。.!！?？]/.test(row.text[occurrence+i.zh.length]||''))i.zh+=row.text[occurrence+i.zh.length].replace('.','。').replace('!','！').replace('?','？');
  // A cloze opening/closing parenthesis can be separated by the underline in OCR.
  if(/\p{Script=Han}[（(]$/u.test(original)&&!i.zh.endsWith('＿＿＿'))i.zh+='＿＿＿';
 }
 i.zh=i.zh.replace(/^\d+[）)]/,'').replace(/第(\d{2})(\d{2})题/g,'第$1–$2题').replaceAll('……。','……');
}
export function applyNativeEditorial(id:string,blocks:NativeMaterialBlock[],raw:Row[]){
 // These two sidebar headings were missed by OCR. Restore the vocabulary
 // grouping from the supplied page, retaining all original item identifiers.
 const sidebarWords:Record<string,number[]>={'textbook-040':[5,10,15,20,26,32,38,43],'textbook-046':[4,9,14,20,23,28,33],'textbook-094':[58,66,70]};
 if(sidebarWords[id]){
  const wordIds=sidebarWords[id].map(n=>`${id}-${n}`),all=blocks.flatMap(b=>b.items);
  const items=wordIds.map(wordId=>{const word=all.find(i=>i.id===wordId);if(!word)throw Error(`Missing vocabulary sidebar item ${wordId}`);return word;});
  for(const b of blocks)b.items=b.items.filter(i=>!wordIds.includes(i.id));
  const existingVocabulary=blocks.find(b=>b.kind==='vocabulary');
  if(existingVocabulary)existingVocabulary.items.push(...items);
  else blocks.splice(2,0,{id:`${id}-vocabulary`,title:'Từ mới',kind:'vocabulary',items});
 }
 const [book,n]=id.split('-'),lesson=materialLessons.find(l=>l.pages[book as 'textbook'|'workbook'|'writing'].includes(Number(n)));
 const source=(i:NativeMaterialItem)=>/^\w+-\d{3}-\d+$/.test(i.id)?raw[Number(i.id.split('-').at(-1))]:undefined;
 for(const b of blocks){
  for(const i of b.items){
   const prior=i.vi,before=i.zh,revised=i.reviewed?undefined:byId.get(i.id)||byText.get(canonical(i.zh));if(revised){i.vi=revised;i.translation='edited';}
   if(b.title===prior&&revised)b.title=revised;
   restoreSource(i,i.reviewed?undefined:source(i));
   if(correctedChinese[i.id]){i.zh=correctedChinese[i.id];i.reviewed=true;}
   if(b.kind==='vocabulary'){
    i.zh=i.zh.replace(/^[\d①②③④⑤⑥⑦⑧⑨⑩]+(?=\p{Script=Han})/u,'');
    if(glossary[i.zh]){i.vi=i.zh==='分'&&lesson?.id===10?'Phân nhân dân tệ; 0,01 tệ.':glossary[i.zh];i.translation='edited';}
    if(i.zh==='想'&&lesson?.id===3)i.vi='Nhớ (người thân, bạn bè).';
    if(i.zh==='上'&&lesson?.id===14)i.vi='Vào học; học (trong 上小学、上中学).';
    if(i.zh==='下'&&lesson?.id===12)i.vi='Rơi (mưa, tuyết: 下雨、下雪).';
    if(i.zh==='他们')i.vi='Họ (nhóm người; thường nam hoặc nhóm có cả nam và nữ).';
    if(i.zh==='她们')i.vi='Họ (nhóm nữ).';
    if(i.zh==='它们')i.vi='Chúng (sự vật, động vật).';
   }
   if(i.zh!==before)i.pinyin=readingFor(i.zh);if(i.speaker)i.speakerPinyin=readingFor(i.speaker);
   i.role=i.role||(b.kind==='vocabulary'?'word':i.speaker?'utterance':instruction.test(i.zh)||(b.kind==='dialogue'&&i.zh.length>=15&&/^(在|开学)/.test(i.zh))?'instruction':i.zh.length>=25&&(b.kind==='phonetics'||b.kind==='grammar'||b.title==='Giải thích & thực hành'||b.title==='Ghi nhớ'||/^(本课|汉语|汉字|“|中国人的姓名|名词谓语句|形容词|连动句|存现句|时间词语|独体字|形声字|笔画|部件|整字)/.test(i.zh))?'explanation':'example');
   if(i.role==='utterance'&&/^姐姐[！!]?$/.test(i.zh))i.vi='Chị ơi!';
   if(/^敬辞[，,]/.test(i.zh)){i.role='explanation';delete i.speaker;delete i.speakerPinyin;}
   if(b.kind==='exercise'&&i.zh.includes('＿＿＿')&&!i.responseKey)i.responseKey=`native-${i.id}`;
   if(i.role==='explanation'&&!i.zh.includes('＿＿＿'))delete i.responseKey;
  }
  const merged:NativeMaterialItem[]=[];
  for(const i of b.items){
   const prev=merged.at(-1),a=prev&&source({...prev,id:prev.mergedIds?.at(-1)||prev.id}),r=source(i);
   if(prev&&a&&r&&!i.label&&!/[。！!？?]$/.test(prev.zh)&&!i.speaker&&!/^(?:[ABCDEF]|例如|课文)/.test(i.zh)){
    const first=xy(a),next=xy(r),dy=next.y-first.y;
    const wrapped=dy>=.006&&dy<=.05&&Math.abs(first.x-next.x)<.1;
    const sameLine=Math.abs(dy)<.015&&next.x>=first.right-.025&&next.x-first.right<.3;
    const prose=b.kind!=='vocabulary'&&b.kind!=='exercise'&&(prev.zh.length>=14||prev.speaker)&&wrapped&&i.role!=='instruction';
    const cloze=b.kind==='exercise'&&(prev.zh.includes('＿＿＿')||/^\d+$/.test(prev.label||''))&&(wrapped||sameLine);
    if(prose||cloze){
     i.role=prev.role;
     const extras=[...(prev.extraResponses||[])];if(i.responseKey&&i.responseKey!==prev.responseKey)extras.push(i.responseKey);if(i.extraResponses)extras.push(...i.extraResponses);if(extras.length)prev.extraResponses=extras;
     prev.zh+=i.zh;prev.vi=prev.vi.replace(/…$/,'').trimEnd()+' '+i.vi.replace(/^…/,'').trimStart();prev.pinyin=readingFor(prev.zh);prev.confidence=Math.min(prev.confidence,i.confidence);prev.translation=prev.translation==='edited'&&i.translation==='edited'?'edited':'machine';prev.mergedIds=[...(prev.mergedIds||[]),i.id];continue;
    }
   }
   merged.push(i);
  }
  b.items=merged;
  for(const i of b.items)if(joinedTranslations[i.id]){i.vi=joinedTranslations[i.id];i.translation='edited';}
  const retired=new Set(b.retiredResponseKeys||[]);
  for(const i of b.items)if(practiceWithOthers.test(i.zh)){
   i.practiceMode='with-others';i.role='instruction';
   if(i.responseKey)retired.add(i.responseKey);for(const key of i.extraResponses||[])retired.add(key);
   delete i.responseKey;delete i.extraResponses;
  }
  // A mixed block can still contain real reading-comprehension questions.
  // Retire the block answer field only when every item is a group activity.
  if(b.items.length&&b.items.every(i=>i.practiceMode==='with-others')&&!b.table&&!b.characters&&!b.soundGroups){
   b.practiceMode='with-others';if(b.responseKey)retired.add(b.responseKey);delete b.responseKey;
  }
  if(retired.size)b.retiredResponseKeys=[...retired];
 }
 // Hide entire pair/group activities, including their worked role-play
 // examples. OCR sometimes appends an independent phonetics/review section
 // to that block; split that tail out so ordinary learning content remains.
 return blocks.flatMap(b=>{
  if(b.kind==='exercise'||!b.items.some(i=>i.practiceMode==='with-others'))return [b];
  const boundaries=b.items.flatMap((i,index)=>/^(跟读绕口令|学习小结|你会写数字了)/.test(i.zh)?[index]:[]);
  const first=boundaries[0]??b.items.length;
  const activity={...b,items:b.items.slice(0,first),practiceMode:'with-others' as const};
  const retired=new Set(activity.retiredResponseKeys||[]);
  if(activity.responseKey)retired.add(activity.responseKey);delete activity.responseKey;
  for(const i of activity.items){if(i.responseKey)retired.add(i.responseKey);for(const key of i.extraResponses||[])retired.add(key);delete i.responseKey;delete i.extraResponses;}
  if(retired.size)activity.retiredResponseKeys=[...retired];
  const independent=boundaries.map((start,j):NativeMaterialBlock=>{
   const items=b.items.slice(start,boundaries[j+1]??b.items.length),phonetics=items[0].zh==='跟读绕口令';
   return {id:`${b.id}-study-${j}`,title:phonetics?'Luyện đọc thanh điệu':items[0].zh==='学习小结'?'Tổng kết bài học':'Khám phá thêm',kind:phonetics?'phonetics':'reading',items};
  });
  return [activity,...independent];
 });
}
