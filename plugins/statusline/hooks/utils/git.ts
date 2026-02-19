/**
 * Git utilities for Statusline plugin
 */

import type { GitInfo, FileStats } from "../../src/types.ts";
import { execGitCommand, getCwd } from "./command.ts";

/**
 * Execute a git command and return stdout
 */
async function gitCommand(args: string[], cwd?: string): Promise<string> {
  return await execGitCommand(args, cwd);
}

/**
 * Get current git branch name
 */
export async function getGitBranch(cwd?: string): Promise<string> {
  const branch = await gitCommand(["rev-parse", "--abbrev-ref", "HEAD"], cwd);
  return branch || "HEAD";
}

/**
 * Get git repository root directory
 */
export async function getGitRoot(cwd?: string): Promise<string> {
  const root = await gitCommand(["rev-parse", "--show-toplevel"], cwd);
  return root || cwd || getCwd();
}

/**
 * Check if working directory has git
 */
export async function isGitRepo(cwd?: string): Promise<boolean> {
  const result = await gitCommand(["rev-parse", "--git-dir"], cwd);
  return result.length > 0;
}

/**
 * Get relative path from git root
 */
export async function getRelativePath(cwd?: string): Promise<string> {
  const root = await getGitRoot(cwd);
  const current = cwd || getCwd();

  if (root === current) {
    return ".";
  }

  // Normalize paths for cross-platform
  const rootNormalized = root.replace(/\\/g, "/");
  const currentNormalized = current.replace(/\\/g, "/");

  if (currentNormalized.startsWith(rootNormalized)) {
    let relative = currentNormalized.slice(rootNormalized.length);
    if (relative.startsWith("/")) {
      relative = relative.slice(1);
    }
    return relative || ".";
  }

  return current;
}

/**
 * Check if working directory has uncommitted changes
 */
export async function isGitDirty(cwd?: string): Promise<boolean> {
  const status = await gitCommand(["status", "--porcelain"], cwd);
  return status.length > 0;
}

/**
 * Check if there are staged changes
 */
export async function hasStagedChanges(cwd?: string): Promise<boolean> {
  const status = await gitCommand(["diff", "--cached", "--name-only"], cwd);
  return status.length > 0;
}

/**
 * Get commit count ahead/behind upstream
 */
export async function getCommitCount(cwd?: string): Promise<{ ahead: number; behind: number }> {
  const ahead = await gitCommand(["rev-list", "--count", "@{u}..HEAD"], cwd);
  const behind = await gitCommand(["rev-list", "--count", "HEAD..@{u}"], cwd);

  return {
    ahead: parseInt(ahead) || 0,
    behind: parseInt(behind) || 0,
  };
}

/**
 * Get complete git information
 */
export async function getGitInfo(cwd?: string): Promise<GitInfo> {
  if (!(await isGitRepo(cwd))) {
    return {
      branch: "",
      root: cwd || getCwd(),
      currentPath: cwd || getCwd(),
      relativePath: ".",
      dirty: false,
      staged: false,
      commitsAhead: 0,
      commitsBehind: 0,
    };
  }

  const [branch, root, currentPath, relativePath, dirty, staged, counts] =
    await Promise.all([
      getGitBranch(cwd),
      getGitRoot(cwd),
      Promise.resolve(cwd || getCwd()),
      getRelativePath(cwd),
      isGitDirty(cwd),
      hasStagedChanges(cwd),
      getCommitCount(cwd).catch(() => ({ ahead: 0, behind: 0 })),
    ]);

  return {
    branch,
    root,
    currentPath,
    relativePath,
    dirty,
    staged,
    commitsAhead: counts.ahead,
    commitsBehind: counts.behind,
  };
}

/**
 * Get file statistics from git diff
 */
export async function getFileStats(cwd?: string): Promise<FileStats> {
  if (!(await isGitRepo(cwd))) {
    return { insertions: 0, deletions: 0, modifications: 0 };
  }

  // Get stats for unstaged changes
  const diffStats = await gitCommand(["diff", "--shortstat"], cwd);
  // Get stats for staged changes
  const cachedStats = await gitCommand(["diff", "--cached", "--shortstat"], cwd);

  let insertions = 0;
  let deletions = 0;
  let modifications = 0;

  // Parse git diff shortstat output
  // Format: " X file(s) changed, Y insertion(s), Z deletion(s)"
  const parseStats = (stats: string): { ins: number; del: number } => {
    const insMatch = stats.match(/(\d+) insertion/);
    const delMatch = stats.match(/(\d+) deletion/);
    return {
      ins: insMatch ? parseInt(insMatch[1]) : 0,
      del: delMatch ? parseInt(delMatch[1]) : 0,
    };
  };

  const diff = parseStats(diffStats);
  const cached = parseStats(cachedStats);

  // Note: modifications aren't directly reported by git --shortstat
  // We count them as files that changed but aren't pure insertions/deletions
  const filesChanged = await gitCommand(["diff", "--name-only", "--diff-filter=M"], cwd);
  const filesCached = await gitCommand([
    "diff",
    "--cached",
    "--name-only",
    "--diff-filter=M",
  ], cwd);

  modifications =
    (filesChanged ? filesChanged.split("\n").length : 0) +
    (filesCached ? filesCached.split("\n").length : 0);

  insertions = diff.ins + cached.ins;
  deletions = diff.del + cached.del;

  return { insertions, deletions, modifications };
}

/**
 * Format git branch for display
 */
export function formatBranch(branch: string, dirty: boolean): string {
  if (!branch) return "";
  return dirty ? `${branch}*` : branch;
}

/**
 * Format relative path for display (shorten if needed)
 */
export function formatPath(relativePath: string, maxLength = 30): string {
  if (relativePath === ".") return "~";

  // Shorten path segments
  const segments = relativePath.split("/");

  if (segments.length <= 2) {
    return `~/${relativePath}`;
  }

  // Show first and last segment with ... for middle
  const first = segments[0];
  const last = segments[segments.length - 1];
  return `~/${first}/.../${last}`;
}
