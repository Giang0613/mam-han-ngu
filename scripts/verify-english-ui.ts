import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import {translate} from '../src/lib/i18n/translate';
import {countText,dueText,reviewTitle,goalRemaining,streakText} from '../src/lib/i18n/counts';
import {hskModules} from '../src/lib/hsk/catalog';
import {scenarios} from '../src/lib/course';

// Unlike the older coverage check, include ordinary acute/grave accents.
// Khó, Bài, and Chính xác were previously missed because these accents also
// occur in pinyin. Keep the authored phonetic fixtures explicit and unchanged.
const phonetics=new Set(['xuéxí','mā','má','mǎ','mà','hǎo ma','xué shēng','yín háng','xué · learn','a o e i u ü ai ei ao ou an en ang eng ong ia ie iao iu ian in iang ing iong ua uo uai ui uan un uang ueng üe üan ün']);
const missing:string[]=[];let strings=0;
function walk(dir:string){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
 const file=path.join(dir,entry.name);if(entry.isDirectory()){walk(file);continue;}
 if(!file.endsWith('.tsx'))continue;
 const ast=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 function visit(node:ts.Node){
  if(ts.isStringLiteral(node)||ts.isJsxText(node)||ts.isNoSubstitutionTemplateLiteral(node)){
   const text=node.text.replace(/\s+/g,' ').trim();
   if(/[\u00c0-\u024f\u1e00-\u1eff]/u.test(text)&&text!=='×'&&!phonetics.has(text)){
    strings++;if(translate(text,'en')===text)missing.push(`${file}:${ast.getLineAndCharacterOfPosition(node.pos).line+1} ${text}`);
   }
  }ts.forEachChild(node,visit);
 }visit(ast);
}}
walk('src/app');walk('src/components');assert.deepEqual(missing,[],'Untranslated UI literals');
assert.equal(translate('Khó','en'),'Hard');
assert.equal(translate('Chính xác!','en'),'Correct.');
assert.equal(translate('Bài học HSK 1','en'),'HSK 1 lessons','A broad lesson template must not override an exact label');
assert.equal(translate('Thông báo thư viện','en'),'A library announcement');
assert.equal(translate('Tập viết bổ trợ','en'),'Extra writing practice');
assert.equal(translate('Theo cấu trúc “不 phủ định thói quen”, chọn từ cho chỗ trống.','en'),'Using “不 for habitual negation”, choose the word that fills the blank.','Keep an already reviewed exercise translation');
assert.equal(translate('Tổ chức hoạt động: 可能下雨. Hãy đối chiếu với thông tin và lập luận trong văn bản, không bổ sung giả định ngoài đoạn.','en'),'Organizing an event: 可能下雨. Use information and reasoning from the text without adding outside assumptions.');
assert.equal(translate('Chào Nguyễn Văn An.','en'),'Hi, Nguyễn Văn An.');
for(const n of [0,1,2,11]){
 assert.equal(countText(n,'card','en'),`${n} ${n===1?'card':'cards'}`);
 assert.equal(dueText(n,'en'),`${n} ${n===1?'card':'cards'} due`);
 assert.equal(reviewTitle(n,'en'),`${n} ${n===1?'word':'words'} ready to review`);
 assert.equal(goalRemaining(n,'en'),`${n} ${n===1?'activity':'activities'} to reach your goal.`);
 assert.equal(streakText(n,'en'),`${n}-day streak`);
 assert.equal(countText(n,'card','vi'),`${n} thẻ`);
}
const forbidden=/Editor Collections|Lian said|magnetic quantity|dancing|Han with|dot - dot|_Other Organiser|Synchronising folder/;
for(const unit of hskModules)for(const source of [unit.title,unit.goal,...unit.method,...unit.mistakes])assert.ok(!forbidden.test(translate(source,'en')),unit.id+': '+source);
assert.deepEqual(scenarios.map(s=>translate(s.title,'en')),['Meeting for the first time','A cup of tea, please','Directions to the station','Lunch with a friend','Changing your travel plans','Sharing your point of view']);
for(const scenario of scenarios)for(const source of [scenario.goal,scenario.place,...scenario.turns.map(turn=>turn.vi)])assert.ok(!/[đĐăĂâÂêÊôÔơƠưƯ\u1ea0-\u1ef9]/u.test(translate(source,'en')),source);
console.log(JSON.stringify({uiStrings:strings,hskUnits:hskModules.length,checks:'UI literal coverage including acute accents, reviewed template precedence, singular/plural counts, reading preservation, and corrected practice guidance passed'}));
