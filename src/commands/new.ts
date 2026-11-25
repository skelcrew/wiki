import { mkdirSync, writeFileSync } from "node:fs";
import { pagePath, pagesDir } from "../pages";

/**
 * `wiki new <title>`: creates the page with a `# <title>` heading, then opens
 * it in `$EDITOR` and waits for the editor to exit. Without `$EDITOR`, it
 * prints the page's path instead. Never overwrites an existing page.
 * Returns the exit code.
 */
export default async function newPage(args: string[]): Promise<number> {
  const title = args.join(" ").trim();
  if (title === "") {
    console.error("Usage: wiki new <title>");
    return 1;
  }

  let path: string;
  try {
    path = pagePath(title);
  } catch (e) {
    console.error(`wiki new: ${(e as Error).message}`);
    return 1;
  }

  mkdirSync(pagesDir(), { recursive: true });
  try {
    // "wx" fails if the file exists, so an existing page is never overwritten.
    writeFileSync(path, `# ${title}\n`, { flag: "wx" });
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "EEXIST") {
      console.error(`wiki new: the page "${title}" already exists: ${path}`);
      return 1;
    }
    throw e;
  }

  const editor = process.env.EDITOR?.trim();
  if (!editor) {
    console.log(path);
    return 0;
  }

  // Run through the shell so an EDITOR with arguments, such as "code -w", works.
  const child = Bun.spawn(["sh", "-c", `${editor} "$1"`, "sh", path], {
    stdio: ["inherit", "inherit", "inherit"],
  });
  const code = await child.exited;
  if (code !== 0) {
    console.error(`wiki new: the editor exited with code ${code}; the page was created at ${path}`);
    return 1;
  }
  return 0;
}
