# wiki

A small wiki that lives in your terminal. Pages are plain Markdown files in a
`pages/` folder, linked with `[[Page title]]`. See [spec.md](spec.md) for what
it will do.

```sh
bun install          # install dependencies
bun run src/cli.ts   # run it (or: bun link, then wiki)
bun test             # run the tests
```
