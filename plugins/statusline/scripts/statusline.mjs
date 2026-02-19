#!/usr/bin/env node
/**
 * Claude Code Native Statusline Script
 *
 * Installation:
 * 1. Copy this script to ~/.claude/statusline.mjs
 * 2. Make it executable: chmod +x ~/.claude/statusline.mjs
 * 3. Add to ~/.claude/settings.json:
 *    {
 *      "statusLine": {
 *        "type": "command",
 *        "command": "node ~/.claude/statusline.mjs"
 *      }
 *    }
 *
 * Cross-platform: Works on Windows, macOS, and Linux
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Configuration
const CONFIG = {
  maxTokens: 200000,
  progressBarWidth: 10,  // Reduced from 20 for cleaner look
  showIcons: true,
  colors: {
    low: 'green',      // < 25%
    medium: 'yellow',  // 25-75%
    high: 'red'        // > 75%
  }
};

// ANSI Color codes
const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[91m',
  green: '\x1b[92m',
  yellow: '\x1b[93m',
  blue: '\x1b[94m',
  magenta: '\x1b[95m',
  cyan: '\x1b[96m',
  white: '\x1b[97m',
  gray: '\x1b[90m',
  orange: '\x1b[38;5;208m'
};

/**
 * Get git information for current directory
 */
function getGitInfo() {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD 2>nul || echo ""', {
      cwd: process.cwd(),
      encoding: 'utf-8',
      shell: true,
      windowsHide: true
    }).trim();

    const root = execSync('git rev-parse --show-toplevel 2>nul || echo .', {
      cwd: process.cwd(),
      encoding: 'utf-8',
      shell: true,
      windowsHide: true
    }).trim();

    const relative = execSync('git rev-parse --show-prefix 2>nul || echo .', {
      cwd: process.cwd(),
      encoding: 'utf-8',
      shell: true,
      windowsHide: true
    }).trim().replace(/\\$/, '').replace(/\/$/, '') || '.';

    // Check dirty state
    const status = execSync('git status --porcelain 2>nul', {
      cwd: process.cwd(),
      encoding: 'utf-8',
      shell: true,
      windowsHide: true
    }).trim();

    const dirty = status.length > 0;

    // Get diff stats (insertions/deletions)
    let insertions = 0;
    let deletions = 0;

    try {
      const diffStat = execSync('git diff --shortstat 2>nul', {
        cwd: process.cwd(),
        encoding: 'utf-8',
        shell: true,
        windowsHide: true
      }).trim();

      // Parse "file(s) changed, N insertion(s), N deletion(s)"
      const insertMatch = diffStat.match(/(\d+) insertion/);
      const deleteMatch = diffStat.match(/(\d+) deletion/);

      if (insertMatch) insertions = parseInt(insertMatch[1], 10);
      if (deleteMatch) deletions = parseInt(deleteMatch[1], 10);
    } catch {
      // Ignore diff stat errors
    }

    return { branch, root, relative, dirty, insertions, deletions };
  } catch {
    return { branch: '', root: '.', relative: '.', dirty: false, insertions: 0, deletions: 0 };
  }
}

/**
 * Try to read token usage from Claude's state file
 */
function getTokenUsage() {
  // Try to find Claude's state file
  const homeDir = process.env.HOME || process.env.USERPROFILE;
  const possiblePaths = [
    join(homeDir, '.claude.json'),
    join(homeDir, '.claude', 'state.json'),
    join(homeDir, '.config', 'claude', 'state.json'),
  ];

  for (const path of possiblePaths) {
    try {
      if (existsSync(path)) {
        const content = readFileSync(path, 'utf-8');
        const data = JSON.parse(content);

        // Try to find token usage in various possible locations
        if (data.usage?.currentTokens) {
          return {
            current: data.usage.currentTokens,
            max: data.usage.maxTokens || CONFIG.maxTokens
          };
        }
        if (data.session?.tokensUsed) {
          return {
            current: data.session.tokensUsed,
            max: data.session.maxTokens || CONFIG.maxTokens
          };
        }
      }
    } catch {
      // Continue to next path
    }
  }

  // Default: return 0 usage
  return { current: 0, max: CONFIG.maxTokens };
}

/**
 * Format token count for display
 */
function formatTokenCount(count) {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(0)}K`;
  }
  return count.toString();
}

/**
 * Create a progress bar with colors
 */
function createProgressBar(percentage, width = CONFIG.progressBarWidth) {
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);

  let color = COLORS.green;
  if (percentage >= 75) color = COLORS.red;
  else if (percentage >= 25) color = COLORS.yellow;

  return `${color}[${bar}]${COLORS.reset}`;
}

/**
 * Format git changes for display
 */
function formatGitChanges(insertions, deletions) {
  if (insertions === 0 && deletions === 0) {
    return '';
  }

  const parts = [];
  if (insertions > 0) {
    parts.push(`${COLORS.green}+${insertions}${COLORS.reset}`);
  }
  if (deletions > 0) {
    parts.push(`${COLORS.red}-${deletions}${COLORS.reset}`);
  }

  return parts.length > 0 ? ` ${parts.join(' ')}` : '';
}

/**
 * Get project name/path for display
 */
function getProjectPath(gitInfo) {
  if (!gitInfo.branch) {
    // Not in a git repo, show current directory name
    return process.cwd().split(/[/\\]/).pop() || '.';
  }

  // In a git repo, show relative path from root
  if (gitInfo.relative === '.' || gitInfo.relative === '') {
    return gitInfo.root.split(/[/\\]/).pop() || '.';
  }

  const projectName = gitInfo.root.split(/[/\\]/).pop() || '.';
  return `${projectName}/${gitInfo.relative}`;
}

/**
 * Main function
 */
function main() {
  const gitInfo = getGitInfo();
  const { current, max } = getTokenUsage();
  const percentage = Math.min(100, Math.round((current / max) * 100));

  // Build statusline components
  const branch = gitInfo.branch || 'no-git';
  const dirtyMarker = gitInfo.dirty ? COLORS.red + '*' + COLORS.reset : '';
  const projectPath = getProjectPath(gitInfo);
  const progressBar = createProgressBar(percentage);
  const currentDisplay = formatTokenCount(current);
  const maxDisplay = formatTokenCount(max);
  const gitChanges = formatGitChanges(gitInfo.insertions, gitInfo.deletions);

  // Build final statusline
  const icon = CONFIG.showIcons ? '' : '';  // Removed icon for cleaner look
  const statusline =
    COLORS.bold + COLORS.white +
    `${icon}${branch}${dirtyMarker}` + COLORS.reset +
    `  ` +
    COLORS.cyan + `${projectPath}` + COLORS.reset +
    gitChanges +
    `  ` +
    `${progressBar}  ` +
    COLORS.bold + `${percentage}% (${currentDisplay}/${maxDisplay})` +
    COLORS.reset;

  // Output to stdout (Claude Code reads this)
  console.log(statusline);
}

main();
