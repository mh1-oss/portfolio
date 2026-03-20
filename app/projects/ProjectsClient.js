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
      <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="brand-block">
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="brand-avatar">م</div>
            <div className="brand-info"><strong>{settings.brandName}</strong></div>
          </Link>
        </div>
        <nav className={`top-nav ${isMenuOpen ? 'open' : ''}`}>
          <Link href="/">الرئيسية</Link>
          <Link href="/projects" style={{ color: 'var(--primary)' }}>المشاريع</Link>
          <Link href="/contact">التواصل</Link>
        </nav>
        <div className="nav-actions">
          <button onClick={toggleTheme} className="theme-toggle">{theme === 'light' ? '🌙' : '☀️'}</button>
          <button className={`mobile-menu-toggle ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </header>

      <main style={{ padding: '60px 0' }}>
        <h1 className="reveal active" style={{ fontFamily: 'Cairo, sans-serif', fontSize: '2.8rem', marginBottom: '40px' }}>جميع المشاريع</h1>
        <div className="projects-grid">
          {portfolio.projects.map((project, idx) => (
            <a 
              key={project.id} 
              href={`https://${project.domain || project.id}`} 
              target="_blank" 
              className={`project-card reveal stagger-${(idx % 4) + 1}`}
              style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
            >
              <div className="project-preview"><div style={{ padding: '20px', color: 'var(--text-muted)' }}>إضغط للمشاهدة</div></div>
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
      </main>

      <footer className="site-footer reveal"><div>© 2026 {settings.brandName}</div></footer>
    </div>
  );
}
