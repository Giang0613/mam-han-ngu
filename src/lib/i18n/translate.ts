import ui from './ui.en.json';
import content from './content.en.json';
import overrides from './overrides.en.json';
import reviewed from './reviewed.en.json';
import type {Locale} from './types';

const authored:Record<string,string>={...overrides,...reviewed};
const catalog:Record<string,string>={...content,...ui,...authored};
const escape=(s:string)=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
// Wildcards are executable matching rules: use only authored templates, never
// machine-generated source snippets that might match pinyin or English prose.
const templates=Object.entries(authored).filter(([key])=>/\{\d+\}/.test(key)&&key.replace(/\{\d+\}/g,'').trim().length>0).sort(([a],[b])=>b.replace(/\{\d+\}/g,'').length-a.replace(/\{\d+\}/g,'').length).map(([key,value])=>{
 const parts=key.split(/\{\d+\}/);
 return {key,value,regex:new RegExp('^'+parts.map(escape).join('([\\s\\S]*?)')+'$')};
});
export function translate(source:string,locale:Locale):string{
 if(locale==='vi'||!source)return source;
 const trimmed=source.trim(),key=trimmed.replace(/\s+/g,' ');
 // Reviewed wording and authored patterns take precedence over generated full
 // sentences. Otherwise an old machine translation can conceal a correction.
 let result=authored[key]??ui[key as keyof typeof ui];
 if(result===undefined){
  for(const template of templates){
   // Broad legacy patterns such as "Bài {0}" must not shadow known labels.
   if(catalog[key]!==undefined&&!Object.hasOwn(reviewed,template.key))continue;
   const match=template.regex.exec(key);if(!match)continue;
   result=template.value.replace(/\{(\d+)\}/g,(_,i)=>{
    const captured=match[Number(i)+1]??'';
    return template.key==='Chào {0}.'?captured:translate(captured,locale);
   });break;
  }
 }
 if(result===undefined)result=catalog[key];
 if(result===undefined&&key.includes(' · ')){
  const parts=key.split(' · '),localized=parts.map(part=>translate(part,'en'));
  if(localized.some((part,i)=>part!==parts[i]))result=localized.join(' · ');
 }
 return result===undefined?source:source.slice(0,source.length-source.trimStart().length)+result+source.slice(source.trimEnd().length);
}
export const hasEnglish=(source:string)=>Object.hasOwn(catalog,source.trim().replace(/\s+/g,' '));
export const englishCatalog=catalog;
