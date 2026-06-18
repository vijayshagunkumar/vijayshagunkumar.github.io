import { copyFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const distDir = "dist";
const indexPath = join(distDir, "index.html");
const adminDir = join(distDir, "admin");
const workflowsDir = join(distDir, ".github", "workflows");

await mkdir(adminDir, { recursive: true });
await copyFile(indexPath, join(adminDir, "index.html"));
await copyFile(indexPath, join(distDir, "404.html"));
await mkdir(workflowsDir, { recursive: true });
await copyFile(join(".github", "workflows", "publish-portfolio.yml"), join(workflowsDir, "publish-portfolio.yml"));
