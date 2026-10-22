const marks:Record<string,string[]>={a:['a','ā','á','ǎ','à'],e:['e','ē','é','ě','è'],i:['i','ī','í','ǐ','ì'],o:['o','ō','ó','ǒ','ò'],u:['u','ū','ú','ǔ','ù'],ü:['ü','ǖ','ǘ','ǚ','ǜ']};
export function displayPinyin(source:string){return source.replace(/([A-Za-zÜüÊê:]+)([0-5])/g,(_match:string,raw:string,num:string)=>{
 const syllable=raw.replace(/u:/gi,m=>m[0]==='U'?'Ü':'ü').replace(/v/g,'ü').replace(/V/g,'Ü'),tone=Number(num);if(tone===0||tone===5)return syllable;
 const lower=syllable.toLowerCase();let index=lower.indexOf('a');if(index<0)index=lower.indexOf('e');if(index<0)index=lower.indexOf('ou');if(index<0){for(let i=lower.length-1;i>=0;i--)if('iouü'.includes(lower[i])){index=i;break}}
 if(index<0){const symbol=({m:['m','m̄','ḿ','m̌','m̀'],n:['n','n̄','ń','ň','ǹ'],ê:['ê','ê̄','ế','ê̌','ề']} as Record<string,string[]>)[lower];return symbol?(syllable===syllable.toUpperCase()?symbol[tone].toUpperCase():symbol[tone]).normalize('NFC'):syllable;}
 const base=syllable[index],letter=marks[base.toLowerCase()]?.[tone];if(!letter)return syllable;return (syllable.slice(0,index)+(base===base.toUpperCase()?letter.toUpperCase():letter)+syllable.slice(index+1)).normalize('NFC');
 })}
