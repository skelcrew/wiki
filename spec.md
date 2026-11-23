# Wiki spec

## What it is

A wiki in the terminal. Each page is a Markdown file in the `pages/` folder,
one file per page. The file name comes from the page title.

## Commands

| Command               | What it does                                                           |
| --------------------- | ---------------------------------------------------------------------- |
| `wiki new <title>`    | Creates a page and opens it in `$EDITOR`.                              |
| `wiki show <title>`   | Prints the page, with `[[links]]` highlighted.                         |
| `wiki list`           | Lists the pages.                                                       |
| `wiki search <word>`  | Lists matching pages, with the matching line and the word highlighted. |
| `wiki links <title>`  | Lists the pages that link to it.                                       |
| `wiki delete <title>` | Deletes the page.                                                      |

## Links

Write `[[Other page]]` to link to another page. A link to a page that doesn't
exist shows as missing.

## Open question

What should happen when you delete a page that other pages link to?
