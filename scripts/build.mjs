/**
 * Build script for the statusline plugin
 * Compiles TypeScript and prepares distribution files
 */

import { copyFile, mkdir, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

const sourceDir = join(rootDir, "plugins", "statusline", "src");
const distDir = join(rootDir, "plugins", "statusline", "dist");

async function build() {
  console.log("Building Claude Statusline...");

  // Ensure dist directory exists
  if (!existsSync(distDir)) {
    await mkdir(distDir, { recursive: true });
  }

  // Copy package.json to dist for npm compatibility
  const pkgSource = join(rootDir, "package.json");
  const pkgDest = join(distDir, "package.json");

  try {
    await copyFile(pkgSource, pkgDest);
    console.log("✓ Copied package.json");
  } catch (err) {
    console.warn("  Could not copy package.json:", err.message);
  }

  // Copy defaults.json to dist
  const defaultsSource = join(rootDir, "plugins", "statusline", "defaults.json");
  const defaultsDest = join(distDir, "defaults.json");

  try {
    await copyFile(defaultsSource, defaultsDest);
    console.log("✓ Copied defaults.json");
  } catch (err) {
    console.warn("  Could not copy defaults.json:", err.message);
  }

  // Create a simple .npmrc for proper publishing
  const npmrcContent = "";
  await writeFile(join(distDir, ".npmrc"), npmrcContent);

  console.log("\nBuild complete!");
  console.log(`Output: ${distDir}`);
}

build().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
