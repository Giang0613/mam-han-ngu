import {Localize} from '@/components/i18n/LocaleProvider';
import {notFound} from 'next/navigation';
import {VocabularyLessonPage} from '@/components/study/HskVocabulary';
import {getLocale} from '@/lib/i18n/server';
import {localizeResource} from '@/lib/i18n/resource-server';
import {vocabularyCorpus,vocabularyLesson,vocabularyWords,vocabularyLessonExercises} from '@/lib/hsk/vocabulary-server';
export default async function Page({params}:{params:Promise<{level:string;lesson:string}>}){
 const p=await params;if(!/^[1-9]$/.test(p.level))notFound();
 const l=vocabularyLesson(p.lesson);if(!l||l.level!==Number(p.level))notFound();
 const next=vocabularyCorpus().lessons.find(x=>x.level===l.level&&x.sequence===l.sequence+1);
 const props=localizeResource({lesson:l,words:vocabularyWords(l),exercises:vocabularyLessonExercises(l),next:next&&{id:next.id,title:next.title,level:next.level}},await getLocale());
 return <Localize><VocabularyLessonPage key={l.id} {...props}/></Localize>;
}
