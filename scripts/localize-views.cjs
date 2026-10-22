// One-time codemod: add React localization boundaries without touching values,
// callbacks, IDs or answer keys. Source patches remain reviewable in Git.
const fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
let count=0;
function walk(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){
 const file=path.join(dir,item.name);if(item.isDirectory()){if(!['api','i18n','ui'].includes(item.name))walk(file);continue;}
 if(!file.endsWith('.tsx')||file.endsWith('layout.tsx')||file.endsWith('Brand.tsx'))continue;
 const source=fs.readFileSync(file,'utf8');if(source.includes("import {Localize}"))continue;
 const ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),edits=[];
 function containsJsx(node){return ts.isJsxElement(node)||ts.isJsxSelfClosingElement(node)||ts.isJsxFragment(node)||ts.isParenthesizedExpression(node)&&containsJsx(node.expression)||ts.isConditionalExpression(node)&&(containsJsx(node.whenTrue)||containsJsx(node.whenFalse));}
 function visit(node){if(ts.isReturnStatement(node)&&node.expression&&containsJsx(node.expression)){edits.push({start:node.expression.getStart(ast),end:node.expression.end});return;}ts.forEachChild(node,visit);}visit(ast);
 if(!edits.length)continue;
 let next=source;for(const edit of edits.sort((a,b)=>b.start-a.start))next=next.slice(0,edit.start)+'<Localize>{'+next.slice(edit.start,edit.end)+'}</Localize>'+next.slice(edit.end);
 // User names and their own drafts/messages are never translated.
 next=next.replace(/<(strong|span|p)([^<>]*)>\{(data\.profile\.name|profile\.name|msg\.content|m\.content|turn\.input|turn\.output)\}/g,'<$1$2 translate="no">{$3}');
 const directive=/^(['"]use client['"];?\s*)/;
 const imp="import {Localize} from '@/components/i18n/LocaleProvider';\n";
 next=directive.test(next)?next.replace(directive,'$1'+imp):imp+next;
 fs.writeFileSync(file,next);count++;
}}
walk('src/app');walk('src/components/study');walk('src/components/layout');console.log({localizedViews:count});
