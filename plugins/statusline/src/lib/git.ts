/**
 * Cross-platform Git status detection
 * Works on Windows, macOS, and Linux
 */

import { execSync } from "child_process";
import type { ExecSyncOptions } from "child_process";
import type { GitStatus } from "./types.js";

// Re-export GitStatus for convenience
export type { GitStatus } from "./types.js";

/**
 * Execute a git command cross-platform
 */
function execGit(cwd: string, command: string): string {
  try {
    // Windows: use shell, redirect stderr to null
    // Unix: use shell, redirect stderr to /dev/null
    const redirect = process.platform === "win32" ? "2>nul" : "2>/dev/null";
    const fullCommand = `${command} ${redirect}`;

    const options: any = {
      cwd,
      shell: true,
    };
    // Only add windowsHide on Windows
    if (process.platform === "win32") {
      options.windowsHide = true;
    }

    const result = execSync(fullCommand, options) as unknown as Buffer;
    return result.toString("utf-8").trim();
  } catch {
    return "";
  }
}

/**
 * Check if a command execution succeeded
 */
function execGitQuiet(cwd: string, command: string): { exitCode: number; stdout: string } {
  try {
    const redirect = process.platform === "win32" ? "2>nul" : "2>/dev/null";
    const fullCommand = `${command} ${redirect}`;

    const options: any = {
      cwd,
      shell: true,
    };
    // Only add windowsHide on Windows
    if (process.platform === "win32") {
      options.windowsHide = true;
    }

    const result = execSync(fullCommand, options) as unknown as Buffer;
    const stdout = result.toString("utf-8").trim();
    return { exitCode: 0, stdout };
  } catch (error: any) {
    return { exitCode: error?.status || 1, stdout: "" };
  }
}

/**
 * Get git repository root
 */
function getGitRoot(cwd: string): string {
  const result = execGit(cwd, "git rev-parse --show-toplevel");
  return result || cwd;
}

/**
 * Get current git branch
 */
function getGitBranch(cwd: string): string {
  const result = execGit(cwd, "git branch --show-current");
  return result || "detached";
}

/**
 * Check if there are any changes
 */
function hasChanges(cwd: string): boolean {
  const diffCheck = execGitQuiet(cwd, "git diff-index --quiet HEAD --");
  const cachedCheck = execGitQuiet(cwd, "git diff-index --quiet --cached HEAD --");

  return diffCheck.exitCode !== 0 || cachedCheck.exitCode !== 0;
}

/**
 * Parse git diff --numstat output
 */
function parseStats(diff: string): { added: number; deleted: number } {
  let added = 0;
  let deleted = 0;

  for (const line of diff.split("\n")) {
    if (!line.trim()) continue;

    const [a, d] = line.split("\t").map((n) => parseInt(n, 10) || 0);
    added += a;
    deleted += d;
  }

  return { added, deleted };
}

/**
 * Count files in diff output
 */
function countFiles(diff: string): number {
  return diff.split("\n").filter((f) => f.trim()).length;
}

/**
 * Get complete git status
 */
export function getGitStatusSync(cwd: string = process.cwd()): GitStatus {
  // Check if we're in a git repo
  const gitDirCheck = execGitQuiet(cwd, "git rev-parse --git-dir");
  if (gitDirCheck.exitCode !== 0) {
    return {
      branch: "no-git",
      hasChanges: false,
      staged: { added: 0, deleted: 0, files: 0 },
      unstaged: { added: 0, deleted: 0, files: 0 },
    };
  }

  const branch = getGitBranch(cwd);
  const dirty = hasChanges(cwd);

  if (!dirty) {
    return {
      branch,
      hasChanges: false,
      staged: { added: 0, deleted: 0, files: 0 },
      unstaged: { added: 0, deleted: 0, files: 0 },
    };
  }

  // Get detailed stats
  const unstagedDiff = execGit(cwd, "git diff --numstat");
  const stagedDiff = execGit(cwd, "git diff --cached --numstat");
  const stagedFilesResult = execGit(cwd, "git diff --cached --name-only");
  const unstagedFilesResult = execGit(cwd, "git diff --name-only");

  const unstagedStats = parseStats(unstagedDiff);
  const stagedStats = parseStats(stagedDiff);
  const stagedFilesCount = countFiles(stagedFilesResult);
  const unstagedFilesCount = countFiles(unstagedFilesResult);

  return {
    branch,
    hasChanges: true,
    staged: {
      added: stagedStats.added,
      deleted: stagedStats.deleted,
      files: stagedFilesCount,
    },
    unstaged: {
      added: unstagedStats.added,
      deleted: unstagedStats.deleted,
      files: unstagedFilesCount,
    },
  };
}

/**
 * Async wrapper for compatibility
 */
export async function getGitStatus(cwd: string = process.cwd()): Promise<GitStatus> {
  return getGitStatusSync(cwd);
}
