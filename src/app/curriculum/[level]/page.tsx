import {Localize} from '@/components/i18n/LocaleProvider';
import {notFound} from 'next/navigation';import {levels} from '@/lib/course';import {CurriculumPage} from '@/components/study/Curriculum';
export default async function Page({params}:{params:Promise<{level:string}>}){const level=Number((await params).level);if(!levels.some(l=>l.id===level))notFound();return <Localize>{<CurriculumPage level={level}/>}</Localize>}
