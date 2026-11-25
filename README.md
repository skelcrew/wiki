# wiki

A small wiki that lives in your terminal. Pages are plain Markdown files in a
`pages/` folder, linked with `[[Page title]]`. See [spec.md](spec.md) for what
it will do.

```sh
bun install          # install dependencies
bun run src/cli.ts   # run it (or: bun link, then wiki)
bun test             # run the tests
```

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
