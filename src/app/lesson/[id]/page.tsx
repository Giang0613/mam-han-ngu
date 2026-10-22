import {Localize} from '@/components/i18n/LocaleProvider';
import {notFound} from 'next/navigation';import {lessonById} from '@/lib/course';import {LessonPage} from '@/components/study/Lesson';
export default async function Page({params}:{params:Promise<{id:string}>}){const raw=(await params).id,id=/^\d+$/.test(raw)?`l${raw.padStart(2,'0')}`:raw;if(!lessonById[id])notFound();return <Localize>{<LessonPage lessonId={id}/>}</Localize>}
