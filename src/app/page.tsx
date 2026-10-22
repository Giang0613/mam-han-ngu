'use client';

import {Localize,useLocale} from '@/components/i18n/LocaleProvider';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, BookOpen, Headphones, PenLine, Flame, Clock3, CheckCircle2, MessagesSquare } from 'lucide-react';
import { useStudyStore } from '@/store/useStudyStore';
import { derive, progressPercent } from '@/lib/study-engine';
import { grammar } from '@/lib/course';
import {hskLevels,hskLevelModules,hskModules} from '@/lib/hsk/catalog';
import {hskProgress} from '@/lib/hsk/progress';
import { AudioButton } from '@/components/study/common';
import {LearningGarden} from '@/components/layout/LearningGarden';
import {countText,dueText,reviewTitle,goalRemaining} from '@/lib/i18n/counts';

const practicePicks = [
  { href: '/pinyin', label: 'Pinyin & thanh điệu', note: 'Nghe đúng, nói rõ hơn', icon: Headphones, tone: 'blue' },
  { href: '/practice', label: 'Viết những nét đầu tiên', note: 'Xem mẫu và tự viết', icon: PenLine, tone: 'amber' },
  { href: '/conversation', label: 'Thử một cuộc trò chuyện', note: 'Tình huống đời thường', icon: MessagesSquare, tone: 'coral' },
];


