import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { DEFAULT_PORTFOLIO_SETTINGS, DEFAULT_CV_SETTINGS } from "@/lib/constants";
import {
  readConfig,
  sanitizeConfig,
  writeConfig
} from "@/lib/storage";
import { fetchConnectedProjects, validateVercelConnection } from "@/lib/vercel";
import {
  normalizeHiddenProjectIds,
  normalizeProjectOverrides
} from "@/lib/project-settings";

async function buildAdminState(config) {
  if (!config?.token) {
    return sanitizeConfig(config);
  }

  try {
    const projects = await fetchConnectedProjects(config);
    const nextConfig = {
      ...config,
      cachedProjects: projects
    };

    return sanitizeConfig(nextConfig, projects);
  } catch {
    return sanitizeConfig(config);
  }
}

export async function GET() {
  const authorized = await requireAdminSession();

  if (!authorized) {
    return NextResponse.json(
      { ok: false, message: "جلسة الإدارة منتهية أو غير موجودة." },
      { status: 401 }
    );
  }

  const state = await buildAdminState(await readConfig());

  return NextResponse.json({
    ok: true,
    state
  });
}

export async function POST(request) {
  const authorized = await requireAdminSession();

  if (!authorized) {
    return NextResponse.json(
      { ok: false, message: "جلسة الإدارة منتهية أو غير موجودة." },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json(
      { ok: false, message: "تعذر قراءة البيانات المرسلة." },
      { status: 400 }
    );
  }

  const currentConfig = await readConfig();
  const token = body.token?.trim() || currentConfig.token;
  const teamId = body.teamId?.trim() || "";
  const teamSlug = body.teamSlug?.trim() || "";
  const hiddenProjectIds = normalizeHiddenProjectIds(body.hiddenProjectIds);
  const projectOverrides = normalizeProjectOverrides(body.projectOverrides);

  if (!token) {
    return NextResponse.json(
      { ok: false, message: "أدخل توكن Vercel صالحاً قبل الحفظ." },
      { status: 400 }
    );
  }

  try {
    const connection = await validateVercelConnection({
      token,
      teamId,
      teamSlug
    });

    const nextConfig = {
      token,
      teamId,
      teamSlug,
      account: {
        ...connection.account
      },
      hiddenProjectIds,
      projectOverrides,
      cachedProjects: connection.preview.projects,
      portfolio: {
        brandName: body.portfolio?.brandName?.trim() || DEFAULT_PORTFOLIO_SETTINGS.brandName,
        heroPrefix:
          body.portfolio?.heroPrefix?.trim() || DEFAULT_PORTFOLIO_SETTINGS.heroPrefix,
        heroHighlight:
          body.portfolio?.heroHighlight?.trim() || DEFAULT_PORTFOLIO_SETTINGS.heroHighlight,
        bio: body.portfolio?.bio?.trim() || DEFAULT_PORTFOLIO_SETTINGS.bio,
        contactTitle:
          body.portfolio?.contactTitle?.trim() || DEFAULT_PORTFOLIO_SETTINGS.contactTitle,
        contactText:
          body.portfolio?.contactText?.trim() || DEFAULT_PORTFOLIO_SETTINGS.contactText,
        contactEmail:
          body.portfolio?.contactEmail?.trim() || DEFAULT_PORTFOLIO_SETTINGS.contactEmail,
        siteUrl: body.portfolio?.siteUrl?.trim() || ""
      },
      cv: {
        education: body.cv?.education || DEFAULT_CV_SETTINGS.education,
        experience: body.cv?.experience || DEFAULT_CV_SETTINGS.experience,
        skills: body.cv?.skills || DEFAULT_CV_SETTINGS.skills,
        languages: body.cv?.languages || DEFAULT_CV_SETTINGS.languages
      },
      updatedAt: new Date().toISOString()
    };

    await writeConfig(nextConfig);

    return NextResponse.json({
      ok: true,
      message: `تم حفظ الربط وجلب ${connection.projectsCount} مشروع/مشاريع بنجاح.`,
      state: await buildAdminState(nextConfig)
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error.message || "حدث خطأ أثناء التحقق من حساب Vercel."
      },
      { status: error.statusCode || 500 }
    );
  }
}

export async function DELETE() {
  const authorized = await requireAdminSession();

  if (!authorized) {
    return NextResponse.json(
      { ok: false, message: "جلسة الإدارة منتهية أو غير موجودة." },
      { status: 401 }
    );
  }

  await writeConfig({
    token: "",
    teamId: "",
    teamSlug: "",
    account: null,
    hiddenProjectIds: [],
    projectOverrides: {},
    cachedProjects: [],
    portfolio: { ...DEFAULT_PORTFOLIO_SETTINGS },
    updatedAt: new Date().toISOString()
  });

  return NextResponse.json({
    ok: true,
    message: "تم فصل الحساب وإعادة الإعدادات الافتراضية."
  });
}
