#!/usr/bin/env -S bun run
/**
 * Test hook execution by simulating Claude Code input
 */

import { spawn } from "child_process";

const HOOK_PATH = "./dist/session-start.js";

// Simulate Claude Code hook input
const hookInput = {
  eventName: "SessionStart",
  working_directory: process.cwd(),
  model: "claude-opus-4-6",
  conversation_summary: "This is a test conversation summary with some content to simulate token usage.",
};

console.log("🧪 Testing Hook Execution");
console.log("=" .repeat(50));
console.log("\n📥 Input:");
console.log(JSON.stringify(hookInput, null, 2));
console.log("\n📤 Output:");

try {
  const proc = spawn("bun", [HOOK_PATH], {
    cwd: process.cwd(),
    stdio: ["pipe", "inherit", "inherit"],
  });

  // Write input to stdin
  proc.stdin.write(JSON.stringify(hookInput));
  proc.stdin.end();

  await new Promise((resolve, reject) => {
    proc.on("close", (code) => {
      if (code === 0) {
        console.log("\n✅ Hook executed successfully!");
        resolve(undefined);
      } else {
        console.error(`\n❌ Hook failed with exit code ${code}`);
        reject(undefined);
      }
    });
    proc.on("error", (err) => {
      console.error("\n❌ Hook error:", err);
      reject(err);
    });
  });
} catch (error) {
  console.error("❌ Test failed:", error);
  process.exit(1);
}
