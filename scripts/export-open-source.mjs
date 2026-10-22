import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const flag=process.argv.indexOf('--output');
if(flag<0||!process.argv[flag+1])throw Error('Usage: node scripts/export-open-source.mjs --output <new-absolute-directory>');
const destination=path.resolve(process.argv[flag+1]);
if(!path.isAbsolute(process.argv[flag+1]))throw Error('Use an absolute output path.');
const relative=path.relative(root,destination);
if(!relative||!relative.startsWith('..')&&!path.isAbsolute(relative))throw Error('Export outside the source checkout.');
await fs.mkdir(destination,{recursive:false});
const files=[];
const privatePath=/(^|\/)(?:\.git|node_modules|\.cache|__pycache__|recordings)(\/|$)|(?:^|\/)\.env(?!\.example$)|\.(?:db|sqlite|sqlite3)(?:-|$)|\.(?:pem|key|p12|pfx|pyc|log|tsbuildinfo)$/i;
const renamed={'data/i18n-private.en.json':'data/materials.en.json','data/i18n-private-overrides.en.json':'data/materials-overrides.en.json'};
const names=new Set();
async function copy(name){
 if(privatePath.test(name))return;
 const targetName=renamed[name]||name;
 // Prefer an explicitly maintained published catalog if both variants exist.
 if(names.has(targetName))return;
 let data=await fs.readFile(path.join(root,name));
 if(/\.(?:tsx?|[cm]?js|json|md|txt|tsv|py|ya?ml|css|svg|html|webmanifest)$/.test(name))data=Buffer.from(data.toString('utf8').replace(/C:[\/\\]Users[\/\\][^\/\\\r\n"']+[\/\\]Downloads/g,'./source-materials'));
 if(targetName==='.env.example'&&data.toString().split(/\r?\n/).some(line=>/^\s*[A-Z_][A-Z0-9_]*\s*=\s*\S/.test(line)))throw Error('Environment example contains a value.');
 const output=path.join(destination,targetName);
 await fs.mkdir(path.dirname(output),{recursive:true});
 await fs.writeFile(output,data);
 names.add(targetName);
 files.push({path:targetName,sha256:createHash('sha256').update(data).digest('hex')});
}
async function tree(directory){
 for(const entry of await fs.readdir(path.join(root,directory),{withFileTypes:true})){
  const name=directory+'/'+entry.name;
  if(entry.isSymbolicLink())throw Error('Refusing a symbolic link: '+name);
  if(privatePath.test(name))continue;
  if(entry.isDirectory())await tree(name);else await copy(name);
 }
}
for(const directory of ['src','public','data','docs','scripts','.github'])await tree(directory);
for(const name of ['.gitignore','.gitattributes','.env.example','AGENTS.md','CLAUDE.md','drizzle.config.ts','next.config.ts','tsconfig.json','postcss.config.mjs','eslint.config.mjs','components.json','LICENSE','THIRD_PARTY_NOTICES.md','CONTRIBUTING.md','SECURITY.md','CREDITS.md','package.json','package-lock.json'])await copy(name);
const readJson=async name=>JSON.parse(await fs.readFile(path.join(destination,name),'utf8'));
const template=await fs.readFile(path.join(root,'docs/COMMUNITY_README.en.md'),'utf8');
const readme=Buffer.from(template.replaceAll('](../','](').replace('](LOCALIZATION.md)','](docs/LOCALIZATION.md)'));
await fs.writeFile(path.join(destination,'README.md'),readme);
files.push({path:'README.md',sha256:createHash('sha256').update(readme).digest('hex')});
const manifest={product:'Mầm Hán Ngữ',edition:'community',createdAt:new Date().toISOString(),codeLicense:'MIT',thirdPartyNotice:'THIRD_PARTY_NOTICES.md',hsk30Credit:'Cre:Thompson HSK 3.0',excluded:['private Git history and remotes','filled .env files and credentials','learner databases, personal recordings and caches','node_modules, generated Next output and downloaded model environments'],transformations:['Include all maintained source, supplied HSK books, scans, OCR, translations, answers, vocabulary lessons and audio','Rename book translation catalogs to materials.en.json and materials-overrides.en.json','Replace machine-specific import paths with a portable source-materials directory','Preserve source attribution, learner storage IDs and original book/audio bytes'],resources:{vocabularyEntries:(await readJson('data/hsk-vocabulary.json')).length,vocabularyLessons:(await readJson('data/hsk-vocabulary-lessons.json')).length,audioFiles:files.filter(f=>f.path.endsWith('.mp3')).length,bookPdfs:files.filter(f=>/^public\/hsk1-materials\/[^/]+\.pdf$/.test(f.path)).length,publisherReferencePdfs:files.filter(f=>/^public\/hsk1-materials\/reference\/[^/]+\.pdf$/.test(f.path)).length,bookPageImages:files.filter(f=>f.path.startsWith('public/hsk1-materials/pages/')&&f.path.endsWith('.webp')).length},files:files.sort((a,b)=>a.path.localeCompare(b.path))};
await fs.writeFile(path.join(destination,'EXPORT-MANIFEST.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({destination,files:files.length,resources:manifest.resources,personalDataIncluded:false}));
