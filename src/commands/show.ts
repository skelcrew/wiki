import { highlightLinks } from "../highlight";
import { pageExists, readPage } from "../pages";

export const showUsage = "Usage: wiki show <title>";

/** Whether a linked page exists; a title that can't be a page counts as missing. */
function linkExists(title: string): boolean {
  try {
    return pageExists(title);
  } catch {
    return false;
  }
}

/**
 * `wiki show <title>`: prints the page's Markdown with each `[[link]]`
 * highlighted, and links to missing pages in the missing-link style.
 * The arguments are joined with spaces, so `wiki show Getting started` works
 * without quotes. Returns the exit code.
 */
export default function show(args: string[]): number {
  const title = args.join(" ").trim();
  if (title === "") {
    console.error(showUsage);
    return 1;
  }

  let text: string;
  try {
    if (!pageExists(title)) {
      console.error(`wiki show: no page named "${title}"`);
      return 1;
    }
    text = readPage(title);
  } catch (err) {
    console.error(`wiki show: ${err instanceof Error ? err.message : String(err)}`);
    return 1;
  }

  // console.log adds the final newline itself.
  console.log(highlightLinks(text.replace(/\r?\n$/, ""), linkExists));
  return 0;
}
