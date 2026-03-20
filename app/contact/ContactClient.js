'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';

export default function ContactClient({ portfolio }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      const reveals = document.querySelectorAll('.reveal');
      reveals.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.95) el.classList.add('active');
      });
    };
    window.addEventListener('scroll', handleScroll);
    setTimeout(handleScroll, 150);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!mounted) return <div style={{ minHeight: '100vh', background: '#ffffff' }} />;

  const settings = portfolio?.portfolio || {};
  const whatsappNumber = "964770000000"; 

  return (
    <div className="page-shell">
      <Header settings={settings} activePage="contact" />

      <main className="contact-main">
         <div className="contact-header reveal active">
            <h1>تواصل معي</h1>
            <p>أنا متاح دائماً للمناقشة حول مشاريعكم ومقترحاتكم</p>
         </div>

         <div className="contact-container reveal">
            <div className="contact-info-list staggered">
               <a href={`mailto:${settings.contactEmail}`} className="contact-hub-card reveal stagger-1">
                  <div className="hub-icon">📧</div>
                  <div className="hub-details">
                     <span className="hub-label">البريد الإلكتروني</span>
                     <span className="hub-value">{settings.contactEmail}</span>
                  </div>
               </a>
               <a href={`https://wa.me/${whatsappNumber}`} target="_blank" className="contact-hub-card reveal stagger-2">
                  <div className="hub-icon" style={{ background: '#25D366', color: 'white' }}>💬</div>
                  <div className="hub-details">
                     <span className="hub-label">واتساب</span>
                     <span className="hub-value">تحدث معي مباشرة</span>
                  </div>
               </a>
               <div className="social-links-grid reveal stagger-3">
                  <a href="https://linkedin.com" target="_blank" className="social-link-item">LinkedIn</a>
                  <a href="https://github.com" target="_blank" className="social-link-item">GitHub</a>
                  <a href="https://twitter.com" target="_blank" className="social-link-item">Twitter / X</a>
               </div>
            </div>
         </div>
      </main>

      <footer className="site-footer reveal"><div>© 2026 {settings.brandName} — جميع الحقوق محفوظة</div></footer>

      <style jsx>{`
        .contact-main { padding: 80px 0; max-width: 800px; margin: 0 auto; text-align: center; }
        .contact-header h1 { font-family: Cairo, sans-serif; font-size: 3.5rem; margin-bottom: 16px; color: var(--text-main); }
        .contact-header p { font-size: 1.2rem; color: var(--text-soft); margin-bottom: 60px; }
        .contact-container { background: var(--bg-soft); padding: 60px 40px; border-radius: 40px; border: 1px solid var(--surface-border); }
        .contact-info-list { display: flex; flex-direction: column; gap: 24px; }
        .contact-hub-card { display: flex; align-items: center; gap: 24px; padding: 30px; background: var(--surface); border-radius: 24px; border: 1px solid var(--surface-border); transition: all 0.4s ease; text-align: right; }
        .contact-hub-card:hover { transform: translateY(-8px); border-color: var(--primary); box-shadow: 0 20px 40px var(--primary-glow); }
        .hub-icon { width: 64px; height: 64px; border-radius: 18px; background: var(--primary-soft); display: grid; place-items: center; font-size: 1.8rem; }
        .hub-details { display: flex; flex-direction: column; gap: 4px; }
        .hub-label { font-size: 0.9rem; color: var(--text-muted); font-weight: 700; }
        .hub-value { font-size: 1.25rem; font-weight: 800; color: var(--text-main); }
        .social-links-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 20px; }
        .social-link-item { padding: 16px; background: var(--surface); border: 1px solid var(--surface-border); border-radius: 16px; font-weight: 800; transition: all 0.3s ease; }
        .social-link-item:hover { background: var(--primary); color: white !important; transform: translateY(-4px); }
        @media (max-width: 768px) {
           .contact-main { padding: 40px 20px; }
           .contact-header h1 { font-size: 2.5rem; }
           .contact-container { padding: 40px 20px; border-radius: 30px; }
           .social-links-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
