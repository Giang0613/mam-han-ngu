import {Localize} from '@/components/i18n/LocaleProvider';
import {PracticePage} from '@/components/study/Practice';
export default async function Page({searchParams}:{searchParams:Promise<{char?:string;mode?:string}>}){const query=await searchParams;const char=query.char&&[...query.char].find(c=>/\p{Script=Han}/u.test(c));return <Localize>{<PracticePage character={char||'你'} mode={query.mode==='speaking'?'speaking':'writing'}/>}</Localize>}
