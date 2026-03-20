'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HomeClient({ portfolio }) {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      const reveals = document.querySelectorAll('.reveal');
      reveals.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.9) el.classList.add('active');
      });
    };

    window.addEventListener('scroll', handleScroll);
    setTimeout(() => {
       handleScroll();
       document.querySelectorAll('.hero-section .reveal').forEach(el => el.classList.add('active'));
    }, 150);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  if (!portfolio || !mounted) return <div style={{ minHeight: '100vh', background: 'var(--bg)' }} />;

  const settings = portfolio.portfolio;
  const featuredProjects = portfolio.projects.slice(0, 4);

  return (
    <div className={`page-shell ${isMenuOpen ? 'menu-open' : ''}`}>
      <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="brand-block">
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="brand-avatar">م</div>
            <div className="brand-info">
              <strong>{settings.brandName}</strong>
              <span className="brand-kicker">{settings.heroPrefix}</span>
            </div>
          </Link>
        </div>

        <nav className={`top-nav ${isMenuOpen ? 'open' : ''}`}>
          <Link href="/" onClick={() => setIsMenuOpen(false)}>الرئيسية</Link>
          <Link href="/#about" onClick={() => setIsMenuOpen(false)}>عني</Link>
          <Link href="/projects" onClick={() => setIsMenuOpen(false)}>المشاريع</Link>
          <Link href="/contact" onClick={() => setIsMenuOpen(false)}>التواصل</Link>
          <div className="mobile-only-cv" style={{ display: 'none' }}>
             <a href="/cv-mohammed-mustafa.pdf" download className="btn-primary">تحميل الـ CV</a>
          </div>
        </nav>

        <div className="nav-actions">
          <button onClick={toggleTheme} className="theme-toggle">{theme === 'light' ? '🌙' : '☀️'}</button>
          <a href="/cv-mohammed-mustafa.pdf" download className="nav-cv-btn">تحميل الـ CV</a>
          <button className={`mobile-menu-toggle ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </header>

      <div className="hero-section">
        <div className="hero-badge reveal stagger-1">متاح للعمل الحر</div>
        <h1 className="reveal stagger-2">{settings.heroPrefix} <br /><span className="hero-highlight">{settings.heroHighlight}</span></h1>
        <p className="hero-bio reveal stagger-3">{settings.bio}</p>
        <div className="hero-actions reveal stagger-4">
          <Link href="/projects" className="btn-primary">استكشف أعمالي</Link>
          <a href="/cv-mohammed-mustafa.pdf" download className="btn-outline">تحميل الـ CV</a>
        </div>
      </div>

      <section id="projects">
        <div className="section-header reveal">
          <h2>مشاريع مختارة</h2>
          <Link href="/projects">عرض الكل ←</Link>
        </div>
        <div className="projects-grid">
          {featuredProjects.map((project, idx) => (
            <a 
              key={project.id} 
              href={`https://${project.domain || project.id}`} 
              target="_blank" 
              className={`project-card reveal stagger-${(idx % 4) + 1}`}
              style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
            >
              <div className="project-preview"><div style={{ padding: '20px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>إضغط للمشاهدة</div></div>
              <div className="project-body">
                <h3>{project.name}</h3>
                <p>{project.description || 'مشروع ويب متطور تم بناؤه باستخدام تقنيات حديثة.'}</p>
                <div className="project-footer">
                  <span className="project-link">زيارة الموقع ↑</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      <footer className="site-footer reveal">
        <div>© 2026 {settings.brandName} — جميع الحقوق محفوظة</div>
      </footer>
    </div>
  );
}
