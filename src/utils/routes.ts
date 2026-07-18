export const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export function appPath(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${basePath}${normalizedPath}` || "/";
}

export function sectionHref(section: string) {
  return `${appPath("/")}#${section}`;
}
