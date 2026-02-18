/**
 * Tests for Statusline plugin
 */

import { describe, it, expect } from "bun:test";
import { estimateTokens, calculateTokenUsage, formatTokenCount } from "../hooks/utils/token.ts";
import { createProgressBar, renderProgressBar } from "../hooks/utils/progress.ts";
import { loadConfig, getMaxTokensForModel } from "../src/config.ts";
import { formatBranch, formatPath } from "../hooks/utils/git.ts";

describe("Token utilities", () => {
  it("estimateTokens - basic estimation", () => {
    const text = "hello world this is a test";
    const tokens = estimateTokens(text);
    // 27 chars / 4 = ~7 tokens (rounded up)
    expect(tokens).toBe(7);
  });

  it("estimateTokens - empty string", () => {
    expect(estimateTokens("")).toBe(0);
    expect(estimateTokens("   ")).toBe(0);
  });

  it("calculateTokenUsage - within limits", () => {
    const usage = calculateTokenUsage("some text here", 200000);
    expect(usage.current).toBe(4); // 16 chars / 4
    expect(usage.max).toBe(200000);
    expect(usage.percentage).toBe(0);
  });

  it("formatTokenCount - large numbers", () => {
    expect(formatTokenCount(500)).toBe("500");
    expect(formatTokenCount(1500)).toBe("2K");
    expect(formatTokenCount(15000)).toBe("15K");
    expect(formatTokenCount(1500000)).toBe("1.5M");
  });
});

describe("Progress bar", () => {
  it("createProgressBar - zero percentage", () => {
    const bar = createProgressBar(0, 20, true);
    expect(bar.filled).toBe(0);
    expect(bar.empty).toBe(20);
    expect(bar.color).toBe("high");
  });

  it("createProgressBar - half full", () => {
    const bar = createProgressBar(50, 20, true);
    expect(bar.filled).toBe(10);
    expect(bar.empty).toBe(10);
    expect(bar.color).toBe("medium");
  });

  it("createProgressBar - full", () => {
    const bar = createProgressBar(100, 20, true);
    expect(bar.filled).toBe(20);
    expect(bar.empty).toBe(0);
    expect(bar.color).toBe("low");
  });

  it("renderProgressBar - unicode", () => {
    const bar = { filled: 5, empty: 15, color: "high" };
    const rendered = renderProgressBar(bar, true, false);
    expect(rendered).toContain("[");
    expect(rendered).toContain("]");
  });

  it("renderProgressBar - ascii", () => {
    const bar = { filled: 5, empty: 15, color: "high" };
    const rendered = renderProgressBar(bar, false, false);
    expect(rendered).toBe("[#####---------------]");
  });
});

describe("Config", () => {
  it("loadConfig - default values", () => {
    const config = loadConfig();
    expect(config.maxTokens).toBeDefined();
    expect(config.progressBarWidth).toBeDefined();
    expect(config.showIcons).toBeDefined();
    expect(config.colors).toBeDefined();
  });

  it("getMaxTokensForModel - known models", () => {
    expect(getMaxTokensForModel("claude-opus-4-5")).toBe(1_000_000);
    expect(getMaxTokensForModel("claude-opus-4-6")).toBe(1_000_000);
    expect(getMaxTokensForModel("claude-3-5-sonnet")).toBe(200_000);
    expect(getMaxTokensForModel("claude-3-5-haiku")).toBe(200_000);
    expect(getMaxTokensForModel("unknown-model")).toBe(200_000);
  });
});

describe("Git formatting", () => {
  it("formatBranch - clean", () => {
    expect(formatBranch("main", false)).toBe("main");
  });

  it("formatBranch - dirty", () => {
    expect(formatBranch("main", true)).toBe("main*");
    expect(formatBranch("feature/test", true)).toBe("feature/test*");
  });

  it("formatPath - root", () => {
    expect(formatPath(".")).toBe("~");
  });

  it("formatPath - single level", () => {
    expect(formatPath("src")).toBe("~/src");
    expect(formatPath("src/features")).toBe("~/src/features");
  });

  it("formatPath - deep path", () => {
    const result = formatPath("src/components/button/components");
    // Should truncate deep paths
    expect(result).toBeDefined();
    expect(result).toContain("...");
  });
});

describe("Integration", () => {
  it("buildStatusline - full integration", async () => {
    const gitInfo = {
      branch: "main",
      root: "/project",
      currentPath: "/project/src",
      relativePath: "src",
      dirty: false,
      staged: false,
      commitsAhead: 0,
      commitsBehind: 0,
    };

    const fileStats = {
      insertions: 10,
      deletions: 5,
      modifications: 2,
    };

    const tokenUsage = {
      current: 100000,
      max: 200000,
      percentage: 50,
    };

    const config = loadConfig();

    const { buildStatusline } = await import("../hooks/utils/display.ts");
    const display = buildStatusline(gitInfo, fileStats, tokenUsage, config);

    expect(display.branch).toBeDefined();
    expect(display.path).toBeDefined();
    expect(display.progressBar).toBeDefined();
    expect(display.tokenInfo).toBeDefined();
    expect(display.full).toBeDefined();
  });
});
