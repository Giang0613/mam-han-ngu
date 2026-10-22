export type Profile={name:string;goal:number;start_level:number;pinyin:number;rate:number;muted:number;legacy_xp:number};
export type Attempt={event_id:string;exercise_id:string;answer:string;correct:number;hint:number;concept:string;skill:string;version:string;created_at:string};
export type StudyCard={id:string;hanzi:string;pinyin:string;meaning:string;language:string;source:string;interval:number;repetition:number;ease:number;due:string;revision:number};
export type Snapshot={profile:Profile;attempts:Attempt[];cards:StudyCard[];bookmarks:string[];reviewDays:string[];placement:{result:string;created_at:string}|null;services:{ai:boolean;speech:boolean}};
export const emptySnapshot:Snapshot={profile:{name:'Học viên',goal:10,start_level:1,pinyin:1,rate:.8,muted:0,legacy_xp:0},attempts:[],cards:[],bookmarks:[],reviewDays:[],placement:null,services:{ai:false,speech:false}};
