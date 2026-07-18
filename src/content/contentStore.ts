import aboutDefault from "./about.json";
import awardsDefault from "./awards.json";
import certificationsDefault from "./certifications.json";
import contactDefault from "./contact.json";
import educationDefault from "./education.json";
import experienceDefault from "./experience.json";
import heroDefault from "./hero.json";
import metricsDefault from "./metrics.json";
import personalProjectsDefault from "./personalProjects.json";
import projectsDefault from "./projects.json";
import skillsDefault from "./skills.json";

export const contentDefaults = {
  hero: heroDefault,
  metrics: metricsDefault,
  about: aboutDefault,
  skills: skillsDefault,
  experience: experienceDefault,
  projects: projectsDefault,
  personalProjects: personalProjectsDefault,
  certifications: certificationsDefault,
  education: educationDefault,
  awards: awardsDefault,
  contact: contactDefault
};

export type ContentKey = keyof typeof contentDefaults;

export const contentSections: Array<{ key: ContentKey; label: string; file: string }> = [
  { key: "hero", label: "Hero", file: "hero.json" },
  { key: "metrics", label: "Metrics", file: "metrics.json" },
  { key: "about", label: "About / Scope of Influence", file: "about.json" },
  { key: "skills", label: "Skills / Competencies", file: "skills.json" },
  { key: "experience", label: "Experience", file: "experience.json" },
  { key: "projects", label: "Corporate Projects", file: "projects.json" },
  { key: "personalProjects", label: "Products I've Built", file: "personalProjects.json" },
  { key: "certifications", label: "Certifications", file: "certifications.json" },
  { key: "education", label: "Education", file: "education.json" },
  { key: "awards", label: "Awards", file: "awards.json" },
  { key: "contact", label: "Contact / Resume / Profile Photo", file: "contact.json" }
];

const storagePrefix = "portfolio-content:";

export const contentStorageKey = (key: ContentKey) => `${storagePrefix}${key}`;

function shouldUseLocalContent() {
  if (typeof window === "undefined") return false;
  const path = window.location.pathname.replace(/\/$/, "");
  const params = new URLSearchParams(window.location.search);
  return path.endsWith("/admin") || params.get("studioPreview") === "1";
}

export function getContent<K extends ContentKey>(key: K): (typeof contentDefaults)[K] {
  if (typeof window === "undefined") return contentDefaults[key];
  if (!shouldUseLocalContent()) return contentDefaults[key];

  const stored = window.localStorage.getItem(contentStorageKey(key));
  if (!stored) return contentDefaults[key];

  try {
    return JSON.parse(stored) as (typeof contentDefaults)[K];
  } catch {
    return contentDefaults[key];
  }
}

export function saveContent(key: ContentKey, value: unknown) {
  window.localStorage.setItem(contentStorageKey(key), JSON.stringify(value, null, 2));
}

export function resetContent(key: ContentKey) {
  window.localStorage.removeItem(contentStorageKey(key));
}

export function resetAllContent() {
  contentSections.forEach((section) => resetContent(section.key));
}

export function getAllContent() {
  return Object.fromEntries(contentSections.map((section) => [section.key, getContent(section.key)]));
}

export function hasLocalContent(key: ContentKey) {
  return typeof window !== "undefined" && window.localStorage.getItem(contentStorageKey(key)) !== null;
}
