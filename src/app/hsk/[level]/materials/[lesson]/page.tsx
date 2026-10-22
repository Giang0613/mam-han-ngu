import {Localize} from '@/components/i18n/LocaleProvider';
import {notFound,redirect} from 'next/navigation';
import {learningMaterialLesson,materialBooks,type MaterialBook} from '@/lib/hsk/materials-catalog';
import {readNativeMaterialPage} from '@/lib/hsk/materials-server';
import {Hsk1MaterialLesson} from '@/components/study/Hsk1Materials';
import {getLocale} from '@/lib/i18n/server';
import {localizeResource} from '@/lib/i18n/resource-server';
export default async function Page({params,searchParams}:{params:Promise<{level:string;lesson:string}>;searchParams:Promise<{book?:string;page?:string}>}){
 const [p,q]=await Promise.all([params,searchParams]);if(p.level!=='1'||!/^\d{1,2}$/.test(p.lesson))notFound();if(Number(p.lesson)===0)redirect('/hsk/1/materials/1');const lesson=learningMaterialLesson(Number(p.lesson));if(!lesson)notFound();
 const book=(q.book||'textbook') as MaterialBook;if(!materialBooks.some(b=>b.id===book)||!lesson.pages[book].length)notFound();const page=q.page?Number(q.page):lesson.pages[book][0];if(!lesson.pages[book].includes(page))notFound();
 return <Localize>{<Hsk1MaterialLesson key={`${book}-${page}`} lesson={localizeResource(lesson,await getLocale())} page={await readNativeMaterialPage(book,page)}/>}</Localize>;
}
