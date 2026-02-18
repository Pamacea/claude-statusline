/**
 * Type definitions for Statusline plugin
 */

/**
 * Plugin configuration from settings.json
 */
export interface StatuslineConfig {
  maxTokens: number;
  progressBarWidth: number;
  showIcons: boolean;
  colors: ColorConfig;
}

/**
 * Color configuration for progress bar
 */
export interface ColorConfig {
  low: string;
  medium: string;
  high: string;
}

/**
 * Git information
 */
export interface GitInfo {
  branch: string;
  root: string;
  currentPath: string;
  relativePath: string;
  dirty: boolean;
  staged: boolean;
  commitsAhead: number;
  commitsBehind: number;
}

/**
 * File operation statistics
 */
export interface FileStats {
  insertions: number;
  deletions: number;
  modifications: number;
}

/**
 * Token usage information
 */
export interface TokenUsage {
  current: number;
  max: number;
  percentage: number;
}

/**
 * Progress bar segment
 */
export interface ProgressBarSegment {
  filled: number;
  empty: number;
  color: string;
}

/**
 * Statusline display data
 */
export interface StatuslineDisplay {
  branch: string;
  path: string;
  progressBar: string;
  tokenInfo: string;
  fileStats: string;
  full: string;
}

/**
 * Hook input from Claude Code
 */
export interface HookInput {
  eventName?: string;
  conversation_summary?: string;
  working_directory?: string;
  model?: string;
}

/**
 * Hook output to Claude Code
 */
export interface HookOutput {
  hookSpecificOutput?: {
    hookEventName: string;
    additionalContext?: string;
    systemMessage?: string;
  };
}

/**
 * ANSI color codes for terminal output
 */
export const ANSI_COLORS = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bright_red: "\x1b[91m",
  bright_green: "\x1b[92m",
  bright_yellow: "\x1b[93m",
  bright_blue: "\x1b[94m",
  bright_magenta: "\x1b[95m",
  bright_cyan: "\x1b[96m",
  bright_white: "\x1b[97m",
} as const;

/**
 * Unicode icons for statusline
 */
export const ICONS = {
  branch: "",
  folder: "",
  git_dirty: "*",
  git_staged: "+",
  git_ahead: "↑",
  git_behind: "↓",
  insertion: "+",
  deletion: "-",
  modification: "~",
  separator: "|",
} as const;

/**
 * ASCII fallback icons
 */
export const ASCII_ICONS = {
  branch: "B:",
  folder: "D:",
  git_dirty: "*",
  git_staged: "+",
  git_ahead: "^",
  git_behind: "v",
  insertion: "+",
  deletion: "-",
  modification: "~",
  separator: "|",
} as const;

/**
 * Progress bar characters
 */
export const PROGRESS_CHARS = {
  unicode: {
    filled: "█",
    empty: "░",
  },
  ascii: {
    filled: "#",
    empty: "-",
  },
} as const;
