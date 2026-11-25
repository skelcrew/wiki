// Terminal highlighting shared by the commands. Colors are skipped when
// NO_COLOR is set or stdout isn't a terminal.

import { LINK_PATTERN } from "./pages";

const RESET = "\x1b[0m";

export function useColor(): boolean {
  return !process.env.NO_COLOR && process.stdout.isTTY === true;
}

function paint(codes: string, text: string, color: boolean): string {
  return color ? `\x1b[${codes}m${text}${RESET}` : text;
}

/** A link to a page that exists: bold cyan. */
export function link(text: string, color = useColor()): string {
  return paint("1;36", text, color);
}

/** A link to a page that doesn't exist: red, underlined. */
export function missingLink(text: string, color = useColor()): string {
  return paint("4;31", text, color);
}

/** A search match: black on yellow. */
export function match(text: string, color = useColor()): string {
  return paint("30;43", text, color);
}

/**
 * Highlights every `[[Title]]` link in a text, using `exists(title)` to pick
 * the link or missing-link style. Without color, missing links get a
 * ` (missing)` mark so they still show.
 */
export function highlightLinks(
  text: string,
  exists: (title: string) => boolean,
  color = useColor(),
): string {
  return text.replace(LINK_PATTERN, (whole, title: string) => {
    if (exists(title.trim())) return link(whole, color);
    return color ? missingLink(whole, color) : `${whole} (missing)`;
  });
}
