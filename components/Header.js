'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Header({ settings, activePage }) {
  const [theme, setTheme] = useState('light');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  if (!mounted) return <header className="site-header" style={{ height: '76px' }} />;

  return (
    <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="brand-block">
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="brand-avatar">م</div>
          <div className="brand-info">
            <strong>{settings.brandName || 'م. محمد مصطفى'}</strong>
            <span className="brand-kicker">{settings.heroPrefix || 'مهندس برمجيات'}</span>
          </div>
        </Link>
      </div>

      <nav className={`top-nav ${isMenuOpen ? 'open' : ''}`}>
        <Link href="/" className={activePage === 'home' ? 'active' : ''} onClick={() => setIsMenuOpen(false)}>الرئيسية</Link>
        <Link href="/#about" onClick={() => setIsMenuOpen(false)}>عني</Link>
        <Link href="/projects" className={activePage === 'projects' ? 'active' : ''} onClick={() => setIsMenuOpen(false)}>المشاريع</Link>
        <Link href="/contact" className={activePage === 'contact' ? 'active' : ''} onClick={() => setIsMenuOpen(false)}>التواصل</Link>
        
        <div className="mobile-only-cv" style={{ display: 'none' }}>
           <a href="/cv-mohammed-mustafa.pdf" download className="btn-primary">تحميل الـ CV</a>
        </div>
      </nav>

      <div className="nav-actions">
        <button onClick={toggleTheme} className="theme-toggle" title="تبديل الوضع">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        
        <a href="/cv-mohammed-mustafa.pdf" download className="nav-cv-btn">تحميل الـ CV</a>
        
        <button 
          className={`mobile-menu-toggle ${isMenuOpen ? 'open' : ''}`} 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle Menu"
        >
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>
  );
}
