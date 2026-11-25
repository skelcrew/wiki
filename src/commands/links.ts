import { checkTitle, listPages, parseLinks, readPage } from "../pages";

export const linksUsage = "Usage: wiki links <title>";

/**
 * `wiki links <title>`: prints the title of every page that contains a
 * `[[link]]` to the page, one per line, sorted. A page that links to itself
 * is listed too. The arguments are joined with spaces, so
 * `wiki links Getting started` works without quotes. Returns the exit code.
 */
export default function links(args: string[]): number {
  const title = args.join(" ").trim();
  if (title === "") {
    console.error(linksUsage);
    return 1;
  }

  const linkers: string[] = [];
  try {
    checkTitle(title);
    // Only Markdown files are pages, so a folder named "<title>.md" isn't one.
    const pages = listPages();
    if (!pages.includes(title)) {
      // JSON.stringify quotes the title and escapes line breaks, keeping the message on one line.
      console.error(`wiki links: no page named ${JSON.stringify(title)}`);
      return 1;
    }
    // listPages is sorted, so linkers is too.
    for (const page of pages) {
      if (parseLinks(readPage(page)).includes(title)) linkers.push(page);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // The message can quote the title; escape line breaks to keep it on one line.
    console.error(`wiki links: ${message.replace(/\r/g, "\\r").replace(/\n/g, "\\n")}`);
    return 1;
  }

  if (linkers.length === 0) {
    console.log(`No pages link to "${title}".`);
    return 0;
  }
  for (const page of linkers) console.log(page);
  return 0;
}
