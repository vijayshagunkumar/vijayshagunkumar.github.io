export type TextFieldType = "plainText" | "paragraphText" | "bulletList";

const brandCasing: Array<[RegExp, string]> = [
  [/\becommerce\b/gi, "eCommerce"],
  [/\bott\b/gi, "OTT"],
  [/\bretail\b/gi, "Retail"],
  [/\bfinance\b/gi, "Finance"],
  [/\bglobal tax technology\b/gi, "Global Tax Technology"],
  [/\bdell\b/gi, "Dell"],
  [/\bbigflix\b/gi, "BigFlix"],
  [/\boracle fusion erp\b/gi, "Oracle Fusion ERP"],
  [/\btr onesource cloud\b/gi, "TR OneSource Cloud"],
  [/\bcertifytax\b/gi, "CERTifyTax"],
  [/\bthomson reuters\b/gi, "Thomson Reuters"],
  [/\bdeloitte\b/gi, "Deloitte"],
  [/\bgithub\b/gi, "GitHub"],
  [/\blinkedin\b/gi, "LinkedIn"]
];

export function applyBrandCasing(text: string) {
  return brandCasing.reduce((value, [pattern, replacement]) => value.replace(pattern, replacement), text);
}

export function normalizePlainText(text: string) {
  return applyBrandCasing(
    text
      .replace(/\r\n?/g, "\n")
      .replace(/\n+/g, " ")
      .replace(/[ \t]+/g, " ")
      .trim()
  );
}

export function normalizeParagraphText(text: string, preserveParagraphBreaks = false) {
  const normalized = text
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!preserveParagraphBreaks) return normalizePlainText(normalized);

  return normalized
    .split(/\n{2,}/)
    .map(normalizePlainText)
    .filter(Boolean)
    .join("\n\n");
}

export function normalizeBulletList(items: string[]) {
  return items.map(normalizePlainText).filter(Boolean);
}

export function hasUnsafeLineBreaks(text: string) {
  return (text.match(/\n/g) ?? []).length > 1;
}

export function normalizeTextForField(text: string, type: TextFieldType, preserveParagraphBreaks = false) {
  if (type === "paragraphText") return normalizeParagraphText(text, preserveParagraphBreaks);
  return normalizePlainText(text);
}
