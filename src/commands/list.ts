import { listPages } from "../pages";

/** `wiki list`: prints each page title, one per line, sorted. Returns the exit code. */
export default function list(args: string[]): number {
  if (args.length > 0) {
    console.error("Usage: wiki list");
    return 1;
  }
  const titles = listPages();
  if (titles.length === 0) {
    console.log("No pages yet. Create one with: wiki new <title>");
    return 0;
  }
  for (const title of titles) console.log(title);
  return 0;
}
