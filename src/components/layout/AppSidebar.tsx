'use client';

import {Localize,useLocale} from '@/components/i18n/LocaleProvider';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { GraduationCap, BookOpen, BookA, Brain, Mic, MessagesSquare, BarChart3, Settings, Menu, X, Flame, ArrowUpRight, Check } from 'lucide-react';
import { useStudyStore } from '@/store/useStudyStore';
import { derive } from '@/lib/study-engine';
import { BrandMark } from './Brand';
import {LanguageSwitch} from '@/components/i18n/LanguageSwitch';
import {streakText,countText} from '@/lib/i18n/counts';

const navigation = [
  { name: 'Học hôm nay', href: '/', icon: GraduationCap, tone: 'mint' },
  { name: 'Lộ trình HSK 3.0', href: '/hsk', icon: GraduationCap, tone: 'blue' },
  { name: 'Ôn tập', href: '/learn', icon: Brain, tone: 'amber' },
  { name: 'Kho ngữ pháp', href: '/grammar', icon: BookOpen, tone: 'blue' },
  { name: 'Từ điển', href: '/dictionary', icon: BookA, tone: 'mint' },
  { name: 'Luyện kỹ năng', href: '/practice', icon: Mic, tone: 'amber' },
  { name: 'Hội thoại', href: '/conversation', icon: MessagesSquare, tone: 'coral' },
  { name: 'Đọc khám phá', href: '/reading', icon: BookOpen, tone: 'blue' },
  { name: 'Tiến độ của tôi', href: '/progress', icon: BarChart3, tone: 'mint' },
];

export function AppSidebar() {
  const {locale}=useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menu = useRef<HTMLButtonElement>(null);
  const { data, ready, loading, error, notice, load, announce } = useStudyStore();
  const stats = derive(data);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => announce(''), 5500);
    return () => clearTimeout(timer);
  }, [notice, announce]);
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false); menu.current?.focus(); } };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [open]);
  const isActive = (href: string) => href === '/'
    ? pathname === '/' || pathname.startsWith('/lesson/') || pathname.startsWith('/curriculum/') || pathname === '/placement'
    : pathname.startsWith(href);

  return <Localize>{<>
    <div className="mobile-bar">
      <Link href="/" className="brand"><span className="brand-mark"><BrandMark /></span><span>Mầm <span className="brand-light">Hán Ngữ</span></span></Link>
      <div className="row"><LanguageSwitch/><button ref={menu} aria-label={open ? 'Đóng menu' : 'Mở menu'} aria-controls="study-navigation" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button></div>
    </div>
    {open && <button className="nav-shade" aria-label="Đóng menu" onClick={() => setOpen(false)} />}
    <aside className={`app-sidebar ${open ? 'is-open' : ''}`}>
      <Link className="brand" href="/" onClick={() => setOpen(false)}><span className="brand-mark"><BrandMark /></span><span>Mầm <span className="brand-light">Hán Ngữ</span><small>MỖI NGÀY, MỘT MẦM MỚI</small></span></Link>
      <nav id="study-navigation" aria-label="Không gian học tập">{navigation.map(item => <Link onClick={() => setOpen(false)} href={item.href} key={item.href} data-tone={item.tone} aria-current={isActive(item.href) ? 'page' : undefined} className={`nav-item ${isActive(item.href) ? 'active' : ''}`}><item.icon size={20} /><span>{item.name}</span>{item.href === '/learn' && stats.due.length > 0 && <span className="nav-count">{stats.due.length}</span>}</Link>)}</nav>
      <div className="nav-footnote"><strong>Học đều. Nhớ lâu.</strong><p>{ready ? (locale==='en'?`${stats.todayCount} / ${countText(data.profile.goal,'activity',locale)} today`:`${stats.todayCount} / ${data.profile.goal} hoạt động hôm nay`) : 'Một hành trình của riêng bạn.'}</p><div className="meter"><span style={{ width: `${Math.min(100, stats.todayCount / data.profile.goal * 100)}%` }} /></div><Link href="/placement" onClick={() => setOpen(false)}>Tìm điểm bắt đầu <ArrowUpRight size={15} /></Link></div>
      <Link href="/settings" onClick={() => setOpen(false)} className="profile-link"><span className="avatar">{data.profile.name.slice(0, 1).toUpperCase()}</span><span><strong translate="no">{locale==="en"&&data.profile.name==="Học viên"?"Learner":data.profile.name}</strong><small>{ready ? `${stats.xp} XP · Hồ sơ cá nhân` : 'Đang kết nối hồ sơ…'}</small></span><Settings size={18} /></Link>
    </aside>
    <div className="topbar"><div className="topbar-breadcrumb"><span className="topbar-dot"/><span>{navigation.find(n => isActive(n.href))?.name || 'Hành trình học tiếng Trung'}</span></div><div className="topbar-right"><LanguageSwitch/><span className="streak"><Flame size={18} />{streakText(stats.streak||0,locale)}</span></div></div>
    {error && <div className="global-alert" role="alert">{error}<button disabled={loading} onClick={() => void load()}>Thử kết nối lại</button></div>}
    {notice && <div className="toast" role="status"><Check size={18} />{notice}<button aria-label="Đóng thông báo" onClick={() => announce('')}><X size={16} /></button></div>}
  </>}</Localize>;
}
