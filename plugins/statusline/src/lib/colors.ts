/**
 * Cross-platform terminal colors using ANSI escape codes
 * Compatible with Windows, macOS, and Linux
 */

import type { ColorFunction, Colors } from "./types.js";

/**
 * ANSI color codes
 */
const ANSI = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  italic: "\x1b[3m",
  underline: "\x1b[4m",
  blink: "\x1b[5m",
  inverse: "\x1b[7m",
  hidden: "\x1b[8m",
  strikethrough: "\x1b[9m",

  // Foreground colors
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",

  // Bright foreground colors
  brightBlack: "\x1b[90m",
  brightRed: "\x1b[91m",
  brightGreen: "\x1b[92m",
  brightYellow: "\x1b[93m",
  brightBlue: "\x1b[94m",
  brightMagenta: "\x1b[95m",
  brightCyan: "\x1b[96m",
  brightWhite: "\x1b[97m",

  // Background colors
  bgBlack: "\x1b[40m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
  bgWhite: "\x1b[47m",

  // Bright background colors
  bgBlackBright: "\x1b[100m",
  bgRedBright: "\x1b[101m",
  bgGreenBright: "\x1b[102m",
  bgYellowBright: "\x1b[103m",
  bgBlueBright: "\x1b[104m",
  bgMagentaBright: "\x1b[105m",
  bgCyanBright: "\x1b[106m",
  bgWhiteBright: "\x1b[107m",
} as const;

/**
 * Create a color function
 */
function color(code: string): ColorFunction {
  return (text: string | number) => `${code}${String(text)}${ANSI.reset}`;
}

/**
 * Create a background color function
 */
function bgColor(code: string): ColorFunction {
  return (text: string | number) => `${code}${String(text)}${ANSI.reset}`;
}

/**
 * Special colors (256-color or RGB)
 */
function orange(text: string | number): string {
  return `\x1b[38;5;208m${String(text)}${ANSI.reset}`;
}

function peach(text: string | number): string {
  return `\x1b[38;2;222;115;86m${String(text)}${ANSI.reset}`;
}

function bgPeach(text: string | number): string {
  return `\x1b[48;2;222;115;86m${String(text)}${ANSI.reset}`;
}

/**
 * Exported colors object
 */
export const colors: Colors = {
  // Basic colors
  green: color(ANSI.brightGreen),
  red: color(ANSI.brightRed),
  purple: color(ANSI.brightMagenta),
  yellow: color(ANSI.brightYellow),
  orange,
  peach,
  bgPeach,

  // Grays
  black: color(ANSI.black),
  white: color(ANSI.white),
  gray: color(ANSI.brightBlack),
  dimWhite: color(ANSI.white),
  lightGray: color(ANSI.brightWhite),

  // Other colors
  cyan: color(ANSI.brightCyan),
  blue: color(ANSI.brightBlue),

  // Background colors
  bgBlack: bgColor(ANSI.bgBlack),
  bgBlackBright: bgColor(ANSI.bgBlackBright),
  bgWhite: bgColor(ANSI.bgWhite),
  bgBlue: bgColor(ANSI.bgBlue),
  bgMagenta: bgColor(ANSI.bgMagenta),
  bgCyan: bgColor(ANSI.bgCyan),

  // Text styles
  dim: color(ANSI.dim),
  bold: color(ANSI.bold),
  hidden: color(ANSI.hidden),
  italic: color(ANSI.italic),
  underline: color(ANSI.underline),
  strikethrough: color(ANSI.strikethrough),
  reset: color(ANSI.reset),
  inverse: color(ANSI.inverse),
};

/**
 * Check if colors are supported
 */
export function supportsColor(): boolean {
  // Check FORCE_COLOR environment variable
  const forceColor = process.env.FORCE_COLOR;
  if (forceColor !== undefined) {
    return forceColor !== "0";
  }

  // Check CI environment
  if (process.env.CI) {
    return false;
  }

  // Check NO_COLOR environment variable
  if (process.env.NO_COLOR) {
    return false;
  }

  // Check for terminal support on Windows
  if (process.platform === "win32") {
    // Windows Terminal or modern ConEmu
    const wtSession = process.env.WT_SESSION;
    const conEmuAns = process.env.CONEMUANSI;
    if (wtSession || conEmuAns) {
      return true;
    }

    // Check if we're in a terminal that supports ANSI
    // This is a simplified check - in practice, we assume yes for modern Windows
    return true;
  }

  // Unix-like systems - check for terminal
  return process.env.TERM !== "dumb";
}

/**
 * Strip ANSI codes from a string
 */
export function stripAnsi(str: string): string {
  return str.replace(
    /[\x1b\x9b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
    ""
  );
}
