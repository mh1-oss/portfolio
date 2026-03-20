import { DEFAULT_PORTFOLIO_SETTINGS, DEFAULT_CV_SETTINGS } from "@/lib/constants";
import { applyProjectSettings } from "@/lib/project-settings";
import { readConfig } from "@/lib/storage";
import { fetchConnectedProjects } from "@/lib/vercel";
import { formatArabicDateTime, hashString } from "@/lib/utils";

function getPlaceholderPalette(seed) {
  const palettes = [
    { accentColor: "#49c6ff", glowColor: "rgba(73, 198, 255, 0.34)" },
    { accentColor: "#ff9f67", glowColor: "rgba(255, 159, 103, 0.34)" },
    { accentColor: "#72f1b8", glowColor: "rgba(114, 241, 184, 0.3)" },
    { accentColor: "#8995ff", glowColor: "rgba(137, 149, 255, 0.32)" }
  ];

  return palettes[hashString(seed) % palettes.length];
}

function createPlaceholderProjects() {
  return [
    {
      id: "placeholder-1",
      name: "سيظهر مشروعك الأول هنا",
      description: "بعد إدخال توكن Vercel من لوحة الأدمن المخفية، سيتم سحب المشاريع الحقيقية تلقائياً.",
      status: "بانتظار الربط",
      updatedAtLabel: "بعد الحفظ مباشرة",
      frameworkLabel: "Next.js",
      domainLabel: "بدون نطاق حالياً",
      url: null,
      previewImage: null,
      tags: ["واجهة عربية", "ربط Vercel", "جاهز للتخصيص"],
      ...getPlaceholderPalette("placeholder-1"),
      isPlaceholder: true
    },
    {
      id: "placeholder-2",
      name: "بطاقات ديناميكية للمشاريع",
      description: "كل بطاقة سيتم بناؤها من اسم المشروع وإطاره ورابطه الفعلي بدلاً من نصوص ثابتة.",
      status: "عرض تجريبي",
      updatedAtLabel: "بانتظار الاتصال",
      frameworkLabel: "Vercel API",
      domainLabel: "سيظهر النطاق هنا",
      url: null,
      previewImage: null,
      tags: ["API", "RTL", "تصميم حديث"],
      ...getPlaceholderPalette("placeholder-2"),
      isPlaceholder: true
    },
    {
      id: "placeholder-3",
      name: "إدارة عربية كاملة",
      description: "يمكنك تعديل العناوين والنصوص والبريد الإلكتروني من نفس لوحة الإدارة بدون لمس الكود.",
      status: "جاهز",
      updatedAtLabel: "بعد تسجيل الدخول",
      frameworkLabel: "لوحة أدمن",
      domainLabel: "إعدادات قابلة للتغيير",
      url: null,
      previewImage: null,
      tags: ["إعدادات", "محتوى", "سرّي"],
      ...getPlaceholderPalette("placeholder-3"),
      isPlaceholder: true
    }
  ];
}

function createAllHiddenProjectsPlaceholder(totalProjects) {
  return [
    {
      id: "hidden-projects-placeholder",
      name: "كل المشاريع مخفية حالياً",
      description: `تم العثور على ${totalProjects} مشروع/مشاريع، لكنك أخفيتها من لوحة الأدمن. يمكنك إظهار ما تريد منها في أي وقت.`,
      status: "مخفي",
      updatedAtLabel: "من لوحة الأدمن",
      frameworkLabel: "إدارة المشاريع",
      domainLabel: "لا توجد مشاريع ظاهرة حالياً",
      url: null,
      previewImage: null,
      tags: ["إخفاء المشاريع", "لوحة الأدمن", "قابل للتعديل"],
      ...getPlaceholderPalette("hidden-projects"),
      isPlaceholder: true
    }
  ];
}


export async function getPortfolioSnapshot() {
  const config = await readConfig();
  const portfolio = {
    ...DEFAULT_PORTFOLIO_SETTINGS,
    ...(config.portfolio || {})
  };
  const cv = {
    ...DEFAULT_CV_SETTINGS,
    ...(config.cv || {})
  };

  if (!config.token) {
    return {
      portfolio,
      cv,
      projects: createPlaceholderProjects(),
      connection: {
        connected: false,
        scopeLabel: "غير مرتبط",
        message: "لا يوجد حساب Vercel مربوط بعد. افتح لوحة الأدمن المخفية وأدخل التوكن."
      },
      metrics: {
        projectsCountLabel: "0",
        totalProjectsCountLabel: "0",
        hiddenProjectsCountLabel: "0",
        scopeLabel: "غير مرتبط",
        updatedAtLabel: "بانتظار أول ربط"
      }
    };
  }

  try {
    const projects = await fetchConnectedProjects(config);
    const projectState = applyProjectSettings(projects, config);
    const lastUpdated = config.updatedAt || new Date().toISOString();
    const renderedProjects = projectState.visibleProjects.length
      ? projectState.visibleProjects
      : projects.length
        ? createAllHiddenProjectsPlaceholder(projects.length)
        : createPlaceholderProjects();
    const hiddenMessage = projectState.hiddenProjectsCount
      ? ` وتم إخفاء ${projectState.hiddenProjectsCount} مشروع/مشاريع من لوحة الأدمن.`
      : "";

    return {
      portfolio,
      cv,
      projects: renderedProjects,
      connection: {
        connected: true,
        scopeLabel: config.account?.scopeLabel || "الحساب الشخصي",
        message: projects.length
          ? `تم جلب ${projects.length} مشروع/مشاريع من Vercel بنجاح.${hiddenMessage}`
          : "تم الربط، لكن لم يتم العثور على مشاريع ضمن هذا النطاق."
      },
      metrics: {
        projectsCountLabel: String(projectState.visibleProjects.length),
        totalProjectsCountLabel: String(projects.length),
        hiddenProjectsCountLabel: String(projectState.hiddenProjectsCount),
        scopeLabel: config.account?.scopeLabel || "الحساب الشخصي",
        updatedAtLabel: formatArabicDateTime(lastUpdated)
      }
    };
  } catch (error) {
    return {
      portfolio,
      projects: createPlaceholderProjects(),
      connection: {
        connected: false,
        scopeLabel: config.account?.scopeLabel || "تم حفظ الربط",
        message: error.message || "تعذر جلب المشاريع حالياً من Vercel."
      },
      metrics: {
        projectsCountLabel: "0",
        totalProjectsCountLabel: "0",
        hiddenProjectsCountLabel: "0",
        scopeLabel: config.account?.scopeLabel || "تم حفظ الربط",
        updatedAtLabel: formatArabicDateTime(config.updatedAt)
      }
    };
  }
}
