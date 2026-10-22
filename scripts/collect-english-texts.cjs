const fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const pub=new Set(),priv=new Set(),isVi=s=>/[đĐăĂâÂêÊôÔơƠưƯ\u1ea0-\u1ef9]/u.test(s);
function add(value,set){if(typeof value==='string'&&value.length<2400&&isVi(value))set.add(value.replace(/\s+/g,' ').trim());else if(Array.isArray(value))value.forEach(x=>add(x,set));else if(value&&typeof value==='object')Object.values(value).forEach(x=>add(x,set));}
const inventory=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));add(inventory,pub);
function walk(dir,set,code=false){for(const e of fs.readdirSync(dir,{withFileTypes:true})){
 const f=path.join(dir,e.name);if(e.isDirectory()){if(e.name!=='i18n')walk(f,set,code);continue;}
 if(code&&/\.tsx?$/.test(f)){
  const restricted=/materials-catalog\.ts$/.test(f);const destination=restricted?priv:set;
  const source=ts.createSourceFile(f,fs.readFileSync(f,'utf8'),ts.ScriptTarget.Latest,true);
  function visit(n){if(ts.isStringLiteral(n)||ts.isNoSubstitutionTemplateLiteral(n))add(n.text,destination);if(ts.isTemplateExpression(n)){let s=n.head.text;n.templateSpans.forEach((p,i)=>s+=`{${i}}`+p.literal.text);add(s,destination);}ts.forEachChild(n,visit);}visit(source);
 }else if(f.endsWith('.json')){const restricted=/material-answer-|material-audio-|workbook-audio-clips|vocabulary-summary/.test(f);add(JSON.parse(fs.readFileSync(f,'utf8')),restricted?priv:set);}
}}
walk('src',pub,true);walk('data/hsk1-materials/native',priv);walk('data/hsk1-materials/pages',priv);
// Textbook catalogs and publisher-specific answer explanations remain private.
for(const f of ['src/lib/hsk/material-answer-keys.json','src/lib/hsk/materials-catalog.ts']){
 if(f.endsWith('.json'))add(JSON.parse(fs.readFileSync(f,'utf8')),priv);
}
for(const f of ['data/hsk-vocabulary-lessons.json','data/hsk-vocabulary-sources.json'])add(JSON.parse(fs.readFileSync(f,'utf8')),priv);
const vocabulary=JSON.parse(fs.readFileSync('data/hsk-vocabulary.json','utf8'));for(const w of vocabulary)add(w,priv);
fs.mkdirSync('.cache/i18n',{recursive:true});fs.writeFileSync('.cache/i18n/public-texts.json',JSON.stringify([...pub]));fs.writeFileSync('.cache/i18n/private-texts.json',JSON.stringify([...priv].filter(s=>!pub.has(s))));
console.log({public:pub.size,private:priv.size});
