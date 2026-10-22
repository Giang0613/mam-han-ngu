import {getLocale} from './server';
import {localizeResource} from './resource-server';
export async function localizedJson(data:unknown,status=200){return Response.json(localizeResource(data,await getLocale()),{status,headers:{'Cache-Control':'private, no-store','Vary':'Cookie'}});}
