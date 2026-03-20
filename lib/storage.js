import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { DEFAULT_PORTFOLIO_SETTINGS } from "@/lib/constants";
import {
  applyProjectSettings,
  normalizeHiddenProjectIds,
  normalizeProjectOverrides
} from "@/lib/project-settings";
import { formatArabicDate, maskToken } from "@/lib/utils";

const DATA_DIRECTORY = path.join(process.cwd(), ".data");
const CONFIG_PATH = path.join(DATA_DIRECTORY, "vercel-portfolio.json");

function getDefaultConfig() {
  return {
    token: "",
    teamId: "",
    teamSlug: "",
    account: null,
    hiddenProjectIds: [],
    projectOverrides: {},
    cachedProjects: [],
    portfolio: { ...DEFAULT_PORTFOLIO_SETTINGS },
    updatedAt: null
  };
}

export async function readConfig() {
  try {
    const raw = await readFile(CONFIG_PATH, "utf8");
    const parsed = JSON.parse(raw);

    return {
      ...getDefaultConfig(),
      ...parsed,
      hiddenProjectIds: normalizeHiddenProjectIds(parsed?.hiddenProjectIds),
      projectOverrides: normalizeProjectOverrides(parsed?.projectOverrides),
      cachedProjects: Array.isArray(parsed?.cachedProjects) ? parsed.cachedProjects : [],
      portfolio: {
        ...DEFAULT_PORTFOLIO_SETTINGS,
        ...(parsed?.portfolio || {})
      }
    };
  } catch (error) {
    if (error.code === "ENOENT") {
      return getDefaultConfig();
    }

    throw error;
  }
}

export async function writeConfig(config) {
  await mkdir(DATA_DIRECTORY, { recursive: true });
  await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), "utf8");
  return config;
}

export function sanitizeConfig(config, projects = null) {
  const normalizedConfig = {
    ...getDefaultConfig(),
    ...config,
    hiddenProjectIds: normalizeHiddenProjectIds(config?.hiddenProjectIds),
    projectOverrides: normalizeProjectOverrides(config?.projectOverrides),
    cachedProjects: Array.isArray(config?.cachedProjects) ? config.cachedProjects : [],
    portfolio: {
      ...DEFAULT_PORTFOLIO_SETTINGS,
      ...(config?.portfolio || {})
    }
  };

  const sourceProjects = Array.isArray(projects)
    ? projects
    : normalizedConfig.cachedProjects;
  const projectState = applyProjectSettings(sourceProjects, normalizedConfig);

  return {
    hasToken: Boolean(normalizedConfig.token),
    tokenMask: normalizedConfig.token ? maskToken(normalizedConfig.token) : "",
    teamId: normalizedConfig.teamId || "",
    teamSlug: normalizedConfig.teamSlug || "",
    account: normalizedConfig.account,
    hiddenProjectIds: projectState.hiddenProjectIds,
    projectOverrides: projectState.projectOverrides,
    projects: projectState.managedProjects,
    projectsCount: projectState.managedProjects.length,
    visibleProjectsCount: projectState.visibleProjects.length,
    hiddenProjectsCount: projectState.hiddenProjectsCount,
    portfolio: normalizedConfig.portfolio,
    updatedAt: normalizedConfig.updatedAt,
    updatedAtLabel: formatArabicDate(normalizedConfig.updatedAt)
  };
}

export async function getSanitizedConfig() {
  const config = await readConfig();
  return sanitizeConfig(config);
}