export default function Home() {
  const { data, ready } = useStudyStore();
  const {locale}=useLocale();
  const greeting=locale==='en'?(ready&&data.profile.name!=='Học viên'?`Hi, ${data.profile.name}.`:'Hi there.'):`Chào ${ready?data.profile.name:'bạn'}.`;
  const stats = derive(data);
  const hsk=hskProgress(data), current=hsk.next;
  const recommendation=stats.due.length?{...stats.recommendation,title:reviewTitle(stats.due.length,locale)}:{href:`/hsk/${current.level}/${current.key}`,title:current.title,reason:current.goal};
  const dueCard = stats.due[0];
  const preview = dueCard ? {zh: dueCard.hanzi, pinyin: dueCard.pinyin, vi: dueCard.meaning}
    : {zh:'学习',pinyin:'xuéxí',vi:'học tập'};
  const percent = progressPercent(stats.todayCount, data.profile.goal);

  return <Localize>{<main className="workspace home-workspace">
    <div className="study-focus-grid">
      <section className="study-hero garden-hero" aria-labelledby="garden-title">
        <div className="garden-paper" aria-hidden="true"/>
        <div className="study-hero-copy">
          <div className="garden-welcome"><span className="garden-welcome-dot"/><span translate="no">{greeting}</span><span className="garden-welcome-divider"/><span>Mỗi ngày, một khám phá</span></div>
          <h1 id="garden-title"><span>Một chữ hôm nay.</span><em>Một thế giới ngày mai.</em></h1>
          <p className="garden-introduction">Hôm nay, học một chút. Ngày mai, nói tự tin hơn.</p>
          <div className="garden-next"><span className="study-label">{stats.due.length ? 'Đã đến lúc ôn lại' : `Phần luyện tiếp theo · HSK ${current.level}`}</span><h2 id="next-lesson-title">{recommendation.title}</h2></div>
          <div className="study-hero-actions">
            <Link href={recommendation.href} className="button-link">{stats.due.length ? 'Ôn tập ngay' : 'Tiếp tục học'} <ArrowRight size={18} /></Link>
            <span className="study-duration"><Clock3 size={16} /> {dueCard ? dueText(stats.due.length,locale) : countText(current.exercises.length,'question',locale)}</span>
          </div>
        </div>
        <div className="garden-art"><span className="garden-seal" aria-hidden="true" lang="zh-Hans" translate="no">汉<br/>语</span><LearningGarden/></div>
        <div className="garden-footer"><span className="garden-chapter"><b>{String(current.level).padStart(2,'0')}</b><span>Lộ trình hiện tại<strong>HSK {current.level}</strong></span></span><Link href="/placement" className="text-link">Tìm điểm bắt đầu <ArrowUpRight size={15}/></Link><span className="garden-signature" lang="zh-Hans" translate="no" aria-hidden="true">每天一点，慢慢成长。</span></div>
      </section>
    </div>

    <section className="study-stat-strip" aria-label="Tiến độ học tập">
      <section className="daily-goal" aria-label="Mục tiêu hôm nay">
        <div className="daily-ring" style={{ '--value': `${percent}%` } as React.CSSProperties}>
          <div><Flame size={21}/></div>
        </div>
        <div className="daily-goal-copy"><h3>Mục tiêu hôm nay</h3><p>{stats.todayCount}<span> / {data.profile.goal}</span><small>hoạt động</small></p><Link href="/settings" className="text-link">Điều chỉnh mục tiêu <ArrowUpRight size={12} /></Link></div>
        <span className="sr-only">{stats.todayCount >= data.profile.goal ? 'Bạn đã đạt mục tiêu hôm nay.' : goalRemaining(data.profile.goal - stats.todayCount,locale)}</span>
      </section>
      {[{ value: hskModules.filter(u=>u.exercises.length&&u.exercises.every(e=>hsk.passed.has(e.id))).length, label: 'Phần HSK đã luyện' }, { value: data.cards.length, label: 'Từ đã lưu' }, { value: stats.xp, label: 'Điểm XP' }, { value: stats.due.length, label: 'Thẻ đến hạn' }].map(s => <div key={s.label}><strong>{ready ? s.value : <span className="skeleton-number" />}</strong><span>{s.label}</span></div>)}
      <Link href="/progress" className="text-link" aria-label="Xem tiến bộ">Tiến độ <ArrowUpRight size={17} /></Link>
    </section>

    <div className="study-content-grid">
      <section aria-labelledby="course-path-title">
        <div className="section-heading"><h2 id="course-path-title">Lộ trình HSK 3.0</h2><Link href="/hsk" className="text-link">9 bậc học <ArrowUpRight size={15}/></Link></div>
        <div className="course-path">
          {hskLevels.map(l => {
            const items=hskLevelModules(l.level).flatMap(u=>u.exercises),complete=items.filter(e=>hsk.passed.has(e.id)).length;
            return <Link href={`/hsk/${l.level}`} key={l.level} data-tone={l.tone} className={`path-stage ${l.level === current.level ? 'current' : ''}`}>
              <span className="path-calligraphy" lang="zh-Hans" translate="no" aria-hidden="true">{['启','行','言','通','达','思','研','论','融'][l.level-1]}</span>
              <span className="path-glyph hsk-path-number">{l.level}</span>
              <div className="path-copy"><span className="path-meta">HSK {l.level} · {l.band}</span><h3>{l.title}</h3><p>{l.topics.join(' · ')}</p><span className="path-completion">{items.length>0&&complete===items.length?<><CheckCircle2 size={14}/> Đã luyện hết câu tự chấm</>:`${complete}/${items.length} câu đúng độc lập`}</span></div>
              <ArrowUpRight size={18} className="path-arrow" />
            </Link>;
          })}
        </div>
        <p className="content-note">HSK 7–9 thi chung để phân bậc. Bài luyện tự biên soạn, có hướng dẫn và giải thích; chưa bao phủ toàn bộ đề cương và không quy đổi thành điểm thi. <Link href="/curriculum/1">Mở lại các bài nền tảng trước đây.</Link></p>
      </section>

      <aside className="study-tools">
        <article className="hero-vocabulary" aria-label={dueCard ? 'Từ vựng trong hàng đợi ôn' : 'Từ gợi ý để khởi động'}>
          <span className="vocabulary-seal" lang="zh-Hans" translate="no" aria-hidden="true">词</span>
          <div className="row-between"><span className="study-label">{dueCard ? 'Một từ cần ôn' : 'Một từ để khởi động'}</span><AudioButton text={preview.zh} label={`Nghe ${preview.zh}`} compact /></div>
          <strong lang="zh-Hans">{preview.zh}</strong>
          {!!data.profile.pinyin && <span className="pinyin" lang="zh-Latn" translate="no">{preview.pinyin}</span>}
          <p>{preview.vi}</p>
          <Link href={`/dictionary?q=${encodeURIComponent(preview.zh)}`} className="text-link">Khám phá từ <ArrowUpRight size={14} /></Link>
        </article>
        <section className="practice-picks"><h2>Luyện thêm một chút</h2>{practicePicks.map(p => <Link href={p.href} key={p.href} data-tone={p.tone}><span className="pick-icon"><p.icon size={21} /></span><div><strong>{p.label}</strong><small>{p.note}</small></div><ArrowUpRight size={16} /></Link>)}</section>
        <section className="library-feature"><BookOpen size={23} /><h3>Từ câu đầu tiên<br />đến ý tưởng của bạn.</h3><p>{grammar.length} điểm ngữ pháp, giải thích bằng tiếng Việt và ví dụ để luyện ngay.</p><Link href="/grammar" className="text-link">Mở kho ngữ pháp <ArrowRight size={16} /></Link></section>
      </aside>
    </div>
  </main>}</Localize>;
}
