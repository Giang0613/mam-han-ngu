import {Localize} from '@/components/i18n/LocaleProvider';
import { DictionaryPage } from '@/components/study/Dictionary';

export default async function Page({searchParams}:{searchParams:Promise<{q?:string|string[];level?:string;scope?:string}>}) {
  const params = await searchParams;
  const q = typeof params.q === 'string' ? params.q.slice(0,120) : '';
  const level=params.level&&/^(?:[1-9]|79)$/.test(params.level)?params.level:'all';
  return <Localize>{<DictionaryPage key={`${q}-${level}`} initialQuery={q} initialLevel={level}/>}</Localize>;
}
