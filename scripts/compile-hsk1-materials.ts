import fs from 'node:fs';
import path from 'node:path';
import {readingFor} from '../src/lib/chinese-reading';
import {materialBooks,materialSections,materialAudio,materialPageId,HSK1_MATERIAL_REVISION,type MaterialPage} from '../src/lib/hsk/materials-catalog';
const root=path.join(process.cwd(),'data','hsk1-materials'),out=path.join(root,'pages');fs.mkdirSync(out,{recursive:true});
const translations=JSON.parse(fs.readFileSync(path.join(root,'translations.json'),'utf8')) as Record<string,{vi:string;translation:'edited'|'machine'}>;
const overrides=JSON.parse(fs.readFileSync(path.join(root,'reading-overrides.json'),'utf8')) as Record<string,{expected:string;skip?:boolean;zh?:string;pinyin?:string;vi?:string;translation?:'edited'|'machine';reviewed?:boolean;audio?:boolean}>;
const names={'王一飞':'wáng yī fēi','王一雪':'wáng yī xuě','李文':'lǐ wén','白家月':'bái jiā yuè','陈天中':'chén tiān zhōng','刘明':'liú míng','刘小雪':'liú xiǎo xuě','刘小明':'liú xiǎo míng','杨同乐':'yáng tóng lè','小语':'xiǎo yǔ'};
import {customPinyin} from 'pinyin-pro';customPinyin({...names,'了解':'liǎo jiě','孩子':'hái zi','认识':'rèn shi','休息':'xiū xi','多少':'duō shao','什么':'shén me','便宜':'pián yi','手机':'shǒu jī'});
function chinese(text:string){if(/^(?:新HSK教程1|新HSK教程1学习手册|AI生成合?)$/.test(text.replace(/ /g,'')))return '';return text.replaceAll('对寸不起','对不起').replace(/[A-Za-zÀ-ž]+(?:[’'][A-Za-zÀ-ž]+)?/g,'').replace(/[^\u3400-\u9fff〇0-9\s，。！？、；：…“”‘’（）()×＿_/.+\-]/g,'').replace(/\s+/g,'').replace(/^[.,，。\-+()（）]+|[.,，。\-+()（）]+$/g,'').replace(/^\d+[.、]/,'').replace(/[）)]?\d{1,2}[-–—]\d+$/,'').replace(/^口(?=了解|能|掌握)/,'')}
let lineCount=0,machine=0;
for(const book of materialBooks)for(let page=1;page<=book.pages;page++){
 const id=materialPageId(book.id,page),raw=JSON.parse(fs.readFileSync(path.join(root,'ocr',book.id,`${String(page).padStart(3,'0')}.json`),'utf8')) as {width:number;height:number;rows:{text:string;confidence:number;box:number[][]}[]};
 const lesson=materialSections.find(l=>l.pages[book.id].includes(page))!;
 const audioTracks=book.id==='textbook'&&lesson.id>=1&&lesson.id<=15?[...new Set(raw.rows.flatMap(r=>[...r.text.matchAll(new RegExp(`(?:\\b|[）)])${lesson.id}[-–—](\\d+)\\b`,'g'))].map(m=>Number(m[1]))))].filter(n=>materialAudio(lesson.id).some(a=>a.track===n)):[];
 const lines=raw.rows.flatMap((r,i)=>{const lineId=`${id}-${i}`,o=overrides[lineId];if(o&&o.expected!==r.text)throw Error(`OCR override mismatch: ${lineId}`);if(o?.skip)return [];const zh=o?.zh||chinese(r.text);if(!/\p{Script=Han}/u.test(zh))return [];const t=o?.vi?{vi:o.vi,translation:o.translation||'edited'}:translations[zh];if(!t)throw Error(`Missing translation ${id}: ${zh}`);return [{id:lineId,text:r.text,zh,pinyin:o?.pinyin||readingFor(zh),...t,confidence:r.confidence,reviewed:o?.reviewed,audio:o?.audio}];});
 const result:MaterialPage={id,book:book.id,page,image:`/hsk1-materials/pages/${book.id}/${String(page).padStart(3,'0')}.webp`,width:raw.width,height:raw.height,lines,audioTracks};
 fs.writeFileSync(path.join(out,`${id}.json`),JSON.stringify(result));lineCount+=lines.length;machine+=lines.filter(l=>l.translation==='machine').length;
}
fs.writeFileSync(path.join(root,'coverage.json'),JSON.stringify({revision:HSK1_MATERIAL_REVISION,pages:298,audio:93,lessons:15,chineseLines:lineCount,machineTranslations:machine},null,2));
console.log(`Compiled 298 pages, ${lineCount} Chinese/pinyin/Vietnamese lines, 15 lesson ranges, 93 MP3s.`);
