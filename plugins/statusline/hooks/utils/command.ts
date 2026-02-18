/**
 * Cross-platform command execution utility
 * Works with both Bun and Deno
 */

export interface CommandResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
}

/**
 * Get current working directory (cross-platform)
 */
export function getCwd(): string {
  // @ts-expect-error - Bun/Deno compatibility
  if (typeof Deno !== "undefined") {
    // @ts-expect-error - Bun/Deno compatibility
    return Deno.cwd();
  }
  return process.cwd();
}

/**
 * Execute a command (cross-platform)
 */
export async function execCommand(
  command: string,
  args: string[],
  options?: { cwd?: string },
): Promise<CommandResult> {
  const cwd = options?.cwd || getCwd();

  try {
    // @ts-expect-error - Bun/Deno compatibility
    if (typeof Deno !== "undefined" && Deno.Command) {
      // Use Deno.Command
      const cmd = new Deno.Command(command, {
        args,
        cwd,
        stdout: "piped",
        stderr: "piped",
      });

      const output = await cmd.output();
      const decoder = new TextDecoder();

      return {
        success: output.success,
        stdout: decoder.decode(output.stdout).trim(),
        stderr: decoder.decode(output.stderr).trim(),
        exitCode: output.code,
      };
    } else {
      // Use Bun's spawn or Node's child_process
      const { spawn } = await import("child_process");

      return await new Promise((resolve) => {
        const proc = spawn(command, args, {
          cwd,
          shell: true,
          windowsHide: true,
        });

        let stdout = "";
        let stderr = "";

        proc.stdout?.on("data", (data: Buffer) => {
          stdout += data.toString();
        });

        proc.stderr?.on("data", (data: Buffer) => {
          stderr += data.toString();
        });

        proc.on("close", (code) => {
          resolve({
            success: code === 0,
            stdout: stdout.trim(),
            stderr: stderr.trim(),
            exitCode: code || 0,
          });
        });

        proc.on("error", () => {
          resolve({
            success: false,
            stdout: "",
            stderr: "",
            exitCode: -1,
          });
        });
      });
    }
  } catch {
    return {
      success: false,
      stdout: "",
      stderr: "",
      exitCode: -1,
    };
  }
}

/**
 * Execute a git command
 */
export async function execGitCommand(
  args: string[],
  cwd?: string,
): Promise<string> {
  const gitArgs = ["-C", cwd || getCwd(), ...args];
  const result = await execCommand("git", gitArgs);
  return result.success ? result.stdout : "";
}

/**
 * Check if a command exists
 */
export async function commandExists(command: string): Promise<boolean> {
  const result = await execCommand(
    process.platform === "win32" ? "where" : "which",
    [command],
  );
  return result.success;
}
