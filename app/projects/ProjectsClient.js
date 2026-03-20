'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';

export default function ProjectsClient({ portfolio }) {
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

  if (!portfolio || !mounted) return <div style={{ minHeight: '100vh', background: 'var(--bg)' }} />;

  const settings = portfolio.portfolio;

  return (
    <div className="page-shell">
      <Header settings={settings} activePage="projects" />

      <main style={{ padding: '60px 0' }}>
        <h1 className="reveal active" style={{ fontFamily: 'Cairo, sans-serif', fontSize: '2.8rem', marginBottom: '40px' }}>جميع المشاريع</h1>
        <div className="projects-grid">
          {portfolio.projects.map((project, idx) => (
            <a 
              key={project.id} 
              href={project.url || `https://${project.name}.vercel.app`} 
              target="_blank" 
              className={`project-card reveal stagger-${(idx % 4) + 1}`}
              style={{ cursor: 'pointer' }}
            >
              <div className="project-preview">
                {project.previewImage ? (
                  <img 
                    src={project.previewImage} 
                    alt={project.name} 
                    loading="lazy" 
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="project-preview-abstract" style={{ display: project.previewImage ? 'none' : 'flex' }}>
                   <span>{project.name?.substring(0, 2).toUpperCase() || 'PRJ'}</span>
                </div>
              </div>
              <div className="project-body">
                <h3>{project.name}</h3>
                <p>{project.description}</p>
                <div className="project-footer"><span className="project-link">زيارة الموقع ↑</span></div>
              </div>
            </a>
          ))}
        </div>
      </main>

      <footer className="site-footer reveal"><div>© 2026 {settings.brandName}</div></footer>
    </div>
  );
}
