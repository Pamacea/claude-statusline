/**
 * Display utilities for Statusline plugin
 */

import type {
  GitInfo,
  FileStats,
  TokenUsage,
  StatuslineDisplay,
  StatuslineConfig,
} from "../../src/types.ts";
import { ICONS, ASCII_ICONS, ANSI_COLORS } from "../../src/types.ts";
import { formatBranch, formatPath } from "./git.ts";
import { formatTokenUsage, getContextWarning } from "./token.ts";
import { renderProgressBar, createProgressBar } from "./progress.ts";

/**
 * Build complete statusline display
 */
export function buildStatusline(
  gitInfo: GitInfo,
  fileStats: FileStats,
  tokenUsage: TokenUsage,
  config: StatuslineConfig,
): StatuslineDisplay {
  const icons = config.showIcons ? ICONS : ASCII_ICONS;

  // Build branch display
  const branch = gitInfo.branch
    ? `${icons.branch} ${formatBranch(gitInfo.branch, gitInfo.dirty)}`
    : "";

  // Build path display
  const path = gitInfo.relativePath
    ? `${icons.folder} ${formatPath(gitInfo.relativePath)}`
    : "";

  // Build progress bar
  const progressSegment = createProgressBar(
    tokenUsage.percentage,
    config.progressBarWidth,
    config.showIcons,
  );
  const progressBar = renderProgressBar(progressSegment, config.showIcons, true);

  // Build token info
  const tokenInfo = formatTokenUsage(tokenUsage);

  // Build file stats
  const fileStatsParts: string[] = [];
  if (fileStats.insertions > 0) {
    fileStatsParts.push(`${icons.insertion}${fileStats.insertions}`);
  }
  if (fileStats.deletions > 0) {
    fileStatsParts.push(`${icons.deletion}${fileStats.deletions}`);
  }
  if (fileStats.modifications > 0) {
    fileStatsParts.push(`${icons.modification}${fileStats.modifications}`);
  }
  const fileStatsStr = fileStatsParts.length > 0 ? fileStatsParts.join(" ") : "";

  // Build full statusline
  const parts = [branch, path, progressBar, tokenInfo].filter(Boolean);
  const full = parts.join("  ");

  return {
    branch,
    path,
    progressBar,
    tokenInfo,
    fileStats: fileStatsStr,
    full,
  };
}

/**
 * Format statusline for Claude Code context injection
 */
export function formatStatuslineForContext(display: StatuslineDisplay): string {
  const lines: string[] = [];

  if (display.full) {
    lines.push(`## Statusline`);
    lines.push();
    lines.push(display.full);

    if (display.fileStats) {
      lines.push();
      lines.push(`File changes: ${display.fileStats}`);
    }

    lines.push();
  }

  return lines.join("\n");
}

/**
 * Format statusline for system message (more compact)
 */
export function formatStatuslineForSystemMessage(display: StatuslineDisplay): string {
  const parts: string[] = [];

  if (display.branch) {
    parts.push(`Branch: ${display.branch}`);
  }
  if (display.path) {
    parts.push(`Path: ${display.path}`);
  }

  parts.push(`Context: ${display.tokenInfo}`);

  if (display.fileStats) {
    parts.push(`Changes: ${display.fileStats}`);
  }

  return parts.join(" | ");
}

/**
 * Get context warning as system message
 */
export function getWarningSystemMessage(tokenUsage: TokenUsage): string | null {
  const warning = getContextWarning(tokenUsage);
  return warning ? `${ANSI_COLORS.bright_yellow}${warning}${ANSI_COLORS.reset}` : null;
}

/**
 * Create hook output with statusline
 */
export function createHookOutput(
  display: StatuslineDisplay,
  tokenUsage: TokenUsage,
  eventName: string,
): {
  hookSpecificOutput: {
    hookEventName: string;
    additionalContext?: string;
    systemMessage?: string;
  };
} {
  const output: {
    hookSpecificOutput: {
      hookEventName: string;
      additionalContext?: string;
      systemMessage?: string;
    };
  } = {
    hookSpecificOutput: {
      hookEventName: eventName,
    },
  };

  // Add context with statusline
  const contextText = formatStatuslineForContext(display);
  if (contextText) {
    output.hookSpecificOutput.additionalContext = contextText;
  }

  // Add system message if context is low
  const warning = getWarningSystemMessage(tokenUsage);
  if (warning) {
    output.hookSpecificOutput.systemMessage = warning;
  }

  return output;
}

/**
 * Format compact statusline for single line
 */
export function formatCompactStatusline(
  gitInfo: GitInfo,
  tokenUsage: TokenUsage,
  config: StatuslineConfig,
): string {
  const icons = config.showIcons ? ICONS : ASCII_ICONS;
  const parts: string[] = [];

  if (gitInfo.branch) {
    parts.push(gitInfo.branch);
  }

  if (gitInfo.relativePath && gitInfo.relativePath !== ".") {
    parts.push(gitInfo.relativePath);
  }

  parts.push(`${tokenUsage.percentage}%`);

  return parts.join("  ");
}

/**
 * Strip ANSI codes from string (for logging)
 */
export function stripAnsiCodes(text: string): string {
  return text.replace(/\x1b\[[0-9;]*m/g, "");
}
