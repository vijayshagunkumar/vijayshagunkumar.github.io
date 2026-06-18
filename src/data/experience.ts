import { getContent } from "../content/contentStore";
import { normalizeBulletList, normalizePlainText } from "../utils/textFormatting";

export const experience = getContent("experience").experience.map((item) => ({
  ...item,
  company: normalizePlainText(item.company),
  role: normalizePlainText(item.role),
  period: normalizePlainText(item.period),
  summary: normalizePlainText(item.summary),
  achievements: normalizeBulletList(item.achievements),
  tags: normalizeBulletList(item.tags)
}));
