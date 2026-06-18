import { getContent } from "../content/contentStore";
import { normalizeBulletList, normalizePlainText } from "../utils/textFormatting";

export type PersonalProject = {
  id: string;
  name: string;
  valueProposition: string;
  problemSolved: string;
  targetUsers: string;
  highlights: string[];
  techHighlights: string[];
  status: string;
  liveUrl: string;
  githubUrl?: string;
};

export const personalProjects = (getContent("personalProjects").personalProjects as PersonalProject[]).map((project) => ({
  ...project,
  name: normalizePlainText(project.name),
  valueProposition: normalizePlainText(project.valueProposition),
  problemSolved: normalizePlainText(project.problemSolved),
  targetUsers: normalizePlainText(project.targetUsers),
  highlights: normalizeBulletList(project.highlights),
  techHighlights: normalizeBulletList(project.techHighlights),
  status: normalizePlainText(project.status)
}));
