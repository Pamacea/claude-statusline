/**
 * Formatting utilities for statusline display
 */

import { homedir } from "os";
import { sep } from "path";
import type {
  CostFormat,
  PathDisplayMode,
  ProgressBarBackground,
  ProgressBarColor,
  ProgressBarStyle,
  StatuslineConfig,
} from "./types.js";
import { colors } from "./colors.js";

/**
 * Git status interface for formatting
 */
export interface GitStatus {
  branch: string;
  hasChanges: boolean;
  staged: {
    added: number;
    deleted: number;
    files: number;
  };
  unstaged: {
    added: number;
    deleted: number;
    files: number;
  };
}

type ColorFunction = (text: string | number) => string;

// Re-export colors
export { colors };

/**
 * Format git branch and changes
 */
export function formatBranch(
  git: GitStatus,
  gitConfig: StatuslineConfig["git"],
): string {
  let result = "";

  if (gitConfig.showBranch) {
    result = colors.lightGray(git.branch);
  }

  if (git.hasChanges) {
    const changes: string[] = [];

    if (gitConfig.showDirtyIndicator) {
      result += colors.purple("*");
    }

    if (gitConfig.showChanges) {
      const totalAdded = git.staged.added + git.unstaged.added;
      const totalDeleted = git.staged.deleted + git.unstaged.deleted;

      if (totalAdded > 0) {
        changes.push(colors.green(`+${totalAdded}`));
      }
      if (totalDeleted > 0) {
        changes.push(colors.red(`-${totalDeleted}`));
      }
    }

    if (gitConfig.showStaged && git.staged.files > 0) {
      changes.push(colors.gray(`~${git.staged.files}`));
    }

    if (gitConfig.showUnstaged && git.unstaged.files > 0) {
      changes.push(colors.yellow(`~${git.unstaged.files}`));
    }

    if (changes.length > 0) {
      result += ` ${changes.join(" ")}`;
    }
  }

  return result;
}

/**
 * Format file path for display
 */
export function formatPath(
  path: string,
  mode: PathDisplayMode = "truncated",
): string {
  const home = homedir();
  let formattedPath = path;

  // Replace home directory with ~
  if (home && path.startsWith(home)) {
    formattedPath = `~${path.slice(home.length)}`;
  }

  if (mode === "basename") {
    const segments = path.split(/[/\\]/).filter((s) => s.length > 0);
    return segments[segments.length - 1] || path;
  }

  if (mode === "truncated") {
    const segments = formattedPath.split(/[/\\]/).filter((s) => s.length > 0);
    if (segments.length > 2) {
      return `…${sep}${segments.slice(-2).join(sep)}`;
    }
  }

  return formattedPath;
}

/**
 * Format cost for display
 */
export function formatCost(cost: number, format: CostFormat = "decimal1"): string {
  if (format === "integer") return Math.round(cost).toString();
  if (format === "decimal1") return cost.toFixed(1);
  return cost.toFixed(2);
}

/**
 * Format token count with suffix
 */
export function formatTokens(tokens: number, showDecimals = true): string {
  if (tokens >= 1000000) {
    const value = tokens / 1000000;
    const number = showDecimals ? value.toFixed(1) : Math.round(value).toString();
    return `${colors.lightGray(number)}${colors.gray("m")}`;
  }

  if (tokens >= 1000) {
    const value = tokens / 1000;
    const number = showDecimals ? value.toFixed(1) : Math.round(value).toString();
    return `${colors.lightGray(number)}${colors.gray("k")}`;
  }

  return colors.lightGray(tokens.toString());
}

/**
 * Format duration in milliseconds to human readable
 * Enhanced for v0.6.0: more compact format
 */
export function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) {
    return mins > 0 ? `${hours}h${mins}m` : `${hours}h`;
  }
  return `${mins}m`;
}

/**
 * Format reset time countdown
 */
export function formatResetTime(resetsAt: string): string {
  try {
    const resetDate = new Date(resetsAt);
    if (Number.isNaN(resetDate.getTime())) {
      return "N/A";
    }

    const now = new Date();
    const diffMs = resetDate.getTime() - now.getTime();

    if (diffMs <= 0) {
      return "now";
    }

    const hours = Math.floor(diffMs / 3600000);
    const minutes = Math.floor((diffMs % 3600000) / 60000);

    if (hours > 0) {
      return `${hours}h${minutes}m`;
    }
    return `${minutes}m`;
  } catch {
    return "N/A";
  }
}

/**
 * Get progress bar color function
 */
