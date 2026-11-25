import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/** The folder that holds the pages: `pages/` in the current working directory. */
export function pagesDir(): string {
  return join(process.cwd(), "pages");
}

/** Throws if the title can't be used as a file name. */
export function checkTitle(title: string): void {
  if (title.trim() === "") throw new Error("A page title can't be empty.");
  if (title.includes("/") || title.includes("\\")) {
    throw new Error(`A page title can't contain / or \\: ${title}`);
  }
  if (title.startsWith(".")) throw new Error(`A page title can't start with a dot: ${title}`);
}

/** The file of a page: the title plus `.md`, e.g. "Other page" -> `pages/Other page.md`. */
export function pagePath(title: string): string {
  checkTitle(title);
  return join(pagesDir(), `${title}.md`);
}

export function pageExists(title: string): boolean {
  return existsSync(pagePath(title));
}

export function readPage(title: string): string {
  return readFileSync(pagePath(title), "utf8");
}

/** Writes a page, creating the `pages/` folder if needed. */
export function writePage(title: string, text: string): void {
  const path = pagePath(title);
  mkdirSync(pagesDir(), { recursive: true });
  writeFileSync(path, text);
}

/** The titles of all pages, sorted. Empty when there is no `pages/` folder. */
export function listPages(): string[] {
  const dir = pagesDir();
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith(".md") && !e.name.startsWith("."))
    .map((e) => e.name.slice(0, -".md".length))
    .sort((a, b) => a.localeCompare(b));
}

/** The pattern of a `[[Title]]` link; group 1 is the title. */
export const LINK_PATTERN = /\[\[([^\[\]\n]+?)\]\]/g;

/** The titles in the `[[...]]` links of a text, in order, trimmed. */
export function parseLinks(text: string): string[] {
  return [...text.matchAll(LINK_PATTERN)].map((m) => m[1]!.trim());
}
