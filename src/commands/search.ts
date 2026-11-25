import { match } from "../highlight";
import { listPages, readPage } from "../pages";

export const searchUsage = "Usage: wiki search <word>";

/** Escapes a string so it is matched literally inside a RegExp. */
function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * `wiki search <word>`: prints `<Page title>:<line number>: <line>` for every
 * line of every page that contains the word, case-insensitively, with each
 * occurrence highlighted. Titles are not searched. The arguments are joined
 * with spaces, so `wiki search two words` searches for the phrase; spaces in
 * a quoted query such as `wiki search ' cat '` are kept and must match.
 * Returns 0 when something matched, 1 otherwise.
 */
export default function search(args: string[]): number {
  // Spaces in a quoted query are part of it, so the joined query isn't trimmed.
  const word = args.join(" ");
  if (word.trim() === "") {
    console.error(searchUsage);
    return 1;
  }

  const pattern = new RegExp(escapeRegExp(word), "giu");
  let found = false;

  for (const title of listPages()) {
    let text: string;
    try {
      text = readPage(title);
    } catch (err) {
      console.error(`wiki search: ${err instanceof Error ? err.message : String(err)}`);
      continue;
    }

    const lines = text.split(/\r?\n/);
    lines.forEach((line, i) => {
      pattern.lastIndex = 0;
      if (!pattern.test(line)) return;
      found = true;
      const highlighted = line.replace(pattern, (m) => match(m));
      console.log(`${title}:${i + 1}: ${highlighted}`);
    });
  }

  if (!found) {
    console.log(`No pages match ${word}`);
    return 1;
  }
  return 0;
}
