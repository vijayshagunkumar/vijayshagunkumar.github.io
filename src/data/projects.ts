import { getContent } from "../content/contentStore";

const projectsContent = getContent("projects");

export type ProjectCategory = "Enterprise" | "AI" | "Product Management" | "Finance/Tax Tech";

export type CaseStudy = {
  problem: string;
  approach: string[];
  results: Array<{ value: string; label: string }>;
};

export type Project = {
  id: string;
  title: string;
  organization: string;
  description: string;
  metric: string;
  tags: string[];
  categories: ProjectCategory[];
  featured?: boolean;
  liveUrl?: string;
  githubUrl?: string;
  caseStudy?: CaseStudy;
};

export const projectCategories = projectsContent.projectCategories as Array<"All" | ProjectCategory>;
export const projects = projectsContent.projects as Project[];
