import { getContent } from "../content/contentStore";
import { normalizePlainText } from "../utils/textFormatting";

export type ThemeName = "navy-teal" | "light-executive" | "dark-elegant" | "minimal-recruiter";

export const themes: Array<{ id: ThemeName; label: string }> = [
  { id: "navy-teal", label: "Professional Navy/Teal" },
  { id: "light-executive", label: "Light Executive" },
  { id: "dark-elegant", label: "Dark Elegant" },
  { id: "minimal-recruiter", label: "Minimal Recruiter" }
];

const heroContent = getContent("hero");
const aboutContent = getContent("about");
const metricsContent = getContent("metrics");
const contactContent = getContent("contact");

function buildExecutiveSummary(profile: typeof heroContent.profile) {
  const preserveParagraphs = Boolean(profile.preserveSummaryParagraphs);
  const source = Array.isArray(profile.executiveSummary) && profile.executiveSummary.length
    ? profile.executiveSummary.join(preserveParagraphs ? "\n" : " ")
    : profile.summary ?? "";

  if (!preserveParagraphs) return [normalizePlainText(source)].filter(Boolean);

  return source
    .split(/\n{2,}/)
    .map(normalizePlainText)
    .filter(Boolean);
}

export const profile = {
  ...heroContent.profile,
  summary: normalizePlainText(heroContent.profile.summary ?? ""),
  executiveSummary: buildExecutiveSummary(heroContent.profile),
  narrative: aboutContent.narrative.map(normalizePlainText),
  highlights: aboutContent.highlights.map(normalizePlainText),
  links: {
    ...contactContent.links,
    resume: contactContent.resumePath || contactContent.links.resume
  }
};

export const profilePhoto = contactContent.profilePhotoPath || heroContent.profilePhoto || "/profile-photo.jpg";
export const impactMetrics = metricsContent.impactMetrics;
export const resultMetrics = metricsContent.resultMetrics;
export const scopeOfInfluence = aboutContent.scopeOfInfluence;
export const impactBullets = metricsContent.impactBullets;
export const journey = aboutContent.journey;
