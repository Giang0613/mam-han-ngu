import fs from 'node:fs';
import path from 'node:path';
import {readingFor} from '../src/lib/chinese-reading';
import {customPinyin} from 'pinyin-pro';
import {materialLearningSections,materialPageId,materialPageAudio,type MaterialPage,type NativeMaterialPage,type NativeMaterialBlock,type NativeMaterialItem} from '../src/lib/hsk/materials-catalog';
import {nativePageEdits,nativeWritingAdditions} from './hsk1-native-edits';
import {nativePhoneticEdits} from './hsk1-native-phonetics';
import {applyNativeScenarios} from './hsk1-native-scenarios';
import {applyNativeEditorial} from './hsk1-native-editorial';
import {nativeLayoutEdits} from './hsk1-native-layout-edits';
import {nativeDialogueEdits} from './hsk1-native-dialogue-edits';
customPinyin({'王一飞':'wáng yī fēi','王一雪':'wáng yī xuě','李文':'lǐ wén','白家月':'bái jiā yuè','陈天中':'chén tiān zhōng','小语':'xiǎo yǔ','杨同乐':'yáng tóng lè','了解':'liǎo jiě','孩子':'hái zi','认识':'rèn shi','休息':'xiū xi','多少':'duō shao','什么':'shén me','便宜':'pián yi','不客气':'bú kè qi','谢谢':'xiè xie','学生':'xué sheng','你们':'nǐ men','同学':'tóng xué','大家':'dà jiā','老师':'lǎo shī','朋友':'péng you','没关系':'méi guān xi','对不起':'duì bu qǐ','名字':'míng zi','先生':'xiān sheng','时候':'shí hou','东西':'dōng xi','椅子':'yǐ zi','桌子':'zhuō zi','妈妈':'mā ma','爸爸':'bà ba','哥哥':'gē ge','姐姐':'jiě jie','弟弟':'dì di','妹妹':'mèi mei','包子':'bāo zi','饺子':'jiǎo zi','杯子':'bēi zi','衣服':'yī fu','漂亮':'piào liang','早上':'zǎo shang'});
const root=path.join(process.cwd(),'data/hsk1-materials'),out=path.join(root,'native');fs.mkdirSync(out,{recursive:true});
const blanks=JSON.parse(fs.readFileSync(path.join(root,'underlines.json'),'utf8')) as Record<string,number[][]>;
type Row={text:string;confidence:number;box:number[][]};
const titles:Record<string,string>={'目标':'Mục tiêu','课文':'Hội thoại','生词':'Từ mới','专有名词':'Tên riêng','语言点':'Ngữ pháp','综合练习':'Bài tập tổng hợp','小语助力':'Ghi nhớ','小语讲堂':'Giải thích & thực hành','语音':'Ngữ âm','听读练':'Nghe, đọc & thực hành','汉字':'Hán tự','词语表':'Bảng từ vựng','词性对照表':'Từ loại','学练笔画':'Luyện nét','学练笔顺':'Thứ tự nét','抄写字词':'Luyện viết từ','学练合体字结构':'Cấu tạo chữ','学练合体字及其偏旁':'Bộ thủ','听力':'Luyện nghe','阅读':'Đọc hiểu','模拟测试':'Đề luyện tổng hợp','第一部分':'Phần 1','第二部分':'Phần 2','第三部分':'Phần 3','第四部分':'Phần 4','课堂活动':'Thực hành hội thoại','双人活动':'Luyện theo cặp','角色扮演':'Đóng vai','热身':'Khởi động','小语的彩蛋':'Khám phá thêm'};
const heading=/^(?:[一二三四五六七八九十、.\d（）()]+)?(?:目标|课文\d?|生词\d?|专有名词|语言点|综合练习|小语助力|小语讲堂|语音|听读练|汉字|词语表|词性对照表|学练笔画|学练笔顺|抄写字词|学练合体字结构|学练合体字及其偏旁|听力|阅读|模拟测试|第[一二三四]部分|课堂活动|双人活动|角色扮演|热身|小语的彩蛋)$/;
function kind(zh:string):NativeMaterialBlock['kind']{if(/课文/.test(zh))return 'dialogue';if(/生词|专有名词|词语表/.test(zh))return 'vocabulary';if(/先跟读|大声拼读/.test(zh))return 'phonetics';if(/练习|听读练|填空|完成|选择|回答|连线|写出|改写|排列|判断|第.+题|看图片|描述图片/.test(zh))return 'exercise';if(/语音|声母|韵母|声调|拼写规则/.test(zh))return 'phonetics';if(/语言点|词性/.test(zh))return 'grammar';if(/汉字|笔画|笔顺|抄写|结构|偏旁/.test(zh))return 'writing';return 'reading'}
function title(zh:string,vi:string){const key=Object.keys(titles).find(k=>zh.includes(k));return key?titles[key]+(/课文\d/.test(zh)?' '+zh.match(/\d/)![0]:''):vi.replace(/\s*Bản dịch hỗ trợ$/,'')}
function normalize(zh:string){return zh.replaceAll('Al','AI').replace(/[。.]{2,}/g,'。').replace(/\.[.。]?$/,'。').replace(/^[.、]+/,'').replace(/（）|\(\)/g,'＿＿＿').replace(/＿{2,}|_{2,}/g,'＿＿＿')}
let pageCount=0,blockCount=0,itemCount=0,fields=0;const manifest:{id:string;title:string;blocks:number;items:number;fields:number}[]=[];
for(const lesson of materialLearningSections)for(const [book,ns] of Object.entries(lesson.pages))for(const n of ns){
 const id=materialPageId(book as MaterialPage['book'],n),page=JSON.parse(fs.readFileSync(path.join(root,'pages',id+'.json'),'utf8')) as MaterialPage;
 const raw=JSON.parse(fs.readFileSync(path.join(root,'ocr',book,`${String(n).padStart(3,'0')}.json`),'utf8')) as {rows:Row[]};
 let data:{item:NativeMaterialItem;row:Row}[]=page.lines.flatMap(l=>{const index=Number(l.id.split('-').at(-1)),r=raw.rows[index];
  // Drop running titles and duplicated English translations containing a single
  // quoted Hanzi. Their actual Chinese teaching content is retained below.
  if(/新HSK教程|教程特色|出版社内部|定价|外研社|学练手册|AI生成/.test(r.text)||/^新教程\d+$/.test(l.zh))return [];
  if(Math.min(...r.box.map(p=>p[1]))<.12&&l.zh.includes(lesson.zh.replace(/^AI/,'')))return [];
  if(/^[a-zA-Z]/.test(r.text)&&!/^A[Iil]|^[A-F][：:\s]?\p{Script=Han}/u.test(r.text))return [];
  const label=r.text.match(/^\s*(?:[（(](\d+)[）)]|([A-F])[：:\s]?|(\d+)[.．、])/),zh=normalize(l.zh).replace(/^[（(]\d+[）)]/,'').replace(/^\d+[.．、]/,'');
  return [{item:{...l,zh,pinyin:readingFor(zh),label:label?.[1]||label?.[2]||label?.[3]},row:r}];
 });
 // Dialogue and its vocabulary sidebar must be read as separate columns.
 // OCR orders rows by height, which otherwise puts word definitions between
 // spoken lines and attaches speaker names to the wrong sentence.
 const sidebar:typeof data=[];
 if(book==='textbook'){
  const sides=data.filter(d=>/^(生词\d?|专有名词)$/.test(d.item.zh)&&Math.min(...d.row.box.map(p=>p[0]))>.32);
  if(sides.length){data=data.filter(d=>{const x=Math.min(...d.row.box.map(p=>p[0])),y=Math.min(...d.row.box.map(p=>p[1]));const inColumn=sides.some(h=>{const hx=Math.min(...h.row.box.map(p=>p[0])),hy=Math.min(...h.row.box.map(p=>p[1]));const end=data.find(e=>Math.min(...e.row.box.map(p=>p[1]))>hy&&/^(分角色|两人一组|多人一组|课文|语言点)/.test(e.item.zh));const ey=end?Math.min(...end.row.box.map(p=>p[1])):.94;return y>=hy&&y<ey&&x>=hx-.025&&d.item.zh.length<=14;});if(inColumn)sidebar.push(d);return !inColumn;});}
 }
 const speakers=/^(王一飞|王一雪|王老师|小语|学生们|白家月|李文|安妮|陈天中|刘明|杨同乐|刘小雪|刘小明|胡医生|医生|服务员|售货员)$/;
 const continuation=book==='textbook'&&data.filter(d=>speakers.test(d.item.zh)).length>=2;
 let blocks:NativeMaterialBlock[]=[],current:NativeMaterialBlock|undefined;
 const add=(zh:string,vi:string,k:NativeMaterialBlock['kind'])=>{current={id:`${id}-block-${blocks.length}`,title:title(zh,vi),kind:k,items:[]};blocks.push(current);return current};
 for(let i=0;i<data.length;i++){
  const {item,row}=data[i];
  if(heading.test(item.zh)){add(item.zh,item.vi,kind(item.zh));continue}
  const instruction=/^(?:[一二三四五六七八九十、.\d（）()]+)?(?:选词|听录音|听对话|听句子|听两遍|看图片|完成对话|回答|连线|写出|根据|给下面|用本课|用所给|第\d.+题|选择|判断|排列|改写|读一读|大声拼读|先跟读|拼写规则|分角色|两人一组|多人一组)/.test(item.zh);
  if(instruction){add(item.zh,item.vi,kind(item.zh));current!.items.push(item);continue}
  if(!current)add(continuation?'课文':'学习内容',continuation?'Hội thoại':'Nội dung bài học',continuation?'dialogue':'reading');
  // Scanned underlines are content, not decoration. Attach them only beside
  // exercise text; grid borders and underlines in prose are not answer slots.
  if(current!.kind==='exercise'&&/填空|完成|写出|描述图片/.test(current!.items[0]?.zh||'')){
   const y1=Math.min(...row.box.map(p=>p[1])),y2=Math.max(...row.box.map(p=>p[1])),x1=Math.min(...row.box.map(p=>p[0])),x2=Math.max(...row.box.map(p=>p[0]));
   const near=(blanks[id]||[]).filter(([x,y,w])=>y>=y1-.003&&y<=y2+.009&&((x>=x2-.015&&x-x2<.09)||(x+w<=x1+.02&&x1-x-w<.1)));
   if(near.some(([x,,w])=>x+w<=x1+.02))item.zh='＿＿＿'+item.zh;
   if(near.some(([x])=>x>=x2-.015))item.zh+='＿＿＿';
   if(/＿|（$|^）/.test(item.zh)||(!/^[A-F]$/.test(item.label||'')&&item.label))item.responseKey=`native-${item.id}`;
   item.pinyin=readingFor(item.zh);
  }
  if(book==='textbook'&&speakers.test(item.zh)&&!['vocabulary','exercise','writing'].includes(current!.kind)){
   const sy=Math.min(...row.box.map(p=>p[1]));let target:NativeMaterialItem|undefined;
   for(const b of [...blocks].reverse()){if(['vocabulary','exercise','writing'].includes(b.kind))continue;target=[...b.items].reverse().find(l=>{const r=raw.rows[Number(l.id.split('-').at(-1))];if(!r||l.zh.length>80||/^(本课|汉语|汉字|“)/.test(l.zh))return false;const y=Math.min(...r.box.map(p=>p[1]));return Math.min(...r.box.map(p=>p[0]))<.65&&y>sy-.12&&y<sy+.04;});if(target)break;}
   if(target){target.speaker=item.zh;continue;}
  }
  current!.items.push(item);
 }
 for(const {item} of sidebar){if(/^(生词\d?|专有名词)$/.test(item.zh))add(item.zh,item.vi,'vocabulary');else current!.items.push(item);}
 blocks=blocks.filter(b=>b.items.length);
 for(const b of blocks)if(b.kind==='exercise')b.responseKey=`native-${b.id}`;
 const make=(zh:string,vi:string,py?:string):NativeMaterialItem=>({id:'',text:zh,zh,pinyin:py||readingFor(zh),vi,translation:'edited',confidence:1,reviewed:true});
 if(nativePageEdits[id])blocks=nativePageEdits[id](make);
 if(nativePhoneticEdits[id])blocks=nativePhoneticEdits[id](make);
 if(nativeLayoutEdits[id])blocks=nativeLayoutEdits[id](make);
 if(nativeDialogueEdits[id])blocks=nativeDialogueEdits[id](make);
 if(nativeWritingAdditions[id])blocks.push(...nativeWritingAdditions[id](make));
 blocks=applyNativeScenarios(id,blocks,make);
 // IDs are based on the archived page and local block/item index, never array
 // order across the whole course. Existing numeric draft fields remain intact.
 for(let bi=0;bi<blocks.length;bi++){const b=blocks[bi];if(!b.id)b.id=`${id}-edited-${bi}`;if(b.kind==='exercise'&&!b.responseKey)b.responseKey=`native-${b.id}`;for(let ii=0;ii<b.items.length;ii++){const l=b.items[ii];if(!l.id)l.id=`${b.id}-item-${ii}`;if(l.responseKey?.startsWith('native-tone-')||l.responseKey?.startsWith('native-phonetic-choice-'))l.responseKey=`native-${l.id}`;if(/＿＿＿/.test(l.zh)&&!l.responseKey)l.responseKey=`native-${l.id}`;if(!l.pinyin&&/\p{Script=Han}/u.test(l.zh))l.pinyin=readingFor(l.zh);if(!/\p{Script=Han}/u.test(l.zh))l.audio=false;}}
 blocks=applyNativeEditorial(id,blocks,raw.rows);
 // Chinese answer choices and stroke names need the same aligned reading as
 // prose. Preserve authored table/item readings, including phonetic examples.
 for(const b of blocks)if(b.table){
  const existing=b.table.readings;
  b.table.readings=b.table.rows.map((r,ri)=>r.map((cell,ci)=>{
   const inline=cell.match(/^([\p{Script=Han}]+)\s+([a-züāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ'\s]+)$/iu);
   if(inline){r[ci]=inline[1];return inline[2].trim();}
   return existing?.[ri]?.[ci]||b.items.find(item=>item.zh===cell)?.pinyin||readingFor(cell);
  }));
 }
 const result:NativeMaterialPage={id,book:page.book,page:n,title:blocks.find(b=>b.kind!=='reading')?.title||'Nội dung bài học',blocks,audioTracks:materialPageAudio(lesson.id,page.book,n).map(a=>a.track)};
 fs.writeFileSync(path.join(out,id+'.json'),JSON.stringify(result));
 const f=blocks.reduce((sum,b)=>sum+Number(!!b.responseKey)+b.items.filter(i=>i.responseKey).length+b.items.reduce((n,i)=>n+(i.extraResponses?.length||0),0),0);manifest.push({id,title:result.title,blocks:blocks.length,items:blocks.reduce((sum,b)=>sum+b.items.length,0),fields:f});pageCount++;blockCount+=blocks.length;itemCount+=manifest.at(-1)!.items;fields+=f;
}
fs.writeFileSync(path.join(root,'native-coverage.json'),JSON.stringify({pages:pageCount,blocks:blockCount,items:itemCount,responseFields:fields,manifest},null,2));
console.log(`Native content: ${pageCount} learning parts, ${blockCount} blocks, ${itemCount} text items, ${fields} response fields. Opening matter/back covers excluded.`);
