import fs from 'node:fs';
import {words,grammar,lessons,placementExercises,exercises} from '../src/lib/course';
import ui from '../src/lib/i18n/ui.en.json';
import {toneExercises} from '../src/lib/study-engine';
import {hskGrammar} from '../src/lib/hsk/grammar';

const map:Record<string,string>={};
const normalize=(s:string)=>s.replace(/\s+/g,' ').trim();
const add=(vi:string,en:string)=>{map[normalize(vi)]=en};
for(const line of fs.readFileSync('src/lib/i18n/lexicon.en.tsv','utf8').trim().split(/\r?\n/).filter(Boolean)){
 const split=line.indexOf('|');if(split<1)throw Error('Invalid lexicon line');add(line.slice(0,split),line.slice(split+1));
}
const translated=new Map<string,{title:string;formula:string;vi:string;note:string}>();
const hskRows=fs.readFileSync('src/lib/i18n/hsk.en.tsv','utf8').trim().split(/\r?\n/);
if(hskRows.length!==hskGrammar.length)throw Error('Missing HSK grammar translations');
for(const [index,line] of hskRows.entries()){
 const [id,focus,note]=line.split('|'),g=hskGrammar[index];
 if(Number(id)!==index+1||!focus||!note)throw Error('Invalid HSK translation: '+id);
 add(g.focus,focus);add(g.note,note);
 add(`Theo cấu trúc “${g.focus}”, chọn từ cho chỗ trống.`,`Using “${focus}”, choose the word that fills the blank.`);
 add(`${g.sentence.replace('___',g.answer)} ${g.note}`,`${g.sentence.replace('___',g.answer)} ${note}`);
}
for(const line of fs.readFileSync('src/lib/i18n/core.en.tsv','utf8').trim().split(/\r?\n/)){
 const [id,title,formula,vi,note]=line.split('|');
 const source=grammar.find(g=>g.id===id);if(!source||!title||!formula||!vi||!note)throw Error('Invalid grammar translation: '+id);
 translated.set(id,{title,formula,vi,note});
 add(source.title,title);add(source.formula,formula);add(source.vi,vi);add(source.note,note);
 add(`Sắp câu theo mẫu: ${source.formula}`,`Arrange the sentence using this pattern: ${formula}`);
 add(`${source.zh} ${source.vi} ${source.note}`,`${source.zh} ${vi} ${note}`);
 add(`${source.zh} ${source.vi}`,`${source.zh} ${vi}`);
}
if(translated.size!==grammar.length)throw Error('Missing grammar translations');
for(const word of words)if(!map[normalize(word.vi)])throw Error('Missing word meaning: '+word.id+' '+word.vi);
for(const lesson of lessons)if(!map[normalize(lesson.title)])throw Error('Missing lesson title: '+lesson.title);
for(const word of words){
 const meaning=map[normalize(word.vi)];
 add(`“${word.zh}” có nghĩa là gì?`,`What does “${word.zh}” mean?`);
 add(`${word.zh} (${word.pinyin}): ${word.vi}.`,`${word.zh} (${word.pinyin}): ${meaning}.`);
 add(`Bạn vừa nghe ${word.zh} (${word.pinyin}): ${word.vi}.`,`You heard ${word.zh} (${word.pinyin}): ${meaning}.`);
 add(`Gõ chữ Hán có nghĩa “${word.vi}”.`,`Type the Chinese word meaning “${meaning}”.`);
 add(`Đáp án: ${word.zh} (${word.pinyin}).`,`Answer: ${word.zh} (${word.pinyin}).`);
}
for(const e of placementExercises)add(e.prompt,`Choose the correct meaning: ${e.zh}`);
for(const e of toneExercises){
 add(e.prompt,`Which tone does “${e.pinyin}” have?`);
 add(e.explanation,`${e.zh} (${e.pinyin}) has ${e.answer==='5'?'a neutral tone':`tone ${e.answer}`}. This checks tone-mark recognition, not the sound of your voice.`);
}
const extra:Record<string,string>={
 'Chào {0}.':'Hi, {0}.','Nghe {0}':'Listen to {0}','Nghe trong {0}':'Listen in {0}','Tranh {0}':'Picture {0}',
 'Mầm':'Mandarin','Hán Ngữ':'Sprout','Mầm Hán Ngữ':'Mandarin Sprout','Mầm Hán Ngữ · Tiếng Trung mỗi ngày':'Mandarin Sprout · Chinese every day',
 ' · Mục tiêu luyện {0} chữ':' · Practice target: {0} characters',' · {0} mục':' · {0} items',' · ô {0}':' · field {0}',
 '; phần nói riêng khoảng {0} phút':'; speaking separately: about {0} minutes','Bài làm đã lưu trước đây · ô {0}':'Previously saved work · field {0}',
 'Bản nháp: {0}':'Draft: {0}','Bản thu · {0}':'Recording · {0}','CHẶNG {0} · 6 BÀI HỌC':'STAGE {0} · 6 LESSONS','CHẶNG {0} · {1} PHÚT':'STAGE {0} · {1} MINUTES',
 'Câu {0}/{1} · Kết quả được lưu sau mỗi câu':'Question {0}/{1} · Each answer is saved','Còn {0} hoạt động để đạt mục tiêu.':'{0} more activities to reach your goal.',
 'Dừng: {0}':'Stop: {0}','HSK {0}. Từ vựng có liên kết.':'HSK {0}. Vocabulary in context.',
 'Hoàn thành chữ {0}! {1} lần cần thử lại. Đây là kết quả tập viết, không phải điểm thi.':'Character {0} complete! {1} retries. This is handwriting practice, not an exam score.',
 'Luyện viết chữ {0}':'Practice writing {0}','NGỮ PHÁP · CHẶNG {0}':'GRAMMAR · STAGE {0}',
 'Nghe câu hỏi: {0}':'Hear the question: {0}','Nghe lựa chọn: {0}':'Hear the option: {0}','Nghe mảnh câu: {0}':'Hear the sentence piece: {0}','Nghe mẫu {0} · {1}':'Play sample {0} · {1}',
 'Phần luyện tiếp theo · HSK {0}':'Next practice · HSK {0}','Tra chữ Hán, pinyin hoặc nghĩa tiếng Việt. {0}':'Search Chinese characters, pinyin, or a meaning. {0}',
 '{0} / {1} hoạt động hôm nay':'{0} / {1} activities today','{0} XP · Hồ sơ cá nhân':'{0} XP · Personal profile','{0} câu luyện':'{0} practice questions',
 '{0} mục từ được chia thành bài theo chủ đề. Mỗi bài tối đa 16 từ, có pinyin, âm thanh, kiểm tra nghĩa theo hai chiều.':'{0} words grouped into topic lessons. Up to 16 words per lesson, with pinyin, audio, and two-way recognition practice.',
 '{0} mục từ, chia theo HSK 1–9.':'{0} words organized by HSK 1–9.','{0} nhiệm vụ tự luyện':'{0} self-practice tasks','{0} thẻ đến hạn':'{0} due cards',
 '{0} thẻ đến hạn · {1} từ đã lưu · Lịch ôn SM-2 trên máy này.':'{0} due cards · {1} saved words · SM-2 review on this computer.',
 '{0} · câu {1}{2}':'{0} · question {1}{2}','{0} ĐIỂM NGỮ PHÁP · GIẢI THÍCH BẰNG TIẾNG VIỆT':'{0} GRAMMAR PATTERNS · CLEAR EXPLANATIONS',
 '{0}/8 câu đã làm':'{0}/8 questions answered','{0}/{1} câu đã làm':'{0}/{1} questions answered','{0}/{1} câu đúng độc lập':'{0}/{1} correct independently','{0}/{1} đúng':'{0}/{1} correct',
 'Ô luyện viết chữ {0}':'Writing pad for {0}','Đáp án tham khảo: {0}':'Reference answer: {0}','Đúng nét {0}. Tiếp tục nhé!':'Stroke {0} is correct. Keep going!',
 'Học liệu sách không đi kèm bản cộng đồng':'Textbook resources are not included in the community edition',
 'Bản mã nguồn mở giữ các bài học tự biên soạn. PDF, bản dịch, đáp án và audio của sách được tách riêng để giữ quyền của tác giả.':'This edition includes original lessons. Publisher PDFs, translations, answer keys, and recordings are distributed separately to respect their authors’ rights.',
 'Học các bài nền tảng →':'Explore the foundation lessons →','Về lộ trình luyện tập →':'Back to the practice path →',
 'Không tải được hồ sơ.':'Could not load your profile.','Chưa lưu được. Hãy thử lại.':'Could not save. Please try again.',
 'Chưa lưu được dữ liệu. Hãy giữ bài làm và thử lại.':'Could not save your data. Keep your answer and try again.',
 'Interface language':'Interface language','Ngôn ngữ giao diện':'Interface language',
 'English translations are drafts; corrections are welcome.':'English translations are drafts; corrections are welcome.'
 ,'Chuyển từ tiếng Việt sang tiếng Trung, giữ quan hệ ý và mức độ chắc chắn.':'Translate from English into Chinese, preserving logical relationships and degrees of certainty.'
 ,'Dịch tiếng Việt':'English translation','Nghĩa tiếng Việt':'English meaning'
 ,'Lưu {0}':'Save {0}','Bỏ lưu {0}':'Unsave {0}','Người nói:':'Speaker:'
 ,'Bạn nghe danh từ {0} ({1}), nghĩa là {2}. Tranh trên web là biểu tượng luyện tập, không phải ảnh đề chính thức.':'You heard the noun {0} ({1}), meaning {2}. The pictures here are practice icons, not official exam images.'
 ,'Đáp án: {0}. Bằng chứng trong đoạn: {1}':'Answer: {0}. Evidence in the passage: {1}'
 ,'{0}: {1}. Hãy đối chiếu với thông tin và lập luận trong văn bản, không bổ sung giả định ngoài đoạn.':'{0}: {1}. Use information and reasoning from the text without adding outside assumptions.'
 ,'Điền chữ Hán còn thiếu: {0} ({1})':'Fill in the missing Chinese characters: {0} ({1})'
 ,'Luyện lại {0}: còn {1} lượt chưa đúng trong {2} lượt gần đây.':'Practice {0} again: {1} incorrect answers in your last {2} attempts.'
 ,'Hội thoại, từ mới, ngữ pháp và bài tập có pinyin, nút dịch tiếng Việt, luyện nói và luyện viết.':'Dialogues, vocabulary, grammar, and exercises with pinyin, English translations, speaking, and handwriting.'
 ,'Hội thoại, từ mới, ngữ pháp và bài tập trực tiếp trên web. Đọc với pinyin, nghe mẫu và mở nghĩa tiếng Việt khi cần.':'Study dialogues, vocabulary, grammar, and exercises here. Use pinyin, listen to samples, and reveal the English meaning when needed.'
};
Object.entries(extra).forEach(([vi,en])=>add(vi,en));
fs.writeFileSync('src/lib/i18n/overrides.en.json',JSON.stringify(map,null,2)+'\n');
console.log(JSON.stringify({wordMeanings:words.length,lessonTitles:lessons.length,grammar:translated.size,overrides:Object.keys(map).length,coreQuestions:exercises.length}));
