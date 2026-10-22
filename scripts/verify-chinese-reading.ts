import assert from 'node:assert/strict';
import {hasChinese,chineseSegments,chineseSpeechText,readingFor} from '../src/lib/chinese-reading';
import {allExercises} from '../src/lib/study-engine';
import {words,grammar,placementExercises,grade} from '../src/lib/course';
import {hskTasks} from '../src/lib/hsk/catalog';
import {hskTexts} from '../src/lib/hsk/texts';

for(const w of words)assert.equal(readingFor(w.zh),w.pinyin);
for(const g of grammar)assert.equal(readingFor(g.zh),g.pinyin);
assert.equal(readingFor('“学生” có nghĩa là gì?'), 'xuésheng', 'preserve authored neutral tone in mixed prompts');
assert.match(readingFor('你叫什么名字？'), /míng zi/, 'keep the course neutral-tone reading in a new sentence');
assert.equal(readingFor('单','Shàn'), 'Shàn', 'authored name overrides the common reading');
assert.equal(readingFor('Tiếng Việt בלבד'), '');
assert.match(readingFor('银行'), /yín háng/);
assert.match(readingFor('音乐'), /yīnyuè/); // Course spelling is preserved.
assert.match(readingFor('重新开始'), /chóng/);
assert.match(readingFor('女'), /nǚ/);
assert.equal(chineseSpeechText('Hãy dùng 因为…所以 để viết câu. Không đọc tiếng Việt.'),'因为…所以');
assert.equal(chineseSpeechText('Năm 2025年，学习中文。'),'2025年，学习中文。');
assert.deepEqual(chineseSegments('Mẫu: 我喜欢中文。 Giải thích: 喜欢 là thích.'),['我喜欢中文。','喜欢']);
let supported=0;
function walk(value:unknown){
 if(typeof value==='string'&&hasChinese(value)){
  const reading=readingFor(value);assert.ok(reading&&/[a-z]/i.test(reading),`Missing pinyin: ${value}`);
  const spoken=chineseSpeechText(value);assert.ok(spoken&&/^[\p{Script=Han}\d\s，。！？、；：…“”‘’（）％%·]+$/u.test(spoken),`Invalid speech text: ${value}`);supported++;
 }else if(Array.isArray(value))value.forEach(walk);
 else if(value&&typeof value==='object')Object.values(value).forEach(walk);
}
walk(allExercises);walk(placementExercises);walk(hskTasks);walk(hskTexts);walk(grammar);
for(const e of Object.values(allExercises))assert.ok(grade(e,e.answer),`Reference grading changed: ${e.id}`);
console.log(`${supported} Chinese content fields have pinyin and Mandarin-only speech text; authored readings and grading preserved.`);
