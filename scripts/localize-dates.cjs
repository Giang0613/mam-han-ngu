const fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isDirectory()){walk(f);continue;}if(!f.endsWith('.tsx'))continue;
const src=fs.readFileSync(f,'utf8');if(!src.includes("'vi-VN'"))continue;
const ast=ts.createSourceFile(f,src,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),edits=[],owners=new Set();
function visit(n){if(ts.isStringLiteral(n)&&n.text==='vi-VN'){let owner=n.parent;while(owner&&!(ts.isFunctionDeclaration(owner)&&owner.name&&/^[A-Z]/.test(owner.name.text)))owner=owner.parent;if(owner?.body){owners.add(owner.body.getStart(ast)+1);edits.push({start:n.getStart(ast),end:n.end,text:"(locale==='en'?'en-US':'vi-VN')"});}}ts.forEachChild(n,visit);}visit(ast);
for(const p of owners)edits.push({start:p,end:p,text:'const {locale}=useLocale();'});
let out=src;for(const e of edits.sort((a,b)=>b.start-a.start))out=out.slice(0,e.start)+e.text+out.slice(e.end);
out=out.replace("import {Localize}","import {Localize,useLocale}");fs.writeFileSync(f,out);
}}
walk('src/app');walk('src/components/study');
