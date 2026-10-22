import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createElement,type ReactElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {translate,hasEnglish} from '../src/lib/i18n/translate';
import {localizeView} from '../src/lib/i18n/view';
import {words,lessons,grammar,grade} from '../src/lib/course';
import {allExercises} from '../src/lib/study-engine';
import {hskLevels,hskModules,hskTasks} from '../src/lib/hsk/catalog';
import ui from '../src/lib/i18n/ui.en.json';
import {hskGrammar} from '../src/lib/hsk/grammar';
import {createEnglishLookup,readingIdentity} from '../src/lib/dictionary-english';

const vi=/[đĐăĂâÂêÊôÔơƠưƯ\u1ea0-\u1ef9]/u;
const english=(source:string)=>{const result=translate(source,'en');assert.ok(!vi.test(result),'Vietnamese remains: '+result);return result;};
for(const source of Object.keys(ui))english(source);
for(const w of words){english(w.vi);assert.equal(translate(w.zh,'en'),w.zh);assert.equal(translate(w.pinyin,'en'),w.pinyin);}
for(const l of lessons)english(l.title);
for(const g of grammar)for(const field of ['title','formula','vi','note'] as const)english(g[field]);
for(const g of hskGrammar){english(g.focus);english(g.note);assert.notEqual(translate(g.focus,'en'),g.focus.replace(/[^\p{Script=Han}]/gu,''));}
for(const l of hskLevels){english(l.title);english(l.goal);l.topics.forEach(english);english(l.topics.join(' · '));}
for(const u of hskModules){english(u.title);english(u.goal);u.method.forEach(english);u.mistakes.forEach(english);}
for(const t of hskTasks){english(t.title);english(t.prompt);english(t.model);if(t.material)english(t.material);t.checklist.forEach(english);}
for(const e of Object.values(allExercises)){
 english(e.prompt);english(e.explanation);for(const o of e.options||[])english(o.text);
 const localized={...e,prompt:translate(e.prompt,'en'),explanation:translate(e.explanation,'en'),options:e.options?.map(o=>({...o,text:translate(o.text,'en')}))};
 assert.equal(grade(localized,e.answer),true,e.id);assert.equal(localized.id,e.id);assert.equal(localized.answer,e.answer);assert.equal(localized.zh,e.zh);
}
assert.equal(translate('Chào Nguyễn Văn An.','en'),'Hi, Nguyễn Văn An.');
assert.equal(translate('  Chưa lưu được. Hãy thử lại.\n','en'),'  Could not save. Please try again.\n');
assert.equal(translate('Kho ngữ pháp','vi'),'Kho ngữ pháp');
const onChange=()=>{};
const tree=createElement('section',{id:'question-123'},[
 createElement('span',{key:'label'},'Kho ngữ pháp'),
 createElement('span',{lang:'zh-Hans'},'你好！'),
 createElement('strong',{translate:'no'},'Tên cá nhân'),
 createElement('input',{value:'bài làm của tôi',onChange,placeholder:'Nhập chữ Hán…','data-answer':'a0'}),
]);
const en=localizeView(tree,'en') as ReactElement<{children:ReactElement<Record<string,unknown>>[];id:string}>;
const original=localizeView(tree,'vi') as typeof en;
assert.equal(en.props.id,'question-123');
assert.deepEqual(en.props.children.map(c=>c.key),original.props.children.map(c=>c.key));
assert.equal(en.props.children[2].props.children,'Tên cá nhân');
assert.equal(en.props.children[3].props.value,'bài làm của tôi');
assert.equal(en.props.children[3].props.onChange,onChange);
assert.equal(en.props.children[3].props['data-answer'],'a0');
assert.ok(renderToStaticMarkup(en).includes('Grammar library'));
assert.ok(renderToStaticMarkup(original).includes('Kho ngữ pháp'));
for(const reading of ['ba','mā','má','mǎ','mà','ma','bā','bàba','lǚ','shì']){
 for(const props of [{className:'pinyin'},{lang:'zh-Latn'},{className:'reading-pinyin'}]){
  const output=localizeView(createElement('span',{className:props.className,lang:props.lang},reading),'en') as ReactElement<{children:string}>;
  assert.equal(output.props.children,reading,'Changed rendered pinyin: '+reading);
 }
}
assert.equal(translate('Thanh 1 · ngang cao','en'),'Tone 1 · high and level');
assert.equal(translate('是 nối danh tính','en'),'是 for identity');
const lookup=createEnglishLookup(JSON.parse(fs.readFileSync('data/cedict.json','utf8')));
const word=(hanzi:string,pinyin:string,meaningEn?:string)=>({hanzi,pinyin,meaning:'原义',language:'vi',meaningEn});
assert.match(lookup(word('爱','ài'))!.meaning,/to love/);
assert.match(lookup({...word('爱','ài'),pinyinSource:'/ài/'})!.meaning,/to love/);
assert.match(lookup(word('爱好','àihào'))!.meaning,/hobby/);
assert.equal(lookup(word('八','bā'))!.meaning,'eight');
assert.match(lookup(word('爸爸','bàba'))!.meaning,/dad/);
assert.match(lookup(word('吧','ba'))!.meaning,/modal particle/);
assert.ok(!lookup(word('吧','ba'))!.meaning.includes('bar (loanword)'));
assert.match(lookup(word('吧','bā'))!.meaning,/bar \(loanword\)/);
assert.ok(!lookup(word('白','bái'))!.meaning.includes('surname Bai'));
assert.match(lookup(word('白','Bái'))!.meaning,/surname Bai/);
assert.match(lookup(word('愛','ài'))!.meaning,/to love/);
assert.equal(lookup(word('爱','ái')),undefined,'Do not merge different tones');
assert.equal(lookup(word('𠀀','bā')),undefined,'Missing entries have no invented meaning');
assert.equal(lookup(word('爱','ài','love; Love; LOVE'))!.meaning,'love');
assert.equal(readingIdentity('lu:3'),'lǚ');assert.notEqual(readingIdentity('lu:3'),readingIdentity('lu3'));
const offline=JSON.parse(fs.readFileSync('public/offline-course.json','utf8'));
assert.equal(offline.locale,'en');assert.equal(offline.lessons.length,48);
for(const w of offline.words){assert.ok(!vi.test(w.vi));assert.equal(w.zh,words.find(x=>x.id===w.id)!.zh);}
assert.ok(!vi.test(fs.readFileSync('public/offline.html','utf8')));
if(fs.existsSync('data/materials.en.json')){
 const privateMap:Record<string,string>={...JSON.parse(fs.readFileSync('data/materials.en.json','utf8')),...(fs.existsSync('data/materials-overrides.en.json')?JSON.parse(fs.readFileSync('data/materials-overrides.en.json','utf8')):{})};
 for(const [source,result] of Object.entries(privateMap)){
  assert.ok(!vi.test(result),'Vietnamese remains in a personal translation: '+source);
  for(const token of source.match(/\b[A-Za-z\u00c0-\u024f]*[āēīōūǎěǐǒǔǖǘǚǜ][A-Za-z\u00c0-\u024f]*\b/gu)||[])assert.ok(result.includes(token),'Changed a pinyin reference: '+token);
 }
}
console.log(JSON.stringify({ui:Object.keys(ui).length,words:words.length,lessons:lessons.length,grammar:grammar.length,exercises:Object.keys(allExercises).length,checks:'English coverage, Hanzi/pinyin preservation, grading, stable React keys, learner input and offline pack passed'}));
