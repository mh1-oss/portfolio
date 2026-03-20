'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ContactClient({ portfolio }) {
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
  const whatsappNumber = "964770000000"; // Placeholder, can be mapped from data if available

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
          <Link href="/projects">المشاريع</Link>
          <Link href="/contact" style={{ color: 'var(--primary)' }}>التواصل</Link>
        </nav>
        <div className="nav-actions">
          <button onClick={toggleTheme} className="theme-toggle">{theme === 'light' ? '🌙' : '☀️'}</button>
          <button className={`mobile-menu-toggle ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </header>

      <main style={{ padding: '60px 0' }}>
         <h1 className="reveal active" style={{ fontFamily: 'Cairo, sans-serif', fontSize: '3rem', marginBottom: '40px' }}>تواصل معي</h1>

         <div className="contact-grid-wrapper" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
            {/* Info Section */}
            <div className="reveal stagger-1" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
               
               <a href={`mailto:${settings.contactEmail}`} className="contact-card-link">
                  <div className="contact-card-content">
                     <span className="contact-icon">📧</span>
                     <div className="contact-text">
                        <small>البريد الإلكتروني</small>
                        <strong>{settings.contactEmail}</strong>
                     </div>
                  </div>
               </a>

               <a href={`https://wa.me/${whatsappNumber}`} target="_blank" className="contact-card-link">
                  <div className="contact-card-content">
                     <span className="contact-icon" style={{ background: '#25cf43', color: 'white' }}>💬</span>
                     <div className="contact-text">
                        <small>واتساب</small>
                        <strong>تحدث معي الآن</strong>
                     </div>
                  </div>
               </a>

               <div style={{ display: 'flex', gap: '16px', marginTop: '20px' }}>
                  <a href="https://linkedin.com" target="_blank" className="social-btn">LinkedIn</a>
                  <a href="https://github.com" target="_blank" className="social-btn">GitHub</a>
               </div>
            </div>

            {/* Form Section */}
            <div className="reveal stagger-2" style={{ padding: '40px', background: 'var(--bg-soft)', borderRadius: '24px', border: '1px solid var(--surface-border)' }}>
               <h2 style={{ marginBottom: '24px', fontFamily: 'Cairo, sans-serif' }}>أرسل رسالة سريعة</h2>
               <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <input type="text" placeholder="الاسم" style={{ padding: '14px', borderRadius: '12px', border: '1px solid var(--surface-border)', background: 'var(--bg)' }} />
                  <textarea placeholder="رسالتك..." rows="4" style={{ padding: '14px', borderRadius: '12px', border: '1px solid var(--surface-border)', background: 'var(--bg)', resize: 'none' }}></textarea>
                  <button type="button" className="btn-primary" style={{ width: '100%' }}>إرسال الآن</button>
               </form>
            </div>
         </div>
      </main>

      <footer className="site-footer reveal"><div>© 2026 {settings.brandName}</div></footer>

      <style jsx>{`
         .contact-card-link {
            display: block;
            padding: 24px;
            background: var(--bg-soft);
            border: 1px solid var(--surface-border);
            border-radius: 20px;
            transition: all 0.3s ease;
         }
         .contact-card-link:hover {
            transform: translateY(-5px);
            border-color: var(--primary);
            box-shadow: var(--shadow);
         }
         .contact-card-content { display: flex; align-items: center; gap: 20px; }
         .contact-icon {
            width: 50px; height: 50px; border-radius: 12px; background: var(--primary-soft);
            display: grid; place-items: center; font-size: 1.5rem;
         }
         .contact-text small { display: block; color: var(--text-soft); font-size: 0.8rem; margin-bottom: 2px; }
         .contact-text strong { display: block; fontSize: 1.1rem; }
         
         .social-btn {
            padding: 12px 24px; border-radius: 12px; border: 1px solid var(--surface-border);
            background: var(--bg-soft); font-weight: 700; transition: all 0.3s ease;
         }
         .social-btn:hover { background: var(--primary-soft); color: var(--primary); border-color: var(--primary); }

         @media (max-width: 992px) {
            .contact-grid-wrapper { grid-template-columns: 1fr; }
         }
      `}</style>
    </div>
  );
}
