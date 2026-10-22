'use client';
import {Localize} from '@/components/i18n/LocaleProvider';
import Link from 'next/link';
export default function Page(){return <Localize><main className="workspace"><h1>PDF và trang sách không đi kèm</h1><p className="content-note">Bản mã nguồn mở giữ các bài học tự biên soạn. PDF, ảnh sách và đáp án không đi kèm. Kho từ vựng theo bài và thư viện audio vẫn có sẵn.</p><p className="content-note"><Link href="/curriculum/1" className="text-link">Học các bài nền tảng →</Link></p><p className="content-note"><Link href="/hsk/1/audio" className="text-link">Mở thư viện audio →</Link></p><p className="content-note"><Link href="/hsk" className="text-link">Về lộ trình luyện tập →</Link></p></main></Localize>;}
