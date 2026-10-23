export type WritingCharacter={character:string;readings:string[];strokes:number;levels:number[];wordIds:string[]};
export type WritingExample={id:string;hanzi:string;pinyin:string;meaning:string};
export type WritingDetail=WritingCharacter&{examples:WritingExample[]};
export type WritingIndex={results:WritingCharacter[];total:number;corpus:number;page:number;hasMore:boolean};
