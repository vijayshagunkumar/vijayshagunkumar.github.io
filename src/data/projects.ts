import { getContent } from "../content/contentStore";
import { normalizeBulletList, normalizePlainText } from "../utils/textFormatting";

const projectsContent = getContent("projects");

export type ProjectCategory = "Enterprise" | "AI" | "Product Management" | "Finance/Tax Tech";

export type CaseStudy = {
  problem: string;
  plainEnglish?: string;
  approach: string[];
  results: Array<{ value: string; label: string }>;
};

export type Project = {
  id: string;
  title: string;
  organization: string;
  description: string;
  plainEnglish?: string;
  metric: string;
  tags: string[];
  categories: ProjectCategory[];
  featured?: boolean;
  liveUrl?: string;
  githubUrl?: string;
  caseStudy?: CaseStudy;
};

export const projectCategories = projectsContent.projectCategories as Array<"All" | ProjectCategory>;
export const projects = (projectsContent.projects as Project[]).map((project) => ({
  ...project,
  title: normalizePlainText(project.title),
  organization: normalizePlainText(project.organization),
  description: normalizePlainText(project.description),
  plainEnglish: project.plainEnglish ? normalizePlainText(project.plainEnglish) : undefined,
  metric: normalizePlainText(project.metric),
  tags: normalizeBulletList(project.tags),
  caseStudy: project.caseStudy
    ? {
        ...project.caseStudy,
        problem: normalizePlainText(project.caseStudy.problem),
        plainEnglish: project.caseStudy.plainEnglish ? normalizePlainText(project.caseStudy.plainEnglish) : undefined,
        approach: normalizeBulletList(project.caseStudy.approach),
        results: project.caseStudy.results.map((result) => ({
          value: normalizePlainText(result.value),
          label: normalizePlainText(result.label)
        }))
      }
    : undefined
}));
