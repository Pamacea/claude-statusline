#!/usr/bin/env -S bun run
/**
 * Manual test script for Statusline plugin
 * Simulates Claude Code hook input
 */

import { loadConfig, updateConfigForModel } from "../src/config.ts";
import { getGitInfo, getFileStats } from "../hooks/utils/git.ts";
import { calculateTokenUsage } from "../hooks/utils/token.ts";
import { buildStatusline } from "../hooks/utils/display.ts";

async function main() {
  console.log("🔍 Statusline Plugin Test");
  console.log("=" .repeat(50));

  // Load config
  const config = loadConfig();
  console.log("\n📋 Configuration:");
  console.log(`  Max Tokens: ${config.maxTokens.toLocaleString()}`);
  console.log(`  Progress Bar Width: ${config.progressBarWidth}`);
  console.log(`  Show Icons: ${config.showIcons}`);
  console.log(`  Colors: ${JSON.stringify(config.colors)}`);

  // Test with different models
  const models = [
    "claude-opus-4-5",
    "claude-opus-4-6",
    "claude-3-5-sonnet",
  ];

  console.log("\n🤖 Model Token Limits:");
  for (const model of models) {
    const modelConfig = updateConfigForModel(config, model);
    console.log(`  ${model}: ${modelConfig.maxTokens.toLocaleString()} tokens`);
  }

  // Get git info
  console.log("\n📂 Git Information:");
  const gitInfo = await getGitInfo();
  console.log(`  Branch: ${gitInfo.branch || "(not a git repo)"}`);
  console.log(`  Root: ${gitInfo.root}`);
  console.log(`  Relative Path: ${gitInfo.relativePath}`);
  console.log(`  Dirty: ${gitInfo.dirty}`);
  console.log(`  Staged: ${gitInfo.staged}`);

  // Get file stats
  console.log("\n📝 File Statistics:");
  const fileStats = await getFileStats();
  console.log(`  Insertions: +${fileStats.insertions}`);
  console.log(`  Deletions: -${fileStats.deletions}`);
  console.log(`  Modifications: ~${fileStats.modifications}`);

  // Simulate different token usage levels
  console.log("\n📊 Token Usage Examples:");
  const usageLevels = [
    { current: 25000, label: "Low Usage" },
    { current: 100000, label: "Medium Usage" },
    { current: 150000, label: "High Usage" },
    { current: 190000, label: "Critical Usage" },
  ];

  for (const level of usageLevels) {
    const percentage = Math.round((level.current / config.maxTokens) * 100);
    console.log(`\n  ${level.label} (${percentage}%):`);

    const tokenUsage = {
      current: level.current,
      max: config.maxTokens,
      percentage,
    };

    const display = buildStatusline(gitInfo, fileStats, tokenUsage, config);
    console.log(`    ${display.full}`);
  }

  // Test progress bar colors
  console.log("\n🎨 Progress Bar Colors:");
  const percentages = [10, 30, 50, 70, 90];
  for (const pct of percentages) {
    const tokenUsage = {
      current: Math.round((pct / 100) * config.maxTokens),
      max: config.maxTokens,
      percentage: pct,
    };
    const display = buildStatusline(gitInfo, fileStats, tokenUsage, config);
    const color = pct >= 75 ? "🔴" : pct >= 25 ? "🟡" : "🟢";
    console.log(`  ${color} ${pct}%: ${display.progressBar}`);
  }

  console.log("\n✅ All tests completed!");
}

main().catch(console.error);
