/**
 * Configuration management for Statusline plugin
 */

import type { StatuslineConfig } from "./types.ts";

/**
 * Get environment variable (works in both Bun and Deno)
 */
function getEnv(key: string): string | undefined {
  // @ts-expect-error - Bun/Deno compatibility
  if (typeof Deno !== "undefined" && Deno.env) {
    // @ts-expect-error - Bun/Deno compatibility
    return Deno.env.get(key);
  }
  return process.env[key];
}

/**
 * Get OS platform (works in both Bun and Deno)
 */
function getPlatform(): string {
  // @ts-expect-error - Bun/Deno compatibility
  if (typeof Deno !== "undefined" && Deno.build) {
    // @ts-expect-error - Bun/Deno compatibility
    return Deno.build.os;
  }
  return process.platform;
}

/**
 * Default configuration
 */
export const DEFAULT_CONFIG: StatuslineConfig = {
  maxTokens: 200_000,
  progressBarWidth: 20,
  showIcons: true,
  colors: {
    low: "red",
    medium: "yellow",
    high: "green",
  },
};

/**
 * Model-specific token limits
 */
export const MODEL_TOKEN_LIMITS: Record<string, number> = {
  "claude-3-5-haiku": 200_000,
  "claude-3-5-sonnet": 200_000,
  "claude-3-opus": 200_000,
  "claude-opus-4-5": 1_000_000,
  "claude-sonnet-4-5": 200_000,
  "claude-opus-4-6": 1_000_000,
  "claude-sonnet-4-6": 200_000,
};

/**
 * Load configuration from environment variables and defaults
 */
export function loadConfig(): StatuslineConfig {
  const config = { ...DEFAULT_CONFIG };

  // Load from environment variables (set by Claude Code)
  const maxTokensEnv = getEnv("STATUSLINE_MAX_TOKENS");
  if (maxTokensEnv) {
    const parsed = parseInt(maxTokensEnv, 10);
    if (!isNaN(parsed)) {
      config.maxTokens = parsed;
    }
  }

  const progressBarWidthEnv = getEnv("STATUSLINE_PROGRESS_WIDTH");
  if (progressBarWidthEnv) {
    const parsed = parseInt(progressBarWidthEnv, 10);
    if (!isNaN(parsed) && parsed > 0) {
      config.progressBarWidth = parsed;
    }
  }

  const showIconsEnv = getEnv("STATUSLINE_ICONS");
  if (showIconsEnv) {
    config.showIcons = showIconsEnv === "true" || showIconsEnv === "1";
  }

  // Detect Windows for ASCII fallback
  if (getPlatform() === "windows") {
    const term = getEnv("TERM") || "";
    const wtSession = getEnv("WT_SESSION");
    // Use ASCII unless we're in a modern terminal
    if (!term.includes("xterm") && !wtSession) {
      config.showIcons = false;
    }
  }

  return config;
}

/**
 * Get max tokens for a specific model
 */
export function getMaxTokensForModel(model: string): number {
  // Match model pattern
  for (const [key, value] of Object.entries(MODEL_TOKEN_LIMITS)) {
    if (model.includes(key)) {
      return value;
    }
  }
  return DEFAULT_CONFIG.maxTokens;
}

/**
 * Update config based on model name
 */
export function updateConfigForModel(config: StatuslineConfig, model: string): StatuslineConfig {
  const modelMax = getMaxTokensForModel(model);
  return {
    ...config,
    maxTokens: modelMax,
  };
}
