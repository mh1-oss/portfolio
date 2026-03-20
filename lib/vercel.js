import { VERCEL_PROJECTS_PAGE_SIZE } from "@/lib/constants";
import { formatArabicDateTime, hashString } from "@/lib/utils";

const VERCEL_API_BASE = "https://api.vercel.com";

class VercelRequestError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = "VercelRequestError";
    this.statusCode = statusCode;
  }
}

function createScopedUrl(pathname, { teamId, teamSlug, limit, until } = {}) {
  const url = new URL(pathname, VERCEL_API_BASE);

  if (limit) {
    url.searchParams.set("limit", String(limit));
  }

  if (teamId) {
    url.searchParams.set("teamId", teamId);
  }

  if (teamSlug) {
    url.searchParams.set("slug", teamSlug);
  }

  if (until) {
    url.searchParams.set("until", String(until));
  }

  return url;
}

async function requestVercel(pathname, { token, teamId, teamSlug, limit, until } = {}) {
  const response = await fetch(createScopedUrl(pathname, { teamId, teamSlug, limit, until }), {
    headers: {
      Authorization: `Bearer ${token}`
    },
    cache: "no-store"
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new VercelRequestError(
      payload?.error?.message ||
        payload?.message ||
        "فشل الاتصال بواجهة Vercel الرسمية.",
      response.status
    );
  }

  return payload;
}

function getProjectPalette(seed) {
  const colors = [
    { accent: "#49c6ff", glow: "rgba(73, 198, 255, 0.38)" },
    { accent: "#7b8cff", glow: "rgba(123, 140, 255, 0.38)" },
    { accent: "#45e4b8", glow: "rgba(69, 228, 184, 0.34)" },
    { accent: "#ff9f67", glow: "rgba(255, 159, 103, 0.35)" },
    { accent: "#ff6d9c", glow: "rgba(255, 109, 156, 0.32)" }
  ];

  return colors[hashString(seed) % colors.length];
}

function normalizeDomainValue(value) {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object") {
    return value.domain || value.name || value.deploymentHostname || null;
  }

  return null;
}

function getReadyDeployment(project) {
  return (
    project.latestDeployments?.find((item) => item.readyState === "READY") ||
    project.latestDeployments?.[0] ||
    null
  );
}

function getProjectStatus(project) {
  const deployment = getReadyDeployment(project);
  const state = deployment?.readyState;

  switch (state) {
    case "READY":
      return "جاهز";
    case "BUILDING":
    case "INITIALIZING":
    case "QUEUED":
      return "قيد النشر";
    case "ERROR":
      return "بحاجة لمراجعة";
    case "CANCELED":
      return "ملغى";
    default:
      return "منشور";
  }
}

function extractProjectsList(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.projects)) {
    return payload.projects;
  }

  return [];
}

async function requestAllProjects({ token, teamId, teamSlug }) {
  const projects = [];
  const seenIds = new Set();
  let until = null;
  let pageCount = 0;

  while (pageCount < 50) {
    const payload = await requestVercel("/v10/projects", {
      token,
      teamId,
      teamSlug,
      limit: VERCEL_PROJECTS_PAGE_SIZE,
      until
    });

    const batch = extractProjectsList(payload);

    for (const project of batch) {
      const projectId = project?.id || project?.name;

      if (!projectId || seenIds.has(projectId)) {
        continue;
      }

      seenIds.add(projectId);
      projects.push(project);
    }

    const nextCursor = payload?.pagination?.next;

    if (!nextCursor || !batch.length) {
      break;
    }

    until = nextCursor;
    pageCount += 1;
  }

  return projects;
}

function buildProjectDescription(project) {
  const framework = project.framework || "مشروع ويب حديث";
  const repoName =
    project.link?.repo ||
    project.gitRepository?.repo ||
    project.linkedRepo?.repo ||
    null;

  if (repoName) {
    return `مشروع منشور على Vercel ومربوط بالمستودع ${repoName} باستخدام ${framework}.`;
  }

  return `مشروع منشور على Vercel ومهيأ للعمل باستخدام ${framework} مع تجربة نشر حديثة.`;
}

function buildProjectUrl(project) {
  const deployment = getReadyDeployment(project);
  const productionDomain =
    normalizeDomainValue(deployment?.aliasFinal) ||
    normalizeDomainValue(deployment?.alias?.[0]) ||
    normalizeDomainValue(project.targets?.production?.alias?.[0]) ||
    normalizeDomainValue(project.alias?.[0]) ||
    normalizeDomainValue(deployment?.url) ||
    normalizeDomainValue(deployment?.deploymentHostname) ||
    null;

  if (productionDomain) {
    return productionDomain.startsWith("http")
      ? productionDomain
      : `https://${productionDomain}`;
  }

  return project.name ? `https://${project.name}.vercel.app` : null;
}

function buildProjectPreviewImage(projectUrl) {
  if (!projectUrl) {
    return null;
  }

  return `https://image.thum.io/get/width/1200/crop/760/noanimate/${encodeURIComponent(projectUrl)}`;
}

export function mapVercelProject(project) {
  const palette = getProjectPalette(project.id || project.name || "project");
  const projectUrl = buildProjectUrl(project);
  const frameworkLabel = project.framework || "إطار غير محدد";
  const repoProvider =
    project.link?.type ||
    project.gitRepository?.type ||
    project.linkedRepo?.type ||
    "Vercel";

  return {
    id: project.id || project.name,
    name: project.name || "مشروع بدون اسم",
    description: buildProjectDescription(project),
    status: getProjectStatus(project),
    updatedAtLabel: formatArabicDateTime(project.updatedAt || project.createdAt || Date.now()),
    frameworkLabel,
    domainLabel: projectUrl ? new URL(projectUrl).host : "بانتظار النطاق",
    url: projectUrl,
    previewImage: buildProjectPreviewImage(projectUrl),
    tags: [frameworkLabel, repoProvider, project.publicSource ? "عام" : "خاص"],
    accentColor: palette.accent,
    glowColor: palette.glow,
    isPlaceholder: false
  };
}

function mapTeam(team) {
  return {
    id: team.id,
    slug: team.slug,
    name: team.name || team.slug || "فريق بدون اسم"
  };
}

export async function validateVercelConnection({ token, teamId, teamSlug }) {
  const [userPayload, teamsPayload, projectsPayload] = await Promise.all([
    requestVercel("/v2/user", { token }),
    requestVercel("/v2/teams", { token, limit: 20 }),
    requestAllProjects({ token, teamId, teamSlug })
  ]);

  const teams = Array.isArray(teamsPayload?.teams) ? teamsPayload.teams.map(mapTeam) : [];
  const user = userPayload?.user || {};
  const projects = Array.isArray(projectsPayload) ? projectsPayload.map(mapVercelProject) : [];
  const selectedTeam =
    teams.find((team) => team.id === teamId || team.slug === teamSlug) || null;

  return {
    projectsCount: projects.length,
    account: {
      ownerLabel: user.name || user.username || user.email || "حساب بدون اسم",
      scopeLabel: selectedTeam ? `فريق ${selectedTeam.name}` : "الحساب الشخصي",
      teamsCountLabel: teams.length
        ? `عدد الفرق المرتبطة: ${teams.length}`
        : "لا توجد فرق مرتبطة",
      teams,
      selectedTeam
    },
    preview: {
      projects
    }
  };
}

export async function fetchConnectedProjects(config) {
  const token = config?.token;

  if (!token) {
    return [];
  }

  const projects = await requestAllProjects({
    token,
    teamId: config.teamId,
    teamSlug: config.teamSlug
  });

  return projects.map(mapVercelProject);
}
