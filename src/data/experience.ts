import { getContent } from "../content/contentStore";
import { normalizeBulletList, normalizePlainText } from "../utils/textFormatting";

export const experience = getContent("experience").experience.map((item) => ({
  ...item,
  company: normalizePlainText(item.company),
  role: normalizePlainText(item.role),
  period: normalizePlainText(item.period),
  summary: normalizePlainText(item.summary),
  achievements: normalizeBulletList(item.achievements),
  tags: normalizeBulletList(item.tags),
  details: item.details
    ? {
        overview: normalizePlainText(item.details.overview),
        flagshipAchievement: item.details.flagshipAchievement ? normalizePlainText(item.details.flagshipAchievement) : undefined,
        scope: normalizeBulletList(item.details.scope),
        responsibilities: normalizeBulletList(item.details.responsibilities),
        impact: normalizeBulletList(item.details.impact),
        tools: normalizeBulletList(item.details.tools)
      }
    : undefined
}));
