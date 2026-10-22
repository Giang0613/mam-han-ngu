import type {Locale} from './types';

const nouns={
 activity:['activity','activities','hoạt động'],
 word:['word','words','từ'],
 card:['card','cards','thẻ'],
 question:['question','questions','câu'],
 minute:['minute','minutes','phút'],
 recall:['successful recall','successful recalls','lần nhớ liên tiếp'],
 result:['result','results','kết quả'],
} as const;
export function countText(value:number,noun:keyof typeof nouns,locale:Locale){
 const [one,many,vi]=nouns[noun];
 const number=new Intl.NumberFormat(locale==='en'?'en-US':'vi-VN').format(value);
 return `${number} ${locale==='vi'?vi:value===1?one:many}`;
}
export const dueText=(value:number,locale:Locale)=>locale==='en'?`${countText(value,'card',locale)} due`:`${countText(value,'card',locale)} đến hạn`;
export const reviewTitle=(value:number,locale:Locale)=>locale==='en'?`${countText(value,'word',locale)} ready to review`:`${value} thẻ đến lúc ôn`;
export const goalRemaining=(value:number,locale:Locale)=>locale==='en'?`${countText(value,'activity',locale)} to reach your goal.`:`Còn ${value} hoạt động để đạt mục tiêu.`;
export const streakText=(value:number,locale:Locale)=>locale==='en'?`${value}-day streak`:`${value} ngày liên tiếp`;
