import {Localize} from '@/components/i18n/LocaleProvider';
import {notFound} from 'next/navigation';
import {Hsk1MaterialsOverview} from '@/components/study/Hsk1Materials';
import {materialLessons} from '@/lib/hsk/materials-catalog';
import {getLocale} from '@/lib/i18n/server';
import {localizeResource} from '@/lib/i18n/resource-server';
export default async function Page({params}:{params:Promise<{level:string}>}){const {level}=await params;if(level!=='1')notFound();return <Localize><Hsk1MaterialsOverview lessons={localizeResource(materialLessons,await getLocale())}/></Localize>}