function getProgressBarColor(percentage: number, colorMode: ProgressBarColor): ColorFunction {
  if (colorMode === "progressive") {
    if (percentage < 50) return colors.gray;
    if (percentage < 70) return colors.yellow;
    if (percentage < 90) return colors.orange;
    return colors.red;
  }

  if (colorMode === "green") return colors.green;
  if (colorMode === "yellow") return colors.yellow;
  if (colorMode === "peach") return colors.peach;
  if (colorMode === "black") return colors.black;
  if (colorMode === "white") return colors.white;
  return colors.red;
}

/**
 * Get progress bar background function
 */
function getProgressBarBackground(background: ProgressBarBackground): ColorFunction | null {
  if (background === "none") return null;
  if (background === "dark") return colors.bgBlack;
  if (background === "gray") return colors.bgBlackBright;
  if (background === "light") return colors.bgWhite;
  if (background === "blue") return colors.bgBlue;
  if (background === "purple") return colors.bgMagenta;
  if (background === "cyan") return colors.bgCyan;
  if (background === "peach") return colors.bgPeach;
  return null;
}

/**
 * Format progress bar (filled style)
 */
export function formatProgressBarFilled(
  percentage: number,
  length: number,
  colorMode: ProgressBarColor,
  background: ProgressBarBackground,
): string {
  const filled = Math.round((percentage / 100) * length);
  const empty = length - filled;

  const filledBar = "█".repeat(filled);
  const emptyBar = "░".repeat(empty);

  const colorFn = getProgressBarColor(percentage, colorMode);
  const bgFn = getProgressBarBackground(background);

  const coloredFilled = bgFn ? bgFn(colorFn(filledBar)) : colorFn(filledBar);
  const coloredEmpty = bgFn ? bgFn(colorFn(emptyBar)) : colorFn(emptyBar);

  return `${coloredFilled}${coloredEmpty}`;
}

/**
 * Format progress bar (rectangle style)
 */
export function formatProgressBarRectangle(
  percentage: number,
  length: number,
  colorMode: ProgressBarColor,
  background: ProgressBarBackground,
): string {
  const filled = Math.round((percentage / 100) * length);
  const empty = length - filled;

  const filledBar = "▰".repeat(filled);
  const emptyBar = "▱".repeat(empty);

  const colorFn = getProgressBarColor(percentage, colorMode);
  const bgFn = getProgressBarBackground(background);

  const coloredFilled = bgFn ? bgFn(colorFn(filledBar)) : colorFn(filledBar);
  const coloredEmpty = bgFn ? bgFn(colorFn(emptyBar)) : colorFn(emptyBar);

  return `${coloredFilled}${coloredEmpty}`;
}

/**
 * Format progress bar (braille style)
 */
export function formatProgressBarBraille(
  percentage: number,
  length: number,
  colorMode: ProgressBarColor,
  background: ProgressBarBackground,
): string {
  const brailleChars = ["⣀", "⣄", "⣤", "⣦", "⣶", "⣷", "⣿"];
  const totalSteps = length * (brailleChars.length - 1);
  const currentStep = Math.round((percentage / 100) * totalSteps);

  const fullBlocks = Math.floor(currentStep / (brailleChars.length - 1));
  const partialIndex = currentStep % (brailleChars.length - 1);
  const emptyBlocks = length - fullBlocks - (partialIndex > 0 ? 1 : 0);

  const colorFn = getProgressBarColor(percentage, colorMode);
  const bgFn = getProgressBarBackground(background);

  const fullPart =
    bgFn ? bgFn(colorFn("⣿".repeat(fullBlocks))) : colorFn("⣿".repeat(fullBlocks));
  const partialPart =
    partialIndex > 0
      ? bgFn
        ? bgFn(colorFn(brailleChars[partialIndex]))
        : colorFn(brailleChars[partialIndex])
      : "";
  const emptyPart =
    emptyBlocks > 0
      ? bgFn
        ? bgFn(colorFn("⣀".repeat(emptyBlocks)))
        : colorFn("⣀".repeat(emptyBlocks))
      : "";

  return `${fullPart}${partialPart}${emptyPart}`;
}

/**
 * Format progress bar
 */
export function formatProgressBar({
  percentage,
  length,
  style,
  colorMode,
  background,
}: {
  percentage: number;
  length: 5 | 10 | 15;
  style: ProgressBarStyle;
  colorMode: ProgressBarColor;
  background: ProgressBarBackground;
}): string {
  if (style === "rectangle") {
    return formatProgressBarRectangle(percentage, length, colorMode, background);
  }

  if (style === "braille") {
    return formatProgressBarBraille(percentage, length, colorMode, background);
  }

  return formatProgressBarFilled(percentage, length, colorMode, background);
}
