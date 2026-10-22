import 'server-only';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {getLocale} from '../i18n/server';
import {localizeResource} from '../i18n/resource-server';
import {type MaterialBook,type MaterialPage,type NativeMaterialPage,materialPageId,validMaterialPageId} from './materials-catalog';
export async function readMaterialPage(book:MaterialBook,page:number):Promise<MaterialPage>{
 const id=materialPageId(book,page);if(!validMaterialPageId(id))throw Error('Invalid material page');
 return localizeResource(JSON.parse(await readFile(path.join(process.cwd(),'data','hsk1-materials','pages',`${id}.json`),'utf8')),await getLocale());
}
export async function readNativeMaterialPage(book:MaterialBook,page:number):Promise<NativeMaterialPage>{
 const id=materialPageId(book,page);if(!validMaterialPageId(id))throw Error('Invalid material page');
 return localizeResource(JSON.parse(await readFile(path.join(process.cwd(),'data','hsk1-materials','native',`${id}.json`),'utf8')),await getLocale());
}
