#!/usr/bin/env bun

// Reads the command and hands its arguments to the handler in
// src/commands/<command>.ts. Each handler returns the exit code.

import deletePage from "./commands/delete";
import links from "./commands/links";
import list from "./commands/list";
import newPage from "./commands/new";
import search from "./commands/search";
import show from "./commands/show";

export const usage = `Usage: wiki <command> [args]

Commands:
  new <title>      Create a page and open it in $EDITOR
  show <title>     Print a page, with [[links]] highlighted
  list             List the pages
  search <word>    List pages that contain a word
  links <title>    List the pages that link to a page
  delete <title>   Delete a page`;

type Handler = (args: string[]) => number | Promise<number>;

const commands: Record<string, Handler> = {
  new: newPage,
  show,
  list,
  search,
  links,
  delete: deletePage,
};

/** Runs the command in `argv` (without `bun` and the script) and returns the exit code. */
export async function main(argv: string[]): Promise<number> {
  const [name, ...args] = argv;
  const handler = name !== undefined && Object.hasOwn(commands, name) ? commands[name] : undefined;
  if (!handler) {
    console.log(usage);
    return name === undefined ? 0 : 1;
  }
  return handler(args);
}

if (import.meta.main) {
  process.exitCode = await main(process.argv.slice(2));
}
