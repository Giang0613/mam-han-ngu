import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import {grammar,lessons,words,levels,exercises,placementExercises,scenarios} from '../src/lib/course';
import {stories} from '../src/lib/reading-data';
import {hskModules,hskTasks,hskLevels,hskExercises} from '../src/lib/hsk/catalog';
const literals=new Set<string>();
const templates=new Set<string>();
function walk(dir:string){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,e.name);if(e.isDirectory())walk(file);else if(file.endsWith('.tsx')){
const ast=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
function visit(n:ts.Node){if(ts.isJsxText(n)||ts.isStringLiteral(n)||ts.isNoSubstitutionTemplateLiteral(n)){const value=n.text.replace(/\s+/g,' ').trim();if(/[đĐăĂâÂêÊôÔơƠưƯ\u1ea0-\u1ef9]/u.test(value))literals.add(value);}if(ts.isTemplateExpression(n)){let s=n.head.text;n.templateSpans.forEach((part,i)=>{s+=`{${i}}`+part.literal.text});if(/[đĐăĂâÂêÊôÔơƠưƯ\u1ea0-\u1ef9]/u.test(s))templates.add(s);}ts.forEachChild(n,visit)}visit(ast);
}}}
walk('src/app');walk('src/components');
const output={literals:[...literals].sort(),templates:[...templates].sort(),grammar,lessons,words,levels,exercises,placementExercises,scenarios,stories,hskModules,hskTasks,hskLevels,hskExercises};
const destination=process.argv[2];fs.writeFileSync(destination,JSON.stringify(output,null,2));console.log(JSON.stringify({literals:literals.size,templates:templates.size,grammar:grammar.length,words:words.length,hskModules:hskModules.length,destination}));
