# Claude Code Statusline Plugin

Advanced statusline plugin for Claude Code with git branch, path, token context, and progress bar.

## Quick Start

Add the marketplace and install the plugin:

```bash
# Add the marketplace
/plugin marketplace add https://github.com/Pamacea/claude-statusline.git

# Install the statusline plugin
/plugin install statusline@claude-statusline

# Restart Claude Code
claude -r
```

## Features

- **Git branch** display with dirty state indicator (`*`)
- **Current directory** path (relative to git root)
- **Token usage** tracking with exact count and percentage
- **Progress bar** (Unicode/ASCII) with dynamic colors
- **File operations** tracking (insertions, deletions, modifications)
- **Cross-platform** support (Windows, macOS, Linux)
- **Model-aware** token limits (200k vs 1M)

## Display Format

```
  main  ~/src/features  [████████░░░░] 52% (104K/200K)
        +42 -15  *
```

## Model Support

| Model | Max Tokens |
|-------|------------|
| Haiku | 200,000 |
| Sonnet 4.x | 200,000 |
| Opus 4.x | 200,000 |
| Opus 4.5+ | 1,000,000 |

## Configuration

Create `.plugin-config/statusline.json` in your project:

```json
{
  "maxTokens": 200000,
  "progressBarWidth": 20,
  "showIcons": true,
  "colors": {
    "low": "red",
    "medium": "yellow",
    "high": "green"
  }
}
```

## License

MIT License - see [LICENSE](LICENSE) for details.
