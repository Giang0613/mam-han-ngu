'use client';
import {Localize} from '@/components/i18n/LocaleProvider';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function NotFound() {
  return <Localize>{<main className="workspace"><section className="empty-state not-found"><span lang="zh-Hans" className="empty-hanzi">找</span><span className="study-label">Trang này chưa có</span><h1>Quay lại hành trình học nhé.</h1><p>Đường dẫn có thể đã thay đổi. Bài học, từ vựng và các thẻ ôn của bạn vẫn ở trang học.</p><Link href="/" className="button-link">Về trang học <ArrowRight size={17} /></Link></section></main>}</Localize>;
}
