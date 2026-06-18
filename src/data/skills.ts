import { getContent } from "../content/contentStore";

const skillsContent = getContent("skills");

export const skillGroups = skillsContent.skillGroups;
export const domains = skillsContent.domains;
