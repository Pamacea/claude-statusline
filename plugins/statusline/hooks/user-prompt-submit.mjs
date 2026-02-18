#!/usr/bin/env node
/**
 * UserPromptSubmit Hook for Statusline plugin
 * Cross-platform Node.js script
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const PLUGIN_ROOT = dirname(__filename);

function getGitInfo() {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD 2>/dev/null || echo ""', {
      cwd: process.cwd(),
      encoding: 'utf-8',
      shell: true
    }).trim();

    const root = execSync('git rev-parse --show-toplevel 2>/dev/null || echo .', {
      cwd: process.cwd(),
      encoding: 'utf-8',
      shell: true
    }).trim();

    const relative = execSync(`git rev-parse --show-prefix 2>/dev/null || echo .`, {
      cwd: process.cwd(),
      encoding: 'utf-8',
      shell: true
    }).trim().replace(/\/$/, '') || '.';

    const dirty = execSync('git status --porcelain 2>/dev/null | head -1', {
      encoding: 'utf-8',
      shell: true
    }).trim().length > 0;

    return { branch, root, relative, dirty };
  } catch {
    return { branch: '', root: '.', relative: '.', dirty: false };
  }
}

function getTokenUsage(input, maxTokens) {
  const summary = input?.conversation_summary || '';
  const estimated = Math.ceil(summary.length / 4);
  const current = Math.min(estimated, maxTokens);
  return { current, max: maxTokens, percentage: Math.round((current / maxTokens) * 100) };
}

function getProgressBar(percentage, width = 20) {
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);

  let color = '\x1b[92m'; // green
  if (percentage >= 75) color = '\x1b[91m'; // red
  else if (percentage >= 25) color = '\x1b[93m'; // yellow

  return `${color}[${bar}]\x1b[0m`;
}

function main() {
  try {
    // Read stdin
    let input = {};
    try {
      const stdin = readFileSync(0, 'utf-8');
      if (stdin.trim()) input = JSON.parse(stdin);
    } catch { }

    const gitInfo = getGitInfo();
    const tokenUsage = getTokenUsage(input, 200000);
    const progressBar = getProgressBar(tokenUsage.percentage);

    const branch = gitInfo.branch || '';
    const dirty = gitInfo.dirty ? '*' : '';
    const relativePath = gitInfo.relativePath === '.' ? '~' : `~/${gitInfo.relativePath}`;

    const tokenCount = tokenUsage.current >= 1000
      ? `${(tokenUsage.current / 1000).toFixed(0)}K`
      : tokenUsage.current.toString();
    const maxToken = tokenUsage.max >= 1000000
      ? `${(tokenUsage.max / 1000000).toFixed(1)}M`
      : `${(tokenUsage.max / 1000).toFixed(0)}K`;

    const statusline = `${branch}${dirty}  ${relativePath}  ${progressBar}  ${tokenUsage.percentage}% (${tokenCount}/${maxToken})`;

    const output = {
      hookSpecificOutput: {
        hookEventName: 'UserPromptSubmit',
        additionalContext: `## Statusline\n\n${statusline}`
      }
    };

    writeFileSync(1, JSON.stringify(output) + '\n');
  } catch (error) {
    // Silently fail
    writeFileSync(1, JSON.stringify({ hookSpecificOutput: { hookEventName: 'UserPromptSubmit' } }) + '\n');
  }

  process.exit(0);
}

main();
