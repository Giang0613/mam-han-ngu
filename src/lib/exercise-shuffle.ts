// Stable per item, so selecting a response never moves the remaining controls.
export function shuffled<T>(items:readonly T[],seed:string):T[]{
 let state=2166136261;
 for(const char of seed)state=Math.imul(state^char.charCodeAt(0),16777619)>>>0;
 if(!state)state=1;
 const result=[...items];
 for(let i=result.length-1;i>0;i--){state^=state<<13;state^=state>>>17;state^=state<<5;const j=(state>>>0)%(i+1);[result[i],result[j]]=[result[j],result[i]];}
 return result;
}
