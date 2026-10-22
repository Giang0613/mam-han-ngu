import {Localize} from '@/components/i18n/LocaleProvider';
import {notFound} from 'next/navigation';
import {hskModules} from '@/lib/hsk/catalog';
import {HskModulePage} from '@/components/study/Hsk';
export default async function Page({params}:{params:Promise<{level:string;unit:string}>}){const p=await params;if(!/^[1-9]$/.test(p.level))notFound();const u=hskModules.find(x=>x.level===Number(p.level)&&x.key===p.unit);if(!u)notFound();return <Localize>{<HskModulePage id={u.id}/>}</Localize>;}
