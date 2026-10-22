import {Localize} from '@/components/i18n/LocaleProvider';
import {notFound} from 'next/navigation';import {grammarById} from '@/lib/course';import {GrammarPractice} from '@/components/study/GrammarPractice';
export default async function Page({params}:{params:Promise<{id:string}>}){const id=(await params).id;if(!grammarById[id])notFound();return <Localize>{<GrammarPractice id={id}/>}</Localize>}
