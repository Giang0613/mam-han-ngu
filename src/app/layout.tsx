import type { Metadata } from "next";
import localFont from 'next/font/local';
import "./globals.css";
import './study-theme.css';
import './garden-theme.css';
import './book-audio.css';
import { AppSidebar } from "@/components/layout/AppSidebar";
import {LocaleProvider} from '@/components/i18n/LocaleProvider';
import {getLocale} from '@/lib/i18n/server';
import {translate} from '@/lib/i18n/translate';

const manrope = localFont({ src: '../../public/fonts/Manrope-Variable.ttf', variable: '--font-manrope', weight: '200 800', display: 'swap' });

export async function generateMetadata():Promise<Metadata>{
 const locale=await getLocale();
 return {title:translate('Mầm Hán Ngữ · Tiếng Trung mỗi ngày',locale),description:translate('Học tiếng Trung bằng tiếng Việt: bài học, ngữ pháp, nghe nói, tập viết và ôn tập cá nhân.',locale),icons:{icon:'/icon.svg'}};
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale=await getLocale();
  return (
    <html lang={locale} data-theme="light" className={manrope.variable}>
      <body>
        <LocaleProvider initialLocale={locale}>
        <a href="#main-content" className="skip-link">{translate('Đến nội dung học',locale)}</a>
        <div className="app-shell">
          <AppSidebar />
          <div className="app-content" id="main-content" tabIndex={-1}>
            {children}
          </div>
        </div>
        </LocaleProvider>
      </body>
    </html>
  );
}
