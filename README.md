# wiki

A small wiki that lives in your terminal. Pages are plain Markdown files in a
`pages/` folder, linked with `[[Page title]]`.

```sh
bun install          # install dependencies
bun run src/cli.ts   # run it (or: bun link, then wiki)
bun test             # run the tests
```

## Commands

These work today:

- `wiki new <title>` creates the page with a `# <title>` heading and opens it
  in `$EDITOR` (without `$EDITOR`, it prints the page's path). It never
  overwrites an existing page.

  ```sh
  wiki new Meeting notes
  ```

- `wiki show <title>` prints the page with its `[[links]]` highlighted, and
  links to pages that don't exist yet in a different style.

  ```sh
  wiki show Getting started
  ```

- `wiki list` prints every page title, one per line, sorted.

  ```sh
  wiki list
  ```

Titles with spaces work without quotes. Planned but not built yet:
`wiki search <word>`, `wiki links <title>` and `wiki delete <title>`. See
[spec.md](spec.md) for what they will do.

## Layout

```text
src/cli.ts          reads the command and calls its handler
src/commands/*.ts   one file per command (new, show, list, search, links, delete)
src/pages.ts        page storage: pagePath, pageExists, readPage, writePage, listPages, parseLinks
src/highlight.ts    terminal colors for links, missing links and search matches
pages/              the pages, one Markdown file each, named <title>.md
test/               one test file per module or command
```

Each handler takes the command's arguments and returns the exit code. To build
a command, edit only its file in `src/commands/` and add its own test file,
such as `test/show.test.ts`.
