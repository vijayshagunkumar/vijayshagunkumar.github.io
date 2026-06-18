import { copyFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const distDir = "dist";
const indexPath = join(distDir, "index.html");
const adminDir = join(distDir, "admin");

await mkdir(adminDir, { recursive: true });
await copyFile(indexPath, join(adminDir, "index.html"));
await copyFile(indexPath, join(distDir, "404.html"));
