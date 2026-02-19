# Claude Code Statusline Plugin

Advanced native statusline for Claude Code with git branch, path, token context, cost tracking, and progress bar.

**Displays a persistent statusline at the top of your Claude Code sessions.**

## Preview

```
main | ~/claude-statusline | Claude Opus 4.6
S: $0.12 | 45.2k/200k | [████████░░] 23% (12m)
```

## Features

| Feature | Description |
|---------|-------------|
| **Git Status** | Branch name, dirty indicator (*), added/deleted lines |
| **Project Path** | Relative path (full/truncated/basename modes) |
| **Token Usage** | Exact count with percentage and progress bar |
| **Session Cost** | Track API costs per session |
| **Session Duration** | Track time spent in session |
| **Progress Bar** | Multiple styles: filled, rectangle, braille |
| **Progressive Colors** | Green → Yellow → Red based on usage |
| **Cross-Platform** | Works on Windows, macOS, and Linux |
| **Hook Input** | Reads data from Claude Code hooks |

## Quick Start

### Option 1: Clone & Install (Recommended)

```bash
# Clone the repository
git clone https://github.com/Pamacea/claude-statusline.git
cd claude-statusline

# Install dependencies and build
npm install
npm run build

# Run the installer
npm run install:statusline

# Restart Claude Code
```

### Option 2: Manual Installation

1. **Build the statusline:**
   ```bash
   npm run build:statusline
   ```

2. **Copy the compiled script:**
   ```bash
   # Unix/macOS
   cp plugins/statusline/dist/index.js ~/.claude/statusline.js
   chmod +x ~/.claude/statusline.js

   # Windows (PowerShell)
   Copy-Item plugins\statusline\dist\index.js $env:USERPROFILE\.claude\statusline.js
   ```

3. **Update `~/.claude/settings.json`:**
   ```json
   {
     "statusLine": {
       "type": "command",
       "command": "node ~/.claude/statusline.js",
       "padding": 0
     }
   }
   ```

4. **Restart Claude Code**

## Configuration

Create a configuration file at `~/.claude/statusline.config.json`:

```json
{
  "oneLine": false,
  "pathDisplayMode": "truncated",
  "git": {
    "enabled": true,
    "showBranch": true,
    "showDirtyIndicator": true,
    "showChanges": true,
    "showStaged": false,
    "showUnstaged": false
  },
  "separator": "|",
  "session": {
    "infoSeparator": "•",
    "cost": { "enabled": true, "format": "decimal1" },
    "duration": { "enabled": true },
    "tokens": { "enabled": true, "showMax": true, "showDecimals": true },
    "percentage": {
      "enabled": true,
      "showValue": true,
      "progressBar": {
        "enabled": true,
        "length": 10,
        "style": "filled",
        "color": "progressive",
        "background": "none"
      }
    }
  }
}
```

### Configuration Options

#### Display Mode
- `oneLine`: `true` for single line, `false` for two lines
- `pathDisplayMode`: `"full"`, `"truncated"`, or `"basename"`
- `showSonnetModel`: Show model name even for Sonnet

#### Git Options
- `enabled`: Show git information
- `showBranch`: Show branch name
- `showDirtyIndicator`: Show `*` for uncommitted changes
- `showChanges`: Show added/deleted line counts
- `showStaged`: Show staged file count
- `showUnstaged`: Show unstaged file count

#### Progress Bar Styles
- `style`: `"filled"` (█), `"rectangle"` (▰▱), or `"braille"` (⣿)
- `color`: `"progressive"`, `"green"`, `"yellow"`, `"red"`, `"peach"`
- `background`: `"none"`, `"dark"`, `"gray"`, `"light"`, `"blue"`, `"purple"`, `"cyan"`
- `length`: 5, 10, or 15 characters

## Display Format

```
main | ~/claude-statusline | Claude Opus 4.6
S: $0.12 | 45.2k/200k | [████████░░] 23% (12m)
│  │  │                │  │           │    │
│  │  │                │  │           │    └─ Session duration
│  │  │                │  │           └────── Percentage
│  │  │                │  └────────────────── Progress bar (colored)
│  │  │                └───────────────────── Token usage
│  │  └────────────────────────────────────── Session cost
│  └───────────────────────────────────────── Separator
└──────────────────────────────────────────── Git branch + path + model
```

## Model Support

| Model | Max Tokens |
|-------|------------|
| Haiku | 200,000 |
| Sonnet 4.x | 200,000 |
| Opus 4.x | 200,000 |
| Opus 4.5+ | 1,000,000 |

## Cross-Platform Compatibility

### Windows
- Requires Git for Windows
- Works with Windows Terminal, PowerShell, CMD
- Automatically detects terminal capabilities

### macOS
- Requires Git (installed via Xcode Command Line Tools)
- Works with Terminal, iTerm2

### Linux
- Requires Git
- Works with most terminal emulators

## Troubleshooting

### Statusline not appearing

1. **Test the script manually:**
   ```bash
   node ~/.claude/statusline.js
   ```
   You should see a colored statusline output.

2. **Check your settings:**
   ```bash
   # Unix/macOS
   cat ~/.claude/settings.json | grep -A 3 statusLine

   # Windows (PowerShell)
   Get-Content $env:USERPROFILE\.claude\settings.json | Select-String -Pattern statusLine -Context 0,3
   ```

3. **Restart Claude Code completely** (not just reconnect)

### Git information not showing

- Ensure you're in a git repository
- Check that git is installed: `git --version`
- The statusline will show `no-git` when not in a repository

### Unicode icons showing as boxes

- Use a modern terminal (Windows Terminal, iTerm2, etc.)
- Or configure your terminal to use a Nerd Font

## Development

```bash
# Install dependencies
npm install

# Run TypeScript compiler in watch mode
npm run dev

# Type check
npm run typecheck

# Build for distribution
npm run build

# Run tests
npm test

# Lint
npm run lint
npm run lint:fix
```

## Project Structure

```
plugins/statusline/
├── src/
│   ├── index.ts           # Main entry point
│   └── lib/
│       ├── types.ts       # Type definitions
│       ├── config.ts      # Configuration management
│       ├── colors.ts      # Terminal colors
│       ├── git.ts         # Git status detection
│       ├── formatters.ts  # Formatting utilities
│       ├── context.ts     # Token context tracking
│       └── render.ts      # Statusline rendering
├── dist/                  # Compiled JavaScript
└── defaults.json          # Default configuration
```

## License

MIT License - see [LICENSE](LICENSE) for details.
