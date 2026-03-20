'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';

export default function HomeClient({ portfolio }) {
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
    setTimeout(() => {
       handleScroll();
       document.querySelectorAll('.hero-section .reveal').forEach(el => el.classList.add('active'));
    }, 150);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!portfolio || !mounted) return <div style={{ minHeight: '100vh', background: 'var(--bg)' }} />;

  const settings = portfolio.portfolio;
  const featuredProjects = portfolio.projects.slice(0, 4);

  return (
    <div className="page-shell">
      <Header settings={settings} activePage="home" />

      <div className="hero-section">
        <div className="hero-badge reveal stagger-1">متاح للعمل الحر</div>
        <h1 className="reveal stagger-2">{settings.heroPrefix} <br /><span className="hero-highlight">{settings.heroHighlight}</span></h1>
        <p className="hero-bio reveal stagger-3">{settings.bio}</p>
        <div className="hero-actions reveal stagger-4">
          <Link href="/projects" className="btn-primary">استكشف أعمالي</Link>
          <a href="/cv-mohammed-mustafa.pdf" download className="btn-outline">تحميل الـ CV</a>
        </div>
      </div>

      <section id="about" className="about-section reveal">
        <div className="about-image"><span>👨‍💻</span></div>
        <div className="about-info">
          <h2 className="reveal stagger-1">عن {settings.brandName}</h2>
          <p className="reveal stagger-2">{settings.bio}</p>
        </div>
      </section>

      <section id="projects">
        <div className="section-header reveal">
          <h2>مشاريع مختارة</h2>
          <Link href="/projects">عرض الكل ←</Link>
        </div>
        <div className="projects-grid">
          {featuredProjects.map((project, idx) => (
            <a 
              key={project.id} 
              href={project.url || `https://${project.name}.vercel.app`} 
              target="_blank" 
              className={`project-card reveal stagger-${(idx % 4) + 1}`}
              style={{ cursor: 'pointer' }}
            >
              <div className="project-preview"><div style={{ padding: '20px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>إضغط للمشاهدة</div></div>
              <div className="project-body">
                <h3>{project.name}</h3>
                <p>{project.description}</p>
                <div className="project-footer"><span className="project-link">زيارة الموقع ↑</span></div>
              </div>
            </a>
          ))}
        </div>
      </section>

      <footer className="site-footer reveal"><div>© 2026 {settings.brandName} — جميع الحقوق محفوظة</div></footer>
    </div>
  );
}
