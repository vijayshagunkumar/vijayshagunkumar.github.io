import { getContent } from "../content/contentStore";
import { normalizeBulletList, normalizePlainText } from "../utils/textFormatting";

export type PersonalProject = {
  id: string;
  name: string;
  valueProposition: string;
  problemSolved: string;
  targetUsers: string;
  solution?: string;
  whyItMatters?: string;
  highlights: string[];
  techHighlights: string[];
  techStack?: string[];
  status: string;
  liveUrl?: string;
  githubUrl?: string;
  availability?: string;
};

export const personalProjects = (getContent("personalProjects").personalProjects as PersonalProject[]).map((project) => ({
  ...project,
  name: normalizePlainText(project.name),
  valueProposition: normalizePlainText(project.valueProposition),
  problemSolved: normalizePlainText(project.problemSolved),
  targetUsers: normalizePlainText(project.targetUsers),
  solution: project.solution ? normalizePlainText(project.solution) : undefined,
  whyItMatters: project.whyItMatters ? normalizePlainText(project.whyItMatters) : undefined,
  highlights: normalizeBulletList(project.highlights),
  techHighlights: normalizeBulletList(project.techHighlights),
  techStack: project.techStack ? normalizeBulletList(project.techStack) : undefined,
  status: normalizePlainText(project.status),
  availability: project.availability ? normalizePlainText(project.availability) : undefined
}));
