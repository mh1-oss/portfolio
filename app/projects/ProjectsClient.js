'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ProjectsClient({ portfolio }) {
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
    setTimeout(handleScroll, 150);
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

  return (
    <div className="page-shell">
      {/* Header */}
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
        </nav>

        <div className="nav-actions">
           <button onClick={toggleTheme} className="theme-toggle" title="تبديل الوضع">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <a href="/cv-mohammed-mustafa.pdf" download className="nav-cv-btn">تحميل الـ CV</a>
          <button className={`mobile-menu-toggle ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </header>

      <main style={{ padding: '60px 0' }}>
        <div className="section-header reveal active" style={{ paddingTop: 0 }}>
          <Link href="/" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>← العودة للرئيسية</Link>
          <h1 style={{ fontFamily: 'Cairo, sans-serif', fontSize: '2.8rem' }}>جميع المشاريع</h1>
        </div>

        <div className="projects-grid">
          {portfolio.projects.map((project, idx) => (
            <div key={project.id} className={`project-card reveal stagger-${(idx % 4) + 1}`}>
              <div className="project-preview"><div style={{ padding: '20px', color: 'var(--text-muted)' }}>{project.name}</div></div>
              <div className="project-body">
                <h3>{project.name}</h3>
                <p>{project.description || 'مشروع ويب متطور تم بناؤه باستخدام تقنيات حديثة.'}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="site-footer reveal">
        <div>© 2026 {settings.brandName} — جميع الحقوق محفوظة</div>
      </footer>
    </div>
  );
}
