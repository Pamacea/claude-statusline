/**
 * Token counting utilities for Statusline plugin
 */

import type { TokenUsage } from "../../src/types.ts";

/**
 * Approximate token count from text
 * Uses ~4 characters per token heuristic (works well for code)
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;

  // Remove whitespace for better estimate
  const trimmed = text.replace(/\s+/g, " ").trim();
  return Math.ceil(trimmed.length / 4);
}

/**
 * Parse conversation summary to estimate tokens
 */
export function parseConversationTokens(summary: string): number {
  if (!summary) return 0;

  // Try to extract token count from summary if present
  // Claude Code sometimes includes token info in summaries
  const tokenMatch = summary.match(/(\d+(?:,\d+)*)\s*tokens?/i);
  if (tokenMatch) {
    return parseInt(tokenMatch[1].replace(/,/g, ""), 10);
  }

  // Otherwise, estimate from text length
  return estimateTokens(summary);
}

/**
 * Calculate token usage from hook input
 */
export function calculateTokenUsage(
  summary: string | undefined,
  maxTokens: number,
): TokenUsage {
  const current = parseConversationTokens(summary || "");

  // Ensure we don't exceed max
  const safeCurrent = Math.min(current, maxTokens);
  const percentage = Math.round((safeCurrent / maxTokens) * 100);

  return {
    current: safeCurrent,
    max: maxTokens,
    percentage,
  };
}

/**
 * Format token count for display
 */
export function formatTokenCount(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}M`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(0)}K`;
  }
  return count.toString();
}

/**
 * Format token usage for display
 */
export function formatTokenUsage(usage: TokenUsage): string {
  const currentStr = formatTokenCount(usage.current);
  const maxStr = formatTokenCount(usage.max);
  return `${usage.percentage}% (${currentStr}/${maxStr})`;
}

/**
 * Get color based on token usage percentage
 */
export function getTokenColor(percentage: number): "low" | "medium" | "high" {
  if (percentage >= 75) return "low"; // Running out of context
  if (percentage >= 25) return "medium";
  return "high"; // Plenty of context
}

/**
 * Check if context is critically low
 */
export function isContextCritical(usage: TokenUsage, threshold = 90): boolean {
  return usage.percentage >= threshold;
}

/**
 * Check if context is getting low
 */
export function isContextLow(usage: TokenUsage, threshold = 75): boolean {
  return usage.percentage >= threshold;
}

/**
 * Get warning message if context is low
 */
export function getContextWarning(usage: TokenUsage): string | null {
  if (isContextCritical(usage)) {
    return "⚠️ Context window nearly full! Consider starting a new session.";
  }
  if (isContextLow(usage)) {
    return "ℹ️ Context usage is above 75%. Some history may be summarized.";
  }
  return null;
}
