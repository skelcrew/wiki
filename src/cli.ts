#!/usr/bin/env bun

const usage = `Usage: wiki <command> [args]

Commands:
  new <title>      Create a page and open it in $EDITOR
  show <title>     Print a page, with [[links]] highlighted
  list             List the pages
  search <word>    List pages that contain a word
  links <title>    List the pages that link to a page
  delete <title>   Delete a page`;

console.log(usage);
