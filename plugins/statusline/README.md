# Statusline Plugin for Claude Code

> Advanced statusline displaying git branch, path, token context, and progress bar.

## Overview

Statusline is a comprehensive Claude Code plugin that provides real-time visibility into your development context. It displays:
- **Git branch** with dirty state indicator
- **Current directory path** (relative to git root)
- **Token usage** with exact count and percentage
- **Progress bar** (Unicode/ASCII) with dynamic colors
- **File operations** tracking (insertions, deletions, modifications)

## Features

### Context Tracking
- Real-time token counting from conversation context
- Percentage-based usage display
- Configurable max tokens (200k default, 1M for Opus 4.5+)
- Auto-detection of model capabilities

### Git Integration
- Current branch display
- Dirty/unstaged changes indicator (`*`)
- Commit tracking (insertions/deletions)

### Visual Progress Bar
```
[████████████░░░░░░░] 65% (130000/200000)
```
- Dynamic color coding:
  - **Red** (< 25%): Low context remaining
  - **Yellow** (25-75%): Medium context
  - **Green** (> 75%): Healthy context

### Cross-Platform
- Works on Windows, macOS, and Linux
- Bun runtime for fast execution
- Unicode fallback to ASCII for compatibility

## Quick Start

```bash
# Install dependencies
bun install

# The plugin is automatically loaded by Claude Code
# Configure in .claude/settings.json
```

## Configuration

Add to your `.claude/settings.json`:

```json
{
  "plugins": {
    "statusline": {
      "enabled": true,
      "maxTokens": 200000,
      "progressBarWidth": 20,
      "showIcons": true,
      "colors": {
        "low": "red",
        "medium": "yellow",
        "high": "green"
      }
    }
  }
}
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxTokens` | number | 200000 | Maximum context window (set to 1000000 for Opus 4.5+) |
| `progressBarWidth` | number | 20 | Width of progress bar in characters |
| `showIcons` | boolean | true | Show Unicode icons |
| `colors.low` | string | "red" | Color for low context (< 25%) |
| `colors.medium` | string | "yellow" | Color for medium context (25-75%) |
| `colors.high` | string | "green" | Color for high context (> 75%) |

## Token Limits by Model

| Model | Max Tokens |
|-------|------------|
| Haiku | 200000 |
| Sonnet 4.x | 200000 |
| Opus 4.x | 200000 |
| Opus 4.5+ | 1000000 |

Set `maxTokens` accordingly in your configuration.

## Display Format

```
┌─────────────────────────────────────────────────────────┐
│  main  ~/src/features  [████████░░░░] 52% (104K/200K)   │
│         +42 -15  *                                     │
└─────────────────────────────────────────────────────────┘
```

### Legend
- `main` - Current git branch
- `~/src/features` - Relative path from git root
- `[████████░░░░]` - Progress bar
- `52%` - Context usage percentage
- `(104K/200K)` - Token count / max tokens
- `+42` - Lines inserted (current session)
- `-15` - Lines deleted (current session)
- `*` - Uncommitted changes

## Development

### Project Structure

```
statusline/
├── .claude-plugin/
│   └── plugin.json          # Plugin metadata
├── hooks/
│   ├── session-start.ts     # Session initialization hook
│   ├── user-prompt-submit.ts # Context update hook
│   └── utils/
│       ├── git.ts           # Git operations
│       ├── token.ts         # Token counting
│       └── progress.ts      # Progress bar rendering
├── src/
│   ├── types.ts             # TypeScript types
│   └── config.ts            # Configuration management
├── test/
│   └── statusline.test.ts   # Unit tests
├── package.json
├── tsconfig.json
└── README.md
```

### Building

```bash
# Install dependencies
bun install

# Build TypeScript
bun run build

# Run tests
bun test

# Lint
bun run lint
```

## Implementation Details

### Token Counting
The plugin counts tokens by:
1. Reading the `conversation_summary` from session data
2. Estimating tokens using ~4 chars per token (approximate)
3. Calculating percentage against configured max

### Git Information
- Branch: `git rev-parse --abbrev-ref HEAD`
- Root: `git rev-parse --show-toplevel`
- Status: `git status --porcelain`
- Diff stats: `git diff --shortstat`

### Progress Bar Algorithm
```typescript
const filled = Math.floor((tokens / maxTokens) * width);
const empty = width - filled;
const bar = "█".repeat(filled) + "░".repeat(empty);
```

## License

MIT © Yanis

## Contributing

Contributions welcome! Please read our contributing guidelines.

## Changelog

### 1.0.0 (2025-02-18)
- Initial release
- Git branch and path display
- Token counting with progress bar
- Cross-platform support
- Configuration options
