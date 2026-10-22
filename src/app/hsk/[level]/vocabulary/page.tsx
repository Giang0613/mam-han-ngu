import {Localize} from '@/components/i18n/LocaleProvider';
import {notFound} from 'next/navigation';
import {HskVocabularyPage} from '@/components/study/HskVocabulary';
export default async function Page({params}:{params:Promise<{level:string}>}){
 const {level}=await params;if(!/^[1-9]$/.test(level))notFound();
 return <Localize>{<HskVocabularyPage key={level} level={Number(level)}/>}</Localize>;
}
