import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { DEFAULT_PORTFOLIO_SETTINGS, DEFAULT_CV_SETTINGS } from "@/lib/constants";
import {
  applyProjectSettings,
  normalizeHiddenProjectIds,
  normalizeProjectOverrides
} from "@/lib/project-settings";
import { formatArabicDate, maskToken } from "@/lib/utils";

import { getSetting, setSetting, initDb } from "@/lib/db";

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
    cv: { ...DEFAULT_CV_SETTINGS },
    updatedAt: null
  };
}

function normalizeConfig(parsed) {
  return {
    ...getDefaultConfig(),
    ...parsed,
    hiddenProjectIds: normalizeHiddenProjectIds(parsed?.hiddenProjectIds),
    projectOverrides: normalizeProjectOverrides(parsed?.projectOverrides),
    cachedProjects: Array.isArray(parsed?.cachedProjects) ? parsed.cachedProjects : [],
    portfolio: {
      ...DEFAULT_PORTFOLIO_SETTINGS,
      ...(parsed?.portfolio || {})
    },
    cv: {
      ...DEFAULT_CV_SETTINGS,
      ...(parsed?.cv || {})
    }
  };
}

export async function readConfig() {
  // 1. Try Neon Database first
  try {
    const dbConfig = await getSetting("admin_config");
    if (dbConfig) {
      return normalizeConfig(dbConfig);
    }
  } catch (error) {
    console.warn("Neon read failed, falling back to local storage:", error.message);
  }

  // 2. Fallback to Local JSON
  try {
    const raw = await readFile(CONFIG_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return normalizeConfig(parsed);
  } catch (error) {
    if (error.code === "ENOENT") {
      return getDefaultConfig();
    }
    throw error;
  }
}

export async function writeConfig(config) {
  // 1. Save to Neon Database
  try {
    await initDb();
    await setSetting("admin_config", config);
  } catch (error) {
    console.error("Neon write failed:", error.message);
  }

  // 2. Always save to Local JSON for backup/cache
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
    },
    cv: {
      ...DEFAULT_CV_SETTINGS,
      ...(config?.cv || {})
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
    cv: normalizedConfig.cv,
    updatedAt: normalizedConfig.updatedAt,
    updatedAtLabel: formatArabicDate(normalizedConfig.updatedAt)
  };
}

export async function getSanitizedConfig() {
  const config = await readConfig();
  return sanitizeConfig(config);
}
