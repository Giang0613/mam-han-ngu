import assert from 'node:assert/strict';
import fs from 'node:fs';
import {speechReading,validSpeechReading,speechSample} from '../src/lib/speech-reading';
import {writingReadings} from '../src/lib/writing-readings';
import {words,grammar} from '../src/lib/course';
const cases:[string,string,string][]=[
 ['妈','mā','ma1'],['麻','má','ma2'],['马','mǎ','ma3'],['骂','mà','ma4'],['吗','ma','ma5'],['啊','á','a2'],
 ['行','háng','hang2'],['行','xíng','xing2'],['乐','yuè','yue4'],['乐','lè','le4'],
 ['得','dé','de2'],['得','děi','dei3'],['女','nǚ','nv3'],['绿','lǜ','lv4'],
 ['学生','xuésheng','xue2 sheng5'],['音乐','yīnyuè','yin1 yue4'],
 ['你好！','nǐ hǎo','ni3 hao3'],['好吗？','hǎo ma','hao3 ma5'],
 ['西安','xīān','xi1 an1'],['先','xiān','xian1'],
];
for(const [text,py,expected] of cases){assert.equal(speechReading(text,py),expected);assert.ok(validSpeechReading(text,expected))}
assert.equal(speechReading('学生','not valid!'),undefined);
assert.equal(speechReading('2025年'),undefined);
assert.equal(validSpeechReading('女','nu9'),false);
assert.equal(validSpeechReading('你好','ni3'),false);
assert.deepEqual(speechSample('了','liǎo'),{text:'了解',pinyin:'liǎojiě',reading:'liao3 jie3',contextual:true});
assert.equal(speechSample('着','zháo').text,'着火');
assert.equal(speechSample('便','pián').reading,'pian2 yi5');
assert.equal(speechSample('了','le').contextual,false);
for(const [char,readings] of Object.entries(writingReadings))for(const py of readings)assert.ok(speechSample(char,py).reading,`${char}/${py}`);
const writing=JSON.parse(fs.readFileSync('data/writing-characters.json','utf8')) as {character:string;readings:string[]}[];
for(const {character,readings} of writing)for(const py of readings){
 const sample=speechSample(character,py);
 // The speech phone inventory has no standalone nasal ng; keep the lexical
 // spelling and let the existing Hanzi speech path handle it without a fake hint.
 if(character==='嗯'&&py==='ǹg')assert.equal(sample.reading,undefined);
 else assert.ok(sample.reading,`No aligned reading for writing character ${character}/${py}`);
}
let aligned=0;for(const entry of [...words,...grammar]){const reading=speechReading(entry.zh,entry.pinyin);if(reading){assert.ok(validSpeechReading(entry.zh,reading));aligned++}}
const imported=JSON.parse(fs.readFileSync('data/hsk-vocabulary.json','utf8'));
const entries=Array.isArray(imported)?imported:imported.entries||imported.words;
let dictionaryAligned=0;
if(entries)for(const w of entries){const text=w.hanzi||w.zh,reading=speechReading(text,w.pinyin);if(reading){assert.ok(validSpeechReading(text,reading));dictionaryAligned++}}
console.log(`Speech reading: ${cases.length} reference cases, ${writing.length} handwriting characters, ${aligned} course entries, ${dictionaryAligned} dictionary entries aligned. Malformed hints rejected.`);
if(process.env.SUPERWEB_SPEECH_CASES){
 const corpus=[...cases.map(([text,pinyin])=>({text,pinyin,reading:speechReading(text,pinyin)})),...writing.flatMap(({character,readings})=>readings.map(pinyin=>speechSample(character,pinyin))),...grammar.map(g=>({text:g.zh,pinyin:g.pinyin,reading:speechReading(g.zh,g.pinyin)}))];
 fs.writeFileSync(process.env.SUPERWEB_SPEECH_CASES,JSON.stringify(corpus,null,2));
}
