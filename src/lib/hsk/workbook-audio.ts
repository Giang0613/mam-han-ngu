import clips from './workbook-audio-clips.json';

export type WorkbookAudioClip={id:string;sourceId:string;pageId:string;blockId:string;itemId?:string;tableRow?:number;label:string;url:string;start:number;end:number;duration:number};
export function workbookPageAudio(pageId:string):WorkbookAudioClip[]{return (clips as WorkbookAudioClip[]).filter(c=>c.pageId===pageId)}
export function workbookAudioContext(context:string|undefined,available:boolean){
 if(!context||!available)return context;
 if(/^(Bộ âm thanh bạn cung cấp chưa có|Chưa có bản thu riêng|Cần bản thu bài tập tương ứng)/i.test(context))return undefined;
 return context.replace(/[.;]\s*(?:chưa có bản thu|cần bản thu bài tập)[^.]*\.?/gi,'.').replace(/luyện nghe (?:ngữ điệu )?với giáo viên/gi,'nghe bản thu rồi luyện đọc');
}
