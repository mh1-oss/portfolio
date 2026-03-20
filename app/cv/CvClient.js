'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';

export default function CvClient({ data }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !data) return <div style={{ minHeight: '100vh', background: '#fff' }} />;

  const { portfolio, cv } = data;

  return (
    <div className="cv-page">
      <Header settings={portfolio} activePage="cv" />

      <main className="cv-container">
        <div className="cv-paper">
          <header className="cv-header">
            <div className="cv-header-info">
              <h1>{portfolio.brandName}</h1>
              <h2>{portfolio.heroPrefix}</h2>
              <div className="cv-contact-strip">
                <span>{portfolio.contactEmail}</span>
                <span>•</span>
                <span>{portfolio.siteUrl || 'محمد مصطفى'}</span>
              </div>
            </div>
            <div className="cv-header-badge">CV</div>
          </header>

          <section className="cv-section">
            <h3 className="cv-section-title">النبذة الشخصية</h3>
            <p className="cv-text">{portfolio.bio}</p>
          </section>

          <div className="cv-main-grid">
            <div className="cv-primary-col">
              <section className="cv-section">
                <h3 className="cv-section-title">الخبرة المهنية</h3>
                {cv.experience.map((exp, idx) => (
                  <div key={idx} className="cv-entry">
                    <div className="cv-entry-header">
                      <strong>{exp.role}</strong>
                      <span className="cv-period">{exp.period}</span>
                    </div>
                    <div className="cv-company">{exp.company}</div>
                    <p className="cv-desc">{exp.description}</p>
                  </div>
                ))}
              </section>

              <section className="cv-section">
                <h3 className="cv-section-title">التعليم</h3>
                {cv.education.map((edu, idx) => (
                  <div key={idx} className="cv-entry">
                    <div className="cv-entry-header">
                      <strong>{edu.degree}</strong>
                      <span className="cv-period">{edu.year}</span>
                    </div>
                    <div className="cv-company">{edu.school}</div>
                  </div>
                ))}
              </section>
            </div>

            <aside className="cv-side-col">
              <section className="cv-section">
                <h3 className="cv-section-title">المهارات التقنية</h3>
                <div className="cv-tags">
                  {cv.skills.map((skill, idx) => (
                    <span key={idx} className="cv-tag">{skill}</span>
                  ))}
                </div>
              </section>

              <section className="cv-section">
                <h3 className="cv-section-title">اللغات</h3>
                <div className="cv-tags">
                  {cv.languages.map((lang, idx) => (
                    <span key={idx} className="cv-tag">{lang}</span>
                  ))}
                </div>
              </section>

              <div className="cv-print-hint">
                <button onClick={() => window.print()} className="print-btn">
                  طباعة الصفحة (PDF) 🖨️
                </button>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <style jsx>{`
        .cv-page { background: #f4f7f6; min-height: 100vh; padding-bottom: 60px; }
        .cv-container { max-width: 900px; margin: 40px auto; padding: 0 20px; }
        .cv-paper { background: white; padding: 60px; border-radius: 8px; box-shadow: 0 30px 60px rgba(0,0,0,0.05); border: 1px solid #e0e0e0; min-height: 1100px; }
        
        .cv-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #333; padding-bottom: 30px; margin-bottom: 40px; }
        .cv-header h1 { font-family: Cairo, sans-serif; font-size: 2.5rem; color: #1a1a1a; margin-bottom: 8px; }
        .cv-header h2 { font-size: 1.25rem; color: #666; font-weight: 500; }
        .cv-contact-strip { margin-top: 15px; display: flex; gap: 12px; color: #888; font-size: 0.9rem; }
        .cv-header-badge { background: #333; color: white; padding: 8px 16px; border-radius: 4px; font-weight: 700; font-size: 0.8rem; letter-spacing: 1px; }

        .cv-section { margin-bottom: 35px; }
        .cv-section-title { font-family: Cairo, sans-serif; font-size: 1.1rem; text-transform: uppercase; color: #1a1a1a; border-bottom: 1px solid #eee; padding-bottom: 8px; margin-bottom: 15px; font-weight: 800; }
        .cv-text { color: #444; line-height: 1.7; font-size: 1rem; }

        .cv-main-grid { display: grid; grid-template-columns: 1fr 280px; gap: 40px; }
        .cv-entry { margin-bottom: 20px; }
        .cv-entry-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; }
        .cv-entry-header strong { font-size: 1.1rem; color: #1a1a1a; }
        .cv-period { font-size: 0.85rem; color: #888; font-weight: 600; }
        .cv-company { color: #555; font-weight: 600; margin-bottom: 8px; }
        .cv-desc { font-size: 0.95rem; color: #666; line-height: 1.6; }

        .cv-tags { display: flex; flex-wrap: wrap; gap: 8px; }
        .cv-tag { background: #f5f5f5; color: #444; padding: 6px 12px; border-radius: 6px; font-size: 0.85rem; border: 1px solid #eee; font-weight: 600; }

        .print-btn { width: 100%; padding: 12px; background: #333; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; transition: background 0.2s; margin-top: 20px; }
        .print-btn:hover { background: #000; }

        @media print {
          .cv-page { background: white; padding: 0; }
          .cv-container { margin: 0; width: 100%; max-width: none; }
          .cv-paper { box-shadow: none; border: none; padding: 0; }
          .print-btn, header.site-header { display: none !important; }
        }

        @media (max-width: 768px) {
          .cv-paper { padding: 40px 20px; }
          .cv-header { flex-direction: column; gap: 20px; }
          .cv-main-grid { grid-template-columns: 1fr; }
          .cv-header h1 { font-size: 2rem; }
        }
      `}</style>
    </div>
  );
}
