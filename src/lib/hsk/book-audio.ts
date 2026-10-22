import textbook from './material-audio-index.json';
import workbook from './workbook-audio-clips.json';

export type BookAudioTrack = {
 id:string; collection:'textbook'|'workbook'; lesson:number; url:string;
 track?:number; kind?:string; duration?:number;
};

export const bookAudioTracks:BookAudioTrack[] = [
 ...textbook.map(a=>({id:a.id,collection:'textbook' as const,lesson:a.lesson,url:a.url,track:a.track,kind:a.kind})),
 ...workbook.map(a=>({id:a.id,collection:'workbook' as const,lesson:Number(/^wb-(\d+)/.exec(a.sourceId)?.[1]||16),url:a.url,duration:a.duration})),
];

// Preserve the existing learner preference: this recording remains in the
// archive, but is omitted from the listening playlist.
export const playableBookAudio = bookAudioTracks.filter(a=>a.id!=='01-1');
