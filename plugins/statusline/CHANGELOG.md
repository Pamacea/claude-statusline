# Changelog

All notable changes to the Statusline plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.0] - 2025-02-18

### Added
- Initial release of Statusline plugin for Claude Code
- Git branch display with dirty state indicator (`*`)
- Current directory path (relative to git root)
- Token usage tracking with exact count and percentage
- Animated progress bar (Unicode/ASCII) with dynamic colors
- File operations tracking (insertions, deletions, modifications)
- Cross-platform support (Windows, macOS, Linux)
- Bun runtime for fast execution
- Configuration options for max tokens, progress bar width, and colors
- Auto-detection of model capabilities (200k vs 1M tokens)
- Color-coded progress bar:
  - Red (< 25% remaining): Low context
  - Yellow (25-75%): Medium context
  - Green (> 75%): Healthy context
- SessionStart hook for initial context injection
- UserPromptSubmit hook for real-time updates
- Comprehensive TypeScript types
- Unit tests with Bun test runner (17 tests)
- ESLint and Prettier configuration
- Full documentation with README

### Configuration
- `maxTokens`: Maximum context window (default: 200000, set to 1000000 for Opus 4.5+)
- `progressBarWidth`: Width of progress bar in characters (default: 20)
- `showIcons`: Show Unicode icons (default: true, auto-fallback to ASCII on Windows)
- `colors.low`: Color for low context (default: "red")
- `colors.medium`: Color for medium context (default: "yellow")
- `colors.high`: Color for high context (default: "green")

### Display Format
```
  main  ~/src/features  [████████░░░░] 52% (104K/200K)
        +42 -15  *
```

### Model Support
- Haiku: 200,000 tokens
- Sonnet 4.x: 200,000 tokens
- Opus 4.x: 200,000 tokens
- Opus 4.5+: 1,000,000 tokens

---

## [Unreleased]

### Planned
- Custom color schemes
- Additional git information (stash count, tag name)
- Configurable position and order of statusline elements
- Support for custom token counting methods
- Integration with external token counters
