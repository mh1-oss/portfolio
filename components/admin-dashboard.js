'use client';

import { useState, useMemo, useEffect } from "react";

export default function AdminDashboard({ initialAuthorized, initialState }) {
  const [authorized, setAuthorized] = useState(initialAuthorized);
  const [authKey, setAuthKey] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState(initialState);
  const [activeTab, setActiveTab] = useState('general');

  const [form, setForm] = useState({
    token: "",
    teamId: "",
    teamSlug: "",
    portfolio: {
      brandName: "Mustafa Portfolio",
      heroPrefix: "أنا مصمم ومطور واجهات",
      heroHighlight: "Mustafa Portfolio",
      bio: "بورتفوليو عربي حديث متصل بـ Vercel.",
      contactTitle: "لنعمل معاً",
      contactEmail: "example@email.com",
      contactText: "تواصل معي لمناقشة مشروعك القادم.",
      siteUrl: "http://localhost:3000"
    },
    cv: {
      skills: ["React", "Next.js", "Tailwind CSS"],
      languages: ["العربية", "الإنجليزية"],
      experience: [],
      education: []
    },
    hiddenProjectIds: [],
    projectOverrides: {}
  });

  useEffect(() => {
    if (state?.portfolio) {
      setForm((current) => ({
        ...current,
        teamId: state.config?.teamId || "",
        teamSlug: state.config?.teamSlug || "",
        portfolio: { ...current.portfolio, ...state.portfolio },
        cv: {
          skills: state.cv?.skills || [],
          languages: state.cv?.languages || [],
          experience: state.cv?.experience || [],
          education: state.cv?.education || []
        },
        hiddenProjectIds: state.config?.hiddenProjectIds || [],
        projectOverrides: state.config?.projectOverrides || {}
      }));
    }
  }, [state]);

  const managedProjects = useMemo(() => {
    return state?.projects || [];
  }, [state?.projects]);

  const projectSummary = useMemo(() => {
    const total = managedProjects.length;
    const projectIds = new Set(managedProjects.map(p => p.id));
    const hidden = form.hiddenProjectIds.filter(id => projectIds.has(id)).length;
    return {
      total,
      hidden,
      visible: Math.max(0, total - hidden)
    };
  }, [managedProjects, form.hiddenProjectIds]);

  async function handleLogin(event) {
    event.preventDefault();
    setPending(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        body: JSON.stringify({ key: authKey })
      });

      if (!response.ok) {
        throw new Error("مفتاح الإدارة غير صحيح.");
      }

      setAuthorized(true);
      const data = await fetch("/api/admin/config").then((r) => r.json());
      setState(data);
      setMessage("تم تسجيل الدخول بنجاح.");
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  async function handleLogout() {
    setPending(true);
    try {
      await fetch("/api/admin/session", { method: "DELETE" });
      setAuthorized(false);
      setState(null);
      setMessage("تم تسجيل الخروج.");
    } catch (err) {
      setError("فشل تسجيل الخروج.");
    } finally {
      setPending(false);
    }
  }

  async function handleSave(event) {
    event.preventDefault();
    setPending(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/config", {
        method: "POST",
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        throw new Error("فشل حفظ الإعدادات.");
      }

      const updated = await response.json();
      setState(updated);
      setMessage("تم حفظ الإعدادات بنجاح. سيتم تحديث الموقع خلال ثوانٍ.");
      setForm((c) => ({ ...c, token: "" }));
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  async function handleDisconnect() {
    if (!confirm("هل أنت متأكد من فصل الحساب؟ سيتم مسح التوكن والإعدادات.")) return;
    setPending(true);
    try {
      await fetch("/api/admin/config", { method: "DELETE" });
      const data = await fetch("/api/admin/config").then((r) => r.json());
      setState(data);
      setMessage("تم فصل الحساب ومسح الإعدادات.");
    } catch (err) {
      setError("فشل فصل الحساب.");
    } finally {
      setPending(false);
    }
  }

  function toggleHiddenProject(projectId) {
    setForm((current) => {
      const exists = current.hiddenProjectIds.includes(projectId);
      return {
        ...current,
        hiddenProjectIds: exists
          ? current.hiddenProjectIds.filter((id) => id !== projectId)
          : [...current.hiddenProjectIds, projectId]
      };
    });
  }

  function updateProjectOverride(projectId, field, value) {
    setForm((current) => {
      const nextOverrides = {
        ...(current.projectOverrides || {}),
        [projectId]: {
          ...(current.projectOverrides?.[projectId] || {}),
          [field]: value
        }
      };

      const entry = nextOverrides[projectId];
      if (!entry.previewImage?.trim() && !entry.description?.trim()) {
        delete nextOverrides[projectId];
      }

      return {
        ...current,
        projectOverrides: nextOverrides
      };
    });
  }

  const connectedBadge = state?.hasToken ? (
    <span style={{ color: "var(--primary)", fontWeight: "800" }}>● متصل بحساب Vercel</span>
  ) : (
    <span style={{ color: "var(--text-muted)", fontWeight: "600" }}>○ غير متصل</span>
  );

  return (
    <>
      <style jsx>{`
        .admin-page-container {
          padding: 120px 24px 80px;
          min-height: 100vh;
          width: 100vw;
          box-sizing: border-box;
          overflow-x: hidden;
          background: var(--bg-soft);
          text-align: center !important;
        }

        .admin-header-text {
          margin-bottom: 50px;
          max-width: 800px;
          width: 100%;
          margin-left: auto !important;
          margin-right: auto !important;
          display: inline-block !important;
          text-align: center !important;
        }

        .admin-header-text h1 {
          font-family: Cairo, sans-serif;
          font-size: 2.8rem;
          font-weight: 900;
          margin-bottom: 15px;
          color: var(--text-main);
          letter-spacing: -0.02em;
        }

        .admin-header-text p {
          color: var(--text-soft);
          font-size: 1.15rem;
          line-height: 1.7;
          margin: 0 auto;
          max-width: 600px;
        }

        .admin-card {
          background: var(--bg-glass);
          backdrop-filter: blur(16px);
          border: 1px solid var(--surface-border);
          border-radius: var(--radius-xl);
          padding: 48px;
          box-shadow: var(--shadow-lg);
          animation: fadeInUp 0.7s var(--ease);
          width: 95%;
          max-width: 1000px;
          margin-left: auto !important;
          margin-right: auto !important;
          display: inline-block !important;
          text-align: right !important;
          position: relative;
          z-index: 10;
        }

        .admin-card--login {
          max-width: 480px;
          padding: 50px 40px;
          margin-top: 40px;
        }

        .admin-card__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 35px;
          border-bottom: 1px solid var(--surface-border);
          padding-bottom: 25px;
        }

        .admin-status {
          display: inline-block;
          padding: 6px 14px;
          background: var(--primary-soft);
          color: var(--primary);
          border-radius: 99px;
          font-size: 0.82rem;
          font-weight: 800;
          margin-bottom: 12px;
        }

        h2 {
          font-family: Cairo, sans-serif;
          font-size: 1.8rem;
          font-weight: 900;
          color: var(--text-main);
          margin-top: 10px;
        }

        .logout-btn {
          background: var(--surface-100);
          border: 1px solid var(--surface-border);
          color: var(--text-soft);
          padding: 10px 20px;
          border-radius: var(--radius-lg);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s var(--ease);
        }

        .logout-btn:hover {
          background: #fee2e2;
          color: #ef4444;
          border-color: #fecaca;
          transform: translateY(-2px);
        }

        /* Tabs Styling */
        .admin-tabs {
          display: flex;
          gap: 6px;
          padding: 6px;
          background: var(--surface-50);
          border: 1px solid var(--surface-border);
          border-radius: var(--radius-xl);
          margin-bottom: 40px;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .admin-tabs::-webkit-scrollbar { display: none; }

        .tab-btn {
          flex: 1;
          white-space: nowrap;
          padding: 12px 24px;
          border: none;
          background: transparent;
          color: var(--text-soft);
          font-weight: 700;
          font-size: 0.95rem;
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: all 0.3s var(--ease);
        }

        .tab-btn:hover {
          background: var(--surface-100);
          color: var(--primary);
        }

        .tab-btn.active {
          background: var(--primary);
          color: white;
          box-shadow: 0 4px 12px var(--primary-glow);
        }

        /* Form Styling */
        .tab-content {
          animation: slideUp 0.4s var(--ease);
        }

        .field-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }

        .field--full { grid-column: span 2; }

        .field {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 24px;
          text-align: right;
        }

        .field span {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .field input, .field textarea, .field select {
          background: var(--surface-50);
          border: 1px solid var(--surface-border);
          border-radius: var(--radius-lg);
          padding: 14px 18px;
          color: var(--text-main);
          font-family: Cairo, sans-serif;
          font-size: 1rem;
          transition: all 0.3s var(--ease);
          width: 100%;
          outline: none;
        }

        .field input:focus, .field textarea:focus {
          background: white;
          border-color: var(--primary);
          box-shadow: 0 0 0 4px var(--primary-soft);
        }

        /* Project Cards */
        .projects-manager__grid {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .project-admin-card {
          display: flex;
          background: white;
          border: 1px solid var(--surface-border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          transition: all 0.3s var(--ease);
        }

        .project-admin-card:hover {
          transform: translateX(-5px);
          box-shadow: var(--shadow-md);
          border-color: var(--primary);
        }

        .project-admin-card__preview {
          width: 240px;
          background: var(--surface-50);
          border-left: 1px solid var(--surface-border);
          flex-shrink: 0;
        }

        .project-admin-card__preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .project-admin-card__content {
          flex: 1;
          padding: 24px;
          text-align: right;
        }

        .project-admin-card__top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .project-admin-card h3 {
          font-size: 1.25rem;
          font-weight: 800;
          margin-bottom: 4px;
        }

        .visibility-toggle {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: var(--surface-50);
          padding: 6px 14px;
          border-radius: 99px;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
        }

        /* Action Buttons */
        .admin-summary {
          margin-top: 40px;
          padding: 24px;
          background: var(--surface-50);
          border-radius: var(--radius-lg);
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          text-align: right;
        }

        /* Inner Cards for CV */
        .admin-inner-card {
          background: white;
          border: 1px solid var(--surface-border);
          border-radius: var(--radius-lg);
          padding: 24px;
          margin-bottom: 24px;
          position: relative;
          transition: all 0.3s var(--ease);
          animation: slideUp 0.3s var(--ease);
        }

        .admin-inner-card:hover {
          border-color: var(--primary);
          box-shadow: var(--shadow-sm);
        }

        .admin-inner-card__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 1px dashed var(--surface-border);
        }

        .admin-inner-card h4 {
          font-weight: 800;
          color: var(--primary);
          margin: 0;
        }

        .admin-inner-card__remove {
          background: #fee2e2;
          color: #ef4444;
          border: none;
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .admin-inner-card__remove:hover {
          background: #fecaca;
          transform: translateY(-1px);
        }

        .add-item-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--surface-50);
          color: var(--primary);
          border: 1px dashed var(--primary-soft);
          padding: 12px 24px;
          border-radius: var(--radius-lg);
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
          width: 100%;
          justify-content: center;
          margin-bottom: 24px;
        }

        .add-item-btn:hover {
          background: var(--primary-soft);
          border-style: solid;
        }

        .admin-actions {
          display: flex;
          gap: 12px;
          margin-top: 30px;
          padding-top: 25px;
          border-top: 1px solid var(--surface-border);
        }

        .primary-button {
          background: var(--primary);
          color: white;
          padding: 14px 40px;
          border-radius: var(--radius-lg);
          font-weight: 800;
          font-size: 1rem;
          border: none;
          cursor: pointer;
          transition: all 0.3s var(--ease);
          box-shadow: 0 6px 20px var(--primary-glow);
        }

        .primary-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px var(--primary-glow);
        }

        .primary-button:disabled { opacity: 0.6; cursor: not-allowed; }

        .secondary-button {
          color: #ef4444;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .feedback {
          padding: 16px;
          border-radius: var(--radius-lg);
          font-weight: 700;
          margin-top: 25px;
          animation: slideUp 0.3s var(--ease);
          text-align: center;
        }

        .feedback.error {
          background: #fff1f2;
          color: #e11d48;
          border: 1px solid #fda4af;
        }
        .feedback.success {
          background: #ecfdf5;
          color: #059669;
          border: 1px solid #6ee7b7;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .admin-page-container { padding: 100px 16px 40px; }
          .admin-header-text h1 { font-size: 2.2rem; }
          .admin-card { padding: 24px; }
          .field-grid { grid-template-columns: 1fr; }
          .field--full { grid-column: span 1; }
          .project-admin-card { flex-direction: column; }
          .project-admin-card__preview { width: 100%; height: 200px; border-left: none; border-bottom: 1px solid var(--surface-border); }
          .admin-summary { grid-template-columns: 1fr; }
          .admin-actions { flex-direction: column; align-items: stretch; }
          .primary-button { width: 100%; }
        }
      `}</style>

      {!authorized ? (
        <div className="admin-page-container">
          <section className="admin-card admin-card--login">
            <span className="admin-status">مقفل</span>
            <h2>الدخول إلى لوحة الإدارة</h2>
            <p>استخدم مفتاح الإدارة المكون من 4 أرقام</p>

            <form className="admin-login" onSubmit={handleLogin}>
              <label className="field">
                <span>مفتاح الإدارة</span>
                <input
                  type="password"
                  value={authKey}
                  onChange={(event) => setAuthKey(event.target.value)}
                  placeholder="0000"
                />
              </label>

              <button type="submit" className="primary-button" disabled={pending}>
                {pending ? "جارِ التحقق..." : "فتح اللوحة"}
              </button>
            </form>

            {error ? <p className="feedback error">{error}</p> : null}
            {message ? <p className="feedback success">{message}</p> : null}
          </section>
        </div>
      ) : (
        <div className="admin-page-container">
          <header className="admin-header-text">
            <h1>لوحة الإدارة</h1>
            <p>تحكم في محتوى البورتفوليو، بيانات الـ CV والمشاريع الخاصة بك</p>
          </header>

          <section className="admin-card">
            <div className="admin-card__header">
              <div>
                <span className="admin-status">الحالة: {connectedBadge}</span>
                <h2>إعدادات الربط والمحتوى</h2>
              </div>

              <button type="button" className="logout-btn" onClick={handleLogout} disabled={pending}>
                تسجيل الخروج
              </button>
            </div>

            <div className="admin-tabs">
              <button type="button" className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>الإعدادات العامة</button>
              <button type="button" className={`tab-btn ${activeTab === 'portfolio' ? 'active' : ''}`} onClick={() => setActiveTab('portfolio')}>بيانات الموقع</button>
              <button type="button" className={`tab-btn ${activeTab === 'cv' ? 'active' : ''}`} onClick={() => setActiveTab('cv')}>السيرة الذاتية</button>
              <button type="button" className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => setActiveTab('projects')}>المشاريع ({managedProjects.length})</button>
            </div>

            <form className="admin-form" onSubmit={handleSave}>
              {activeTab === 'general' && (
                <div className="tab-content">
                  <div className="field-grid">
                    <label className="field field--full">
                      <span>توكن Vercel</span>
                      <input
                        type="password"
                        value={form.token}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, token: event.target.value }))
                        }
                        placeholder={
                          state?.hasToken
                            ? `يوجد توكن محفوظ حالياً (${state.tokenMask})`
                            : "أدخل Access Token"
                        }
                      />
                      <small>اترك الحقل فارغاً للإبقاء على التوكن الحالي.</small>
                    </label>

                    <label className="field">
                      <span>Team ID</span>
                      <input
                        type="text"
                        value={form.teamId}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, teamId: event.target.value }))
                        }
                        placeholder="اختياري"
                      />
                    </label>

                    <label className="field">
                      <span>Team Slug</span>
                      <input
                        type="text"
                        value={form.teamSlug}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, teamSlug: event.target.value }))
                        }
                        placeholder="اختياري"
                      />
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'portfolio' && (
                <div className="tab-content">
                  <div className="field-grid">
                    <label className="field">
                      <span>اسم العلامة</span>
                      <input
                        type="text"
                        value={form.portfolio.brandName}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            portfolio: { ...current.portfolio, brandName: event.target.value }
                          }))
                        }
                      />
                    </label>

                    <label className="field">
                      <span>عنوان السطر الأول</span>
                      <input
                        type="text"
                        value={form.portfolio.heroPrefix}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            portfolio: { ...current.portfolio, heroPrefix: event.target.value }
                          }))
                        }
                      />
                    </label>

                    <label className="field">
                      <span>عنوان السطر المميز</span>
                      <input
                        type="text"
                        value={form.portfolio.heroHighlight}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            portfolio: { ...current.portfolio, heroHighlight: event.target.value }
                          }))
                        }
                      />
                    </label>

                    <label className="field field--full">
                      <span>نبذة الواجهة الرئيسية</span>
                      <textarea
                        rows="4"
                        value={form.portfolio.bio}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            portfolio: { ...current.portfolio, bio: event.target.value }
                          }))
                        }
                      />
                    </label>

                    <label className="field">
                      <span>عنوان التواصل</span>
                      <input
                        type="text"
                        value={form.portfolio.contactTitle}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            portfolio: { ...current.portfolio, contactTitle: event.target.value }
                          }))
                        }
                      />
                    </label>

                    <label className="field">
                      <span>البريد الإلكتروني</span>
                      <input
                        type="email"
                        value={form.portfolio.contactEmail}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            portfolio: { ...current.portfolio, contactEmail: event.target.value }
                          }))
                        }
                      />
                    </label>

                    <label className="field">
                      <span>رابط الموقع</span>
                      <input
                        type="url"
                        value={form.portfolio.siteUrl}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            portfolio: { ...current.portfolio, siteUrl: event.target.value }
                          }))
                        }
                      />
                    </label>

                    <label className="field field--full">
                      <span>نص قسم التواصل</span>
                      <textarea
                        rows="3"
                        value={form.portfolio.contactText}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            portfolio: { ...current.portfolio, contactText: event.target.value }
                          }))
                        }
                      />
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'cv' && (
                <div className="tab-content">
                  <div className="cv-manager">
                    <div className="field-grid">
                      <label className="field field--full">
                        <span>المهارات (افصل بينها بفاصلة)</span>
                        <input 
                          type="text" 
                          value={form.cv.skills.join(', ')} 
                          onChange={(e) => setForm(c => ({ ...c, cv: { ...c.cv, skills: e.target.value.split(',').map(s => s.trim()) } }))}
                        />
                      </label>
                      <label className="field field--full">
                        <span>اللغات (افصل بينها بفاصلة)</span>
                        <input 
                          type="text" 
                          value={form.cv.languages.join(', ')} 
                          onChange={(e) => setForm(c => ({ ...c, cv: { ...c.cv, languages: e.target.value.split(',').map(s => s.trim()) } }))}
                        />
                      </label>
                    </div>

                  <div className="cv-manager">
                    <div style={{ marginBottom: '40px' }}>
                      <div className="admin-status" style={{ marginBottom: '15px', display: 'inline-block' }}>الخبرة العملية</div>
                      
                      <div className="cv-list">
                        {form.cv.experience.map((exp, idx) => (
                          <div key={exp.id || idx} className="admin-inner-card">
                            <div className="admin-inner-card__header">
                              <h4>الخبرة #{idx + 1}</h4>
                              <button type="button" className="admin-inner-card__remove" onClick={() => setForm(c => ({ ...c, cv: { ...c.cv, experience: c.cv.experience.filter((_, i) => i !== idx) } }))}>حذف الخبرة</button>
                            </div>

                            <div className="field-grid">
                              <label className="field">
                                <span>المسمى الوظيفي</span>
                                <input placeholder="مثلاً: مطور واجهات أمامي" value={exp.role} onChange={(e) => {
                                  const next = [...form.cv.experience];
                                  next[idx].role = e.target.value;
                                  setForm(c => ({ ...c, cv: { ...c.cv, experience: next } }));
                                }} />
                              </label>

                              <label className="field">
                                <span>الشركة / المؤسسة</span>
                                <input placeholder="اسم الشركة" value={exp.company} onChange={(e) => {
                                  const next = [...form.cv.experience];
                                  next[idx].company = e.target.value;
                                  setForm(c => ({ ...c, cv: { ...c.cv, experience: next } }));
                                }} />
                              </label>

                              <label className="field field--full">
                                <span>الفترة الزمنية</span>
                                <input placeholder="2022 - الحالي" value={exp.period} onChange={(e) => {
                                  const next = [...form.cv.experience];
                                  next[idx].period = e.target.value;
                                  setForm(c => ({ ...c, cv: { ...c.cv, experience: next } }));
                                }} />
                              </label>

                              <label className="field field--full">
                                <span>وصف المهام</span>
                                <textarea placeholder="اشرح ما قمت به باختصار..." value={exp.description} onChange={(e) => {
                                  const next = [...form.cv.experience];
                                  next[idx].description = e.target.value;
                                  setForm(c => ({ ...c, cv: { ...c.cv, experience: next } }));
                                }} rows="4" />
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button type="button" className="add-item-btn" onClick={() => setForm(c => ({ ...c, cv: { ...c.cv, experience: [...c.cv.experience, { id: Date.now(), role: '', company: '', period: '', description: '' }] } }))}>
                        <span>+ إضافة خبرة جديدة</span>
                      </button>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <div className="admin-status" style={{ marginBottom: '15px', display: 'inline-block' }}>التعليم والشهادات</div>
                      
                      <div className="cv-list">
                        {form.cv.education.map((edu, idx) => (
                          <div key={edu.id || idx} className="admin-inner-card">
                            <div className="admin-inner-card__header">
                              <h4>الشهادة #{idx + 1}</h4>
                              <button type="button" className="admin-inner-card__remove" onClick={() => setForm(c => ({ ...c, cv: { ...c.cv, education: c.cv.education.filter((_, i) => i !== idx) } }))}>حذف</button>
                            </div>

                            <div className="field-grid">
                              <label className="field">
                                <span>الدرجة العلمية / الشهادة</span>
                                <input placeholder="بكالوريوس هندسة..." value={edu.degree} onChange={(e) => {
                                  const next = [...form.cv.education];
                                  next[idx].degree = e.target.value;
                                  setForm(c => ({ ...c, cv: { ...c.cv, education: next } }));
                                }} />
                              </label>

                              <label className="field">
                                <span>الجامعة / الجهة</span>
                                <input placeholder="جامعة بغداد" value={edu.school} onChange={(e) => {
                                  const next = [...form.cv.education];
                                  next[idx].school = e.target.value;
                                  setForm(c => ({ ...c, cv: { ...c.cv, education: next } }));
                                }} />
                              </label>

                              <label className="field field--full">
                                <span>السنة / الفترة</span>
                                <input placeholder="2018 - 2022" value={edu.year} onChange={(e) => {
                                  const next = [...form.cv.education];
                                  next[idx].year = e.target.value;
                                  setForm(c => ({ ...c, cv: { ...c.cv, education: next } }));
                                }} />
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button type="button" className="add-item-btn" onClick={() => setForm(c => ({ ...c, cv: { ...c.cv, education: [...c.cv.education, { id: Date.now(), degree: '', school: '', year: '' }] } }))}>
                        <span>+ إضافة تعليم جديد</span>
                      </button>
                    </div>
                  </div>
                  </div>
                </div>
              )}

              {activeTab === 'projects' && (
                <div className="tab-content">
                  <div className="projects-manager">
                    <div className="projects-manager__stats">
                      <div>
                        <strong>{projectSummary.total}</strong>
                        <span>الإجمالي</span>
                      </div>
                      <div>
                        <strong>{projectSummary.visible}</strong>
                        <span>الظاهر</span>
                      </div>
                      <div>
                        <strong>{projectSummary.hidden}</strong>
                        <span>المخفي</span>
                      </div>
                    </div>

                    {managedProjects.length ? (
                      <div className="projects-manager__grid">
                        {managedProjects.map((project) => {
                          const isHidden = form.hiddenProjectIds.includes(project.id);
                          const override = form.projectOverrides?.[project.id] || {};
                          const previewImage = override.previewImage || project.previewImage;

                          return (
                            <article key={project.id} className={`project-admin-card ${isHidden ? "is-hidden-project" : ""}`}>
                              <div className="project-admin-card__preview">
                                {previewImage ? (
                                  <img 
                                    src={previewImage} 
                                    alt={project.name} 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <div className="project-preview-abstract" style={{ display: previewImage ? 'none' : 'flex' }}>
                                  <span>{project.name?.substring(0, 2).toUpperCase() || 'PRJ'}</span>
                                </div>
                              </div>

                              <div className="project-admin-card__content">
                                <div className="project-admin-card__top">
                                  <div>
                                    <h3>{project.name}</h3>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-soft)' }}>{project.domainLabel}</span>
                                  </div>

                                  <label className="visibility-toggle">
                                    <input
                                      type="checkbox"
                                      checked={!isHidden}
                                      onChange={() => toggleHiddenProject(project.id)}
                                    />
                                    <span>{isHidden ? "مخفي" : "ظاهر"}</span>
                                  </label>
                                </div>

                                <label className="field">
                                  <span>رابط المعاينة (اختياري)</span>
                                  <input
                                    type="url"
                                    value={override.previewImage || ""}
                                    onChange={(e) => updateProjectOverride(project.id, "previewImage", e.target.value)}
                                    placeholder="سيتم استخدام المعاينة التلقائية إذا ترك فارغاً"
                                  />
                                </label>

                                <label className="field">
                                  <span>وصف مخصص</span>
                                  <textarea
                                    rows="2"
                                    value={override.description || ""}
                                    onChange={(e) => updateProjectOverride(project.id, "description", e.target.value)}
                                    placeholder={project.description}
                                  />
                                </label>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--surface-50)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--surface-border)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🚀</div>
                        <h3 style={{ marginBottom: '10px' }}>لا توجد مشاريع مرتبطة</h3>
                        <p style={{ color: 'var(--text-soft)', maxWidth: '400px', margin: '0 auto 25px' }}>
                          {state?.hasToken 
                            ? "تم الاتصال بنجاح ولكن لم يتم العثور على أي مشاريع في هذا الحساب أو الفريق."
                            : "يرجى إضافة توكن Vercel في 'الإعدادات العامة' ليتم جلب مشاريعك تلقائياً وتفعيل ميزة المعاينة."}
                        </p>
                        {!state?.hasToken && (
                          <button type="button" className="btn-primary" onClick={() => setActiveTab('general')} style={{ minWidth: 'auto', padding: '10px 25px' }}>
                            الذهاب للإعدادات العامة
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="admin-actions">
                <button type="submit" className="primary-button" disabled={pending}>
                  {pending ? "جارِ الحفظ..." : "حفظ الإعدادات"}
                </button>

                <button type="button" className="secondary-button" onClick={handleDisconnect} disabled={pending}>
                  فصل الحساب
                </button>
              </div>
            </form>

            {state?.account ? (
              <div className="admin-summary">
                <div>
                  <span className="section-kicker">الحساب الحالي</span>
                  <strong>{state.account.scopeLabel}</strong>
                  <p>{state.account.ownerLabel}</p>
                </div>
                <div>
                  <span className="section-kicker">آخر حفظ</span>
                  <strong>{state.updatedAtLabel}</strong>
                </div>
              </div>
            ) : null}

            {error ? <p className="feedback error">{error}</p> : null}
            {message ? <p className="feedback success">{message}</p> : null}
          </section>
        </div>
      )}
    </>
  );
}
