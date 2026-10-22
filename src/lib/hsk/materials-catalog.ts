const audioIndex: MaterialAudio[] = [];
const audioPlacement: {audioId:string;pageId:string;blockId:string}[] = [];
import type {MaterialSubmission} from './material-grading';
export const HSK1_MATERIAL_REVISION='hsk1-books-2026-10-07-v1';
export type MaterialBook='textbook'|'workbook'|'writing';
export const materialBooks:{id:MaterialBook;title:string;pages:number}[]=[
 {id:'textbook',title:'Bài học',pages:144},{id:'workbook',title:'Bài tập',pages:139},{id:'writing',title:'Tập viết',pages:15},
];
export type MaterialLesson={id:number;zh:string;py:string;vi:string;goal:string;pages:Record<MaterialBook,number[]>};
const titles:string[][]=[];
const textbookStarts=[16,20,25,33,42,50,60,69,76,85,93,101,110,118,127,137];
const workbookStarts=[8,12,16,20,29,38,46,55,64,73,82,91,100,109,118,128];
const writingRanges:Record<number,[number,number]>={8:[1,1],9:[2,3],10:[4,5],11:[6,7],12:[8,9],13:[10,11],14:[12,13],15:[14,15]};
const range=(a:number,b:number)=>Array.from({length:b-a+1},(_,i)=>a+i);
export const materialLessons:MaterialLesson[]=titles.map(([zh,py,vi,goal],i)=>({id:i+1,zh,py,vi,goal,pages:{textbook:range(textbookStarts[i],textbookStarts[i+1]-1),workbook:range(workbookStarts[i],workbookStarts[i+1]-1),writing:writingRanges[i+1]?range(...writingRanges[i+1]):[]}}));
export const materialSections:MaterialLesson[]=[
 {id:0,zh:'学习指南',py:'Xuéxí zhǐnán',vi:'Hướng dẫn và phần mở đầu',goal:'Cách dùng sách, nhân vật và ngôn ngữ trong lớp.',pages:{textbook:range(1,15),workbook:range(1,7),writing:[]}},
 ...materialLessons,
 {id:16,zh:'复习与附录',py:'Fùxí yǔ fùlù',vi:'Ôn tập, đề mô phỏng và phụ lục',goal:'Đề luyện tổng hợp, bảng từ và phần cuối của bộ tài liệu.',pages:{textbook:range(137,144),workbook:range(128,139),writing:[]}},
];
// Keep archival ranges for import checks, but opening matter and back covers
// are not learning activities. Existing drafts keep their original page IDs.
export const materialLearningSections:MaterialLesson[]=[...materialLessons,{...materialSections[16],pages:{textbook:range(137,143),workbook:[128,129,130,131,132,134,135,136,137],writing:[]}}];
export function learningMaterialLesson(id:number){return materialLearningSections.find(l=>l.id===id)}
export function materialLesson(id:number){return materialSections.find(l=>l.id===id)}
export function materialPageId(book:MaterialBook,page:number){return `${book}-${String(page).padStart(3,'0')}`}
export function validMaterialPageId(id:string){const m=/^(textbook|workbook|writing)-(\d{3})$/.exec(id);return !!m&&Number(m[2])>=1&&Number(m[2])<=materialBooks.find(b=>b.id===m[1])!.pages}
export type MaterialAudio={lesson:number;track:number;id:string;url:string;kind:string;section:number;title:string;markerPage:number;pages:number[]};
// The learner requested removal of this one recording from every study mode.
// Retain the imported asset/index for archive integrity and hide it centrally.
export function materialAudio(lesson:number):MaterialAudio[]{return audioIndex.filter(a=>a.lesson===lesson&&a.id!=='01-1')}
export function materialPageAudio(lesson:number,book:MaterialBook,page:number){return book==='textbook'?materialAudio(lesson).filter(a=>a.pages.includes(page)):[]}
// Source-page associations remain archival. The learner hears a recording only
// on its content page, not again on a preceding setup/instruction page.
export function materialStudyPageAudio(lesson:number,book:MaterialBook,page:number){const pageId=materialPageId(book,page);return materialPageAudio(lesson,book,page).filter(a=>audioPlacement.some(p=>p.audioId===a.id&&p.pageId===pageId))}
export function materialBlockAudio(lesson:number,page:NativeMaterialPage,blockId:string){return materialStudyPageAudio(lesson,page.book,page.page).filter(a=>audioPlacement.some(p=>p.audioId===a.id&&p.pageId===page.id&&p.blockId===blockId))}
const speakerNames:Record<string,string>={};
export function materialSpeakerName(name:string){return speakerNames[name]||name}
export type MaterialLine={id:string;text:string;zh:string;pinyin:string;vi:string;translation:'edited'|'machine';confidence:number;reviewed?:boolean;audio?:boolean};
export type MaterialPage={id:string;book:MaterialBook;page:number;image:string;width:number;height:number;lines:MaterialLine[];audioTracks:number[]};
export type MaterialDraft={answers:Record<string,string>;notes:string;done:boolean;submissions?:Record<string,MaterialSubmission>};
export type NativeMaterialItem=MaterialLine&{label?:string;speaker?:string;speakerPinyin?:string;role?:'explanation'|'instruction'|'example'|'utterance'|'word';practiceMode?:'with-others';responseKey?:string;extraResponses?:string[];mergedIds?:string[];accepted?:string[];explanation?:string};
export type NativeMaterialBlock={id:string;kind:'reading'|'dialogue'|'vocabulary'|'grammar'|'exercise'|'phonetics'|'writing';title:string;items:NativeMaterialItem[];practiceMode?:'with-others';responseKey?:string;retiredResponseKeys?:string[];context?:string;soundGroups?:{title:string;tokens:string[]}[];table?:{columns:string[];rows:string[][];readings?:string[][]};characters?:string[]};
export type NativeMaterialPage={id:string;book:MaterialBook;page:number;title:string;blocks:NativeMaterialBlock[];audioTracks:number[]};
