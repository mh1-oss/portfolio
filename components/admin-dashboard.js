"use client";

import { useEffect, useMemo, useState } from "react";

const defaultPortfolio = {
  brandName: "",
  heroPrefix: "",
  heroHighlight: "",
  bio: "",
  contactTitle: "",
  contactText: "",
  contactEmail: "",
  siteUrl: ""
};

function getInitialFormState(initialState) {
  return {
    token: "",
    teamId: initialState?.teamId || "",
    teamSlug: initialState?.teamSlug || "",
    hiddenProjectIds: initialState?.hiddenProjectIds || [],
    projectOverrides: initialState?.projectOverrides || {},
    portfolio: {
      ...defaultPortfolio,
      ...(initialState?.portfolio || {})
    }
  };
}

export default function AdminDashboard({ initialAuthorized, initialState }) {
  const [authorized, setAuthorized] = useState(initialAuthorized);
  const [authKey, setAuthKey] = useState("");
  const [form, setForm] = useState(getInitialFormState(initialState));
  const [state, setState] = useState(initialState);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const connectedBadge = useMemo(() => {
    if (!state?.hasToken) {
      return "غير مرتبط";
    }

    return state?.account?.scopeLabel || "مرتبط";
  }, [state]);

  const managedProjects = state?.projects || [];

  const projectSummary = useMemo(() => {
    const hiddenCount = form.hiddenProjectIds.length;
    const visibleCount = Math.max(managedProjects.length - hiddenCount, 0);

    return {
      total: managedProjects.length,
      hidden: hiddenCount,
      visible: visibleCount
    };
  }, [form.hiddenProjectIds, managedProjects.length]);

  useEffect(() => {
    if (!authorized) {
      return;
    }

    loadConfig();
  }, [authorized]);

  async function loadConfig() {
    setPending(true);
    setError("");

    try {
      const response = await fetch("/api/admin/config", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setState(data.state);
      setForm(getInitialFormState(data.state));
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setPending(false);
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    setPending(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: authKey })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setAuthorized(true);
      setMessage(data.message);
    } catch (loginError) {
      setError(loginError.message);
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setState(data.state);
      setForm({
        ...getInitialFormState(data.state),
        token: ""
      });
      setMessage(data.message);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setPending(false);
    }
  }

  async function handleDisconnect() {
    setPending(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/config", {
        method: "DELETE"
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setState(null);
      setForm(getInitialFormState(null));
      setMessage(data.message);
    } catch (disconnectError) {
      setError(disconnectError.message);
    } finally {
      setPending(false);
    }
  }

  async function handleLogout() {
    setPending(true);
    setError("");
    setMessage("");

    try {
      await fetch("/api/admin/session", { method: "DELETE" });
      setAuthorized(false);
      setAuthKey("");
      setMessage("تم إغلاق الجلسة الإدارية.");
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

  if (!authorized) {
    return (
      <section className="admin-card">
        <span className="admin-status">مقفل</span>
        <h2>الدخول إلى لوحة الإدارة</h2>
        <p>
          استخدم مفتاح الإدارة المخزن في المتغير `ADMIN_ACCESS_KEY`. إذا لم تضفه بعد،
          فالمشروع يستخدم المفتاح الافتراضي `portfolio-admin-2026`.
        </p>

        <form className="admin-login" onSubmit={handleLogin}>
          <label className="field">
            <span>مفتاح الإدارة</span>
            <input
              type="password"
              value={authKey}
              onChange={(event) => setAuthKey(event.target.value)}
              placeholder="أدخل مفتاح الإدارة"
            />
          </label>

          <button type="submit" className="primary-button" disabled={pending}>
            {pending ? "جارِ التحقق..." : "فتح اللوحة"}
          </button>
        </form>

        {error ? <p className="feedback error">{error}</p> : null}
        {message ? <p className="feedback success">{message}</p> : null}
      </section>
    );
  }

  return (
    <section className="admin-card">
      <div className="admin-card__header">
        <div>
          <span className="admin-status">الحالة: {connectedBadge}</span>
          <h2>إعدادات الربط والمحتوى</h2>
        </div>

        <button type="button" className="text-button" onClick={handleLogout} disabled={pending}>
          تسجيل الخروج
        </button>
      </div>

      <form className="admin-form" onSubmit={handleSave}>
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

        <div className="section-divider" />

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

        <div className="section-divider" />

        <div className="projects-manager">
          <div className="projects-manager__header">
            <div>
              <span className="section-kicker">إدارة المشاريع</span>
              <h3>إخفاء المشاريع وتخصيص المعاينات</h3>
              <p>
                يتم الآن سحب كل المشاريع من Vercel. من هنا تقدر تخفي مشروع معيّن، أو تضيف
                صورة معاينة خاصة، أو تكتب وصفاً مخصصاً بدل الوصف التلقائي.
              </p>
            </div>

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
          </div>

          {managedProjects.length ? (
            <div className="projects-manager__grid">
              {managedProjects.map((project) => {
                const isHidden = form.hiddenProjectIds.includes(project.id);
                const override = form.projectOverrides?.[project.id] || {};
                const previewImage = override.previewImage || project.previewImage;

                return (
                  <article
                    key={project.id}
                    className={`project-admin-card ${isHidden ? "is-hidden-project" : ""}`}
                  >
                    <div className="project-admin-card__preview">
                      {previewImage ? (
                        <img src={previewImage} alt={`معاينة ${project.name}`} loading="lazy" />
                      ) : (
                        <div className="project-admin-card__fallback">
                          <strong>{project.name}</strong>
                          <span>{project.domainLabel}</span>
                        </div>
                      )}
                    </div>

                    <div className="project-admin-card__content">
                      <div className="project-admin-card__top">
                        <div>
                          <strong>{project.name}</strong>
                          <span>{project.domainLabel}</span>
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

                      <div className="project-admin-card__chips">
                        {project.tags.map((tag) => (
                          <span key={`${project.id}-${tag}`} className="chip">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <label className="field">
                        <span>رابط صورة معاينة مخصصة</span>
                        <input
                          type="url"
                          value={override.previewImage || ""}
                          onChange={(event) =>
                            updateProjectOverride(project.id, "previewImage", event.target.value)
                          }
                          placeholder="اتركه فارغاً لاستخدام المعاينة التلقائية"
                        />
                      </label>

                      <label className="field">
                        <span>وصف مخصص</span>
                        <textarea
                          rows="3"
                          value={override.description || ""}
                          onChange={(event) =>
                            updateProjectOverride(project.id, "description", event.target.value)
                          }
                          placeholder={project.description}
                        />
                      </label>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="projects-manager__empty">
              بعد حفظ التوكن بنجاح ستظهر هنا كل مشاريع Vercel لتتحكم بها.
            </p>
          )}
        </div>

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
            <p>{state.account.teamsCountLabel}</p>
          </div>
        </div>
      ) : null}

      {error ? <p className="feedback error">{error}</p> : null}
      {message ? <p className="feedback success">{message}</p> : null}
    </section>
  );
}
