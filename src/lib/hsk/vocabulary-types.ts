export type VocabularySense = {
 partOfSpeech?:string; meaning:string; example?:string; examplePinyin?:string; exampleMeaning?:string;
};
export type VocabularyEntry = {
 id:string; hanzi:string; aliases?:string[]; pinyin:string; pinyinSource:string; meaning:string; meaningEn?:string;
 language:'vi'; source:string; sourceId:string; sourceRow:number; sourcePage:number; sourceLevel:string;
 level:number; topic:string; topicTitle:string; lessonId:string; lessonTitle:string;
 translationStatus:'provided'|'adapted'|'draft'; translationMethod:string; senses:VocabularySense[];
 allocationReason?:string;
};
export type VocabularyLesson = {
 id:string; level:number; topic:string; topicTitle:string; title:string; goal:string; wordIds:string[];
 sequence:number; prerequisite?:string; preview:string[]; previewPinyin?:string[];
};
export type VocabularySource = {id:string;filename:string;origin:string;sourceUrl:string;pages:number;rows:number;level:string;sha256:string;importedOn:string};
export type VocabularySummary = {total:number;advanced:number;lessons:number;levels:{level:number;words:number;lessons:number}[]};
export type LessonIndex = {results:VocabularyLesson[];total:number;page:number;hasMore:boolean;topics:{id:string;title:string;count:number}[];words:number};
