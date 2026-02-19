/**
 * Cross-platform I/O utilities
 * Works with both Bun and Deno
 */

/**
 * Read all input from stdin
 */
export async function readStdin(): Promise<string> {
  // @ts-expect-error - Bun/Deno compatibility
  if (typeof Deno !== "undefined" && Deno.readAll) {
    // @ts-expect-error - Bun/Deno compatibility
    const decoder = new TextDecoder();
    // @ts-expect-error - Bun/Deno compatibility
    const rawData = await Deno.readAll(Deno.stdin);
    return decoder.decode(rawData);
  } else {
    // Bun/Node.js
    const chunks: Buffer[] = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks).toString("utf-8");
  }
}

/**
 * Write to stdout
 */
export async function writeStdout(text: string): Promise<void> {
  // @ts-expect-error - Bun/Deno compatibility
  if (typeof Deno !== "undefined" && Deno.stdout) {
    // @ts-expect-error - Bun/Deno compatibility
    await Deno.stdout.write(new TextEncoder().encode(text));
  } else {
    // Bun/Node.js
    process.stdout.write(text);
  }
}

/**
 * Write to stderr
 */
export async function writeStderr(text: string): Promise<void> {
  // @ts-expect-error - Bun/Deno compatibility
  if (typeof Deno !== "undefined" && Deno.stderr) {
    // @ts-expect-error - Bun/Deno compatibility
    await Deno.stderr.write(new TextEncoder().encode(text));
  } else {
    // Bun/Node.js
    process.stderr.write(text);
  }
}

/**
 * Get current working directory
 */
export function getCwd(): string {
  // @ts-expect-error - Bun/Deno compatibility
  if (typeof Deno !== "undefined" && Deno.cwd) {
    // @ts-expect-error - Bun/Deno compatibility
    return Deno.cwd();
  }
  return process.cwd();
}

/**
 * Exit process
 */
export function exit(code: number): never {
  // @ts-expect-error - Bun/Deno compatibility
  if (typeof Deno !== "undefined" && Deno.exit) {
    // @ts-expect-error - Bun/Deno compatibility
    Deno.exit(code);
  }
  process.exit(code);
}
