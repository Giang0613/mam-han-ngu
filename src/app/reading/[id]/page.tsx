import {Localize} from '@/components/i18n/LocaleProvider';
import {notFound} from 'next/navigation';import {stories} from '@/lib/reading-data';import {Reader} from '@/components/study/Reader';
export default async function Page({params}:{params:Promise<{id:string}>}){const id=(await params).id;if(!stories.some(s=>s.id===id))notFound();return <Localize>{<Reader id={id}/>}</Localize>}
