import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const flag=process.argv.indexOf('--output');
if(flag<0||!process.argv[flag+1])throw Error('Usage: node scripts/export-open-source.mjs --output <new-absolute-directory>');
const output=process.argv[flag+1];
if(!path.isAbsolute(output))throw Error('The output path must be absolute.');
const destination=path.resolve(output);
const relative=path.relative(root,destination);
if(!relative||!relative.startsWith('..')&&!path.isAbsolute(relative))throw Error('Export outside the private checkout.');
// Never replace a directory: an existing destination may contain user work.
await fs.mkdir(destination,{recursive:false});
const files=[];
async function write(name,content){
 const target=path.join(destination,name);
 await fs.mkdir(path.dirname(target),{recursive:true});
 await fs.writeFile(target,content);
 files.push({path:name.replaceAll('\\','/'),sha256:createHash('sha256').update(content).digest('hex')});
}
const privateJson=new Set(['material-answer-keys.json','material-answer-layout.json','material-audio-index.json','material-audio-placement.json','workbook-audio-clips.json','vocabulary-summary.json']);
function allowed(name){
 if(name.startsWith('public/hsk1-materials/')||name==='src/components/study/Hsk1Materials.tsx')return false;
 if(name==='src/app/favicon.ico')return true;
 if(name.startsWith('src/lib/hsk/')&&privateJson.has(path.posix.basename(name)))return false;
 return true;
}
function transform(name,text){
 if(name==='src/lib/edition.ts')return 'export const HAS_IMPORTED_MATERIALS = false;\n';
 if(name==='src/lib/hsk/materials-catalog.ts'){
  text=text.replace("import audioIndex from './material-audio-index.json';",'const audioIndex: MaterialAudio[] = [];');
  text=text.replace("import audioPlacement from './material-audio-placement.json';",'const audioPlacement: {audioId:string;pageId:string;blockId:string}[] = [];');
  text=text.replace(/const titles=\[[\s\S]*?\n\];/,'const titles:string[][]=[];');
  text=text.replace(/const speakerNames:Record<string,string>=\{[^\n]*\};/, 'const speakerNames:Record<string,string>={};');
  if(text.includes('AI小语')||text.includes("import audioIndex"))throw Error('Unexpected materials catalog format; review exporter.');
 }
 if(name==='src/lib/hsk/material-grading.ts')text=text.replace("import answerKeys from './material-answer-keys.json';",'const answerKeys: Record<string, MaterialAnswerKey> = {};');
 if(name==='src/lib/hsk/workbook-audio.ts')text=text.replace("import clips from './workbook-audio-clips.json';",'const clips: WorkbookAudioClip[] = [];');
 if(name==='src/lib/hsk/material-answer-layout.ts')return "import type {NativeMaterialBlock} from './materials-catalog';\nexport function materialAnswerLayout(block:NativeMaterialBlock,_pageId:string){return block;}\n";
 return text;
}
const unavailable=`'use client';
import {Localize} from '@/components/i18n/LocaleProvider';
import Link from 'next/link';
export default function Page(){return <Localize><main className="workspace"><h1>Học liệu sách không đi kèm bản cộng đồng</h1><p className="content-note">Bản mã nguồn mở giữ các bài học tự biên soạn. PDF, bản dịch, đáp án và audio của sách được tách riêng để giữ quyền của tác giả.</p><p className="content-note"><Link href="/curriculum/1" className="text-link">Học các bài nền tảng →</Link></p><p className="content-note"><Link href="/hsk" className="text-link">Về lộ trình luyện tập →</Link></p></main></Localize>;}
`;
async function tree(dir){
 for(const entry of await fs.readdir(path.join(root,dir),{withFileTypes:true})){
  if(entry.isSymbolicLink())throw Error(`Refusing a symbolic link: ${dir}/${entry.name}`);
  const name=`${dir}/${entry.name}`;
  if(!allowed(name))continue;
  if(entry.isDirectory()){await tree(name);continue;}
  if(name==='src/app/hsk/[level]/materials/page.tsx'||name==='src/app/hsk/[level]/materials/[lesson]/page.tsx'){await write(name,unavailable);continue;}
  const source=await fs.readFile(path.join(root,name));
  if(/\.(tsx?|js|mjs|json|html|css|svg)$/.test(name))await write(name,transform(name,source.toString('utf8')));
  else await write(name,source);
 }
}
await tree('src');
// Copy only explicitly selected public assets, never the private materials tree.
for(const dir of ['public/fonts','public/hanzi'])await tree(dir);
for(const name of ['public/icon.svg','public/icon-192.png','public/icon-512.png','public/manifest.webmanifest','public/offline.html','public/offline-course.json','public/study-sw.js'])await write(name,await fs.readFile(path.join(root,name)));
for(const name of ['.gitignore','.gitattributes','AGENTS.md','next.config.ts','tsconfig.json','postcss.config.mjs','eslint.config.mjs','components.json','LICENSE','THIRD_PARTY_NOTICES.md','CONTRIBUTING.md','SECURITY.md','.github/workflows/ci.yml'])await write(name,await fs.readFile(path.join(root,name)));
const env=await fs.readFile(path.join(root,'.env.example'),'utf8');
if(env.split(/\r?\n/).some(line=>/^\s*[A-Z_][A-Z0-9_]*\s*=\s*\S/.test(line)))throw Error('.env.example must contain only empty values.');
await write('.env.example',env);
const communityReadme=await fs.readFile(path.join(root,'docs/COMMUNITY_README.en.md'),'utf8');
await write('README.md',communityReadme.replaceAll('](../','](').replace('](LOCALIZATION.md)','](docs/LOCALIZATION.md)'));
await write('docs/OPEN_SOURCE.md',await fs.readFile(path.join(root,'docs/OPEN_SOURCE.md')));
await write('docs/VERIFICATION.md',await fs.readFile(path.join(root,'docs/VERIFICATION.md')));
await write('docs/COMMUNITY_README.en.md',communityReadme);
await write('docs/LOCALIZATION.md',await fs.readFile(path.join(root,'docs/LOCALIZATION.md')));
await write('docs/INTERFACE.md',await fs.readFile(path.join(root,'docs/INTERFACE.md')));
await write('docs/three-LICENSE.txt',await fs.readFile(path.join(root,'docs/three-LICENSE.txt')));
await write('docs/images/study-garden.png',await fs.readFile(path.join(root,'docs/images/study-garden.png')));
await write('docs/COMMUNITY_README.md',await fs.readFile(path.join(root,'docs/COMMUNITY_README.md')));
await tree('docs/mandarin-audio-licenses');
for(const name of ['cedict.json','cedict-meta.json','cedict-source.txt'])await write('data/'+name,await fs.readFile(path.join(root,'data',name)));
for(const name of ['hsk-vocabulary.json','hsk-vocabulary-lessons.json','hsk-vocabulary-sources.json'])await write('data/'+name,'[]\n');
await write('src/lib/hsk/vocabulary-summary.json',JSON.stringify({total:0,advanced:0,lessons:0,levels:Array.from({length:9},(_,i)=>({level:i+1,words:0,lessons:0}))},null,2)+'\n');
const scripts=['build.mjs','start.mjs','migrate-study.mjs','import-cedict.mjs','prepare-offline.ts','prepare-strokes.ts','setup-mandarin-audio.py','mandarin-audio.py','mandarin-neural-worker.py','mandarin-requirements.txt','mandarin-requirements-lock.txt','verify-study.ts','verify-hsk.ts','verify-api.mjs','verify-chinese-reading.ts','verify-speech-quality.ts','verify-speech-reading.ts','export-open-source.mjs','verify-community.mjs','compile-english.ts','verify-i18n.ts','verify-english-ui.ts','verify-i18n-api.mjs','verify-dictionary-format.ts'];
for(const name of scripts)await write('scripts/'+name,await fs.readFile(path.join(root,'scripts',name)));
const pkg=JSON.parse(await fs.readFile(path.join(root,'package.json'),'utf8'));
pkg.scripts={dev:pkg.scripts.dev,build:pkg.scripts.build,start:pkg.scripts.start,'db:migrate':pkg.scripts['db:migrate'],'test:study':pkg.scripts['test:study'],'test:hsk':pkg.scripts['test:hsk'],'build:i18n':pkg.scripts['build:i18n'],'test:i18n':pkg.scripts['test:i18n'],'test:english-ui':pkg.scripts['test:english-ui'],'test:i18n-api':pkg.scripts['test:i18n-api'],'test:dictionary-format':pkg.scripts['test:dictionary-format'],'test:source':'node scripts/verify-community.mjs','test:api':pkg.scripts['test:api'],'test:speech':pkg.scripts['test:speech'],'test:speech-reading':pkg.scripts['test:speech-reading']};
await write('package.json',JSON.stringify(pkg,null,2)+'\n');
await write('package-lock.json',await fs.readFile(path.join(root,'package-lock.json')));
const excluded=['.git history and remotes','.env.* except empty .env.example','local.db and WAL files','node_modules and .next*','.cache, Python environments and recordings','data/hsk1-materials/**','public/hsk1-materials/**','PDF-derived vocabulary and translations including data/i18n-private.en.json','publisher answer keys, audio indices and editorial scripts'];
for(const {path:name} of files){
 if(/(^|\/)(?:\.git|node_modules|\.cache|__pycache__)(\/|$)|\.db(?:-|$)|\.pdf$|\.mp3$|\.pyc$|\.env\.(?!example$)/i.test(name))throw Error(`Unexpected private file in export: ${name}`);
}
await fs.writeFile(path.join(destination,'EXPORT-MANIFEST.json'),JSON.stringify({product:'Mầm Hán Ngữ',edition:'community',createdAt:new Date().toISOString(),codeLicense:'MIT',thirdPartyNotice:'THIRD_PARTY_NOTICES.md',excluded,transformations:['Disable personal textbook pages with an explanatory page','Replace PDF-derived vocabulary with empty schemas','Remove publisher answer keys and audio indices','Keep original course, CC-CEDICT attribution, Hanzi data license and font license','Preserve storage IDs for migration compatibility'],files:files.sort((a,b)=>a.path.localeCompare(b.path))},null,2)+'\n');
console.log(JSON.stringify({destination,files:files.length,manifest:'EXPORT-MANIFEST.json',privateLearnerDataIncluded:false},null,2));
