'use client';
import {Localize} from '@/components/i18n/LocaleProvider';
import Link from 'next/link';
export default function Page(){return <Localize><main className="workspace"><h1>Học liệu sách không đi kèm bản cộng đồng</h1><p className="content-note">Bản mã nguồn mở giữ các bài học tự biên soạn. PDF, bản dịch, đáp án và audio của sách được tách riêng để giữ quyền của tác giả.</p><p className="content-note"><Link href="/curriculum/1" className="text-link">Học các bài nền tảng →</Link></p><p className="content-note"><Link href="/hsk" className="text-link">Về lộ trình luyện tập →</Link></p></main></Localize>;}
