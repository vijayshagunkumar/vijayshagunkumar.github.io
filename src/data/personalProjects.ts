import { getContent } from "../content/contentStore";

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

export const personalProjects = getContent("personalProjects").personalProjects as PersonalProject[];
