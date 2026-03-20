function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeHiddenProjectIds(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.filter((item) => typeof item === "string" && item.trim()))];
}

export function normalizeProjectOverrides(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.entries(value).reduce((result, [projectId, entry]) => {
    if (!projectId || !entry || typeof entry !== "object") {
      return result;
    }

    const previewImage = normalizeString(entry.previewImage);
    const description = normalizeString(entry.description);

    if (!previewImage && !description) {
      return result;
    }

    result[projectId] = {
      previewImage,
      description
    };

    return result;
  }, {});
}

export function applyProjectSettings(projects, config) {
  const hiddenIds = new Set(normalizeHiddenProjectIds(config?.hiddenProjectIds));
  const overrides = normalizeProjectOverrides(config?.projectOverrides);

  const managedProjects = projects.map((project) => {
    const override = overrides[project.id] || {};

    return {
      ...project,
      description: override.description || project.description,
      previewImage: override.previewImage || project.previewImage || null,
      hidden: hiddenIds.has(project.id),
      hasCustomPreview: Boolean(override.previewImage),
      hasCustomDescription: Boolean(override.description)
    };
  });

  return {
    hiddenProjectIds: [...hiddenIds],
    projectOverrides: overrides,
    managedProjects,
    visibleProjects: managedProjects.filter((project) => !project.hidden),
    hiddenProjectsCount: managedProjects.filter((project) => project.hidden).length
  };
}
