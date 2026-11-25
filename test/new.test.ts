import { afterEach, beforeEach, expect, spyOn, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import newPage from "../src/commands/new";

let dir: string;
let oldCwd: string;
let oldEditor: string | undefined;
let log: ReturnType<typeof spyOn>;
let error: ReturnType<typeof spyOn>;

beforeEach(() => {
  oldCwd = process.cwd();
  oldEditor = process.env.EDITOR;
  dir = mkdtempSync(join(tmpdir(), "wiki-new-"));
  process.chdir(dir);
  // Never launch a real editor: `true` exits at once.
  process.env.EDITOR = "true";
  log = spyOn(console, "log").mockImplementation(() => {});
  error = spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  log.mockRestore();
  error.mockRestore();
  if (oldEditor === undefined) delete process.env.EDITOR;
  else process.env.EDITOR = oldEditor;
  process.chdir(oldCwd);
  rmSync(dir, { recursive: true, force: true });
});

const page = (title: string) => join(dir, "pages", `${title}.md`);

test("creates pages/ and the page with a heading", async () => {
  expect(await newPage(["My", "page"])).toBe(0);
  expect(readFileSync(page("My page"), "utf8")).toBe("# My page\n");
});

test("opens the page in $EDITOR and waits for it", async () => {
  // The editor appends to the file it is given, so the page proves it ran on it.
  process.env.EDITOR = "echo edited >>";
  expect(await newPage(["Home"])).toBe(0);
  expect(readFileSync(page("Home"), "utf8")).toBe("# Home\nedited\n");
});

test("without $EDITOR, creates the page and prints its path", async () => {
  delete process.env.EDITOR;
  expect(await newPage(["Home"])).toBe(0);
  expect(readFileSync(page("Home"), "utf8")).toBe("# Home\n");
  expect(log).toHaveBeenCalledWith(join(process.cwd(), "pages", "Home.md"));
});

test("an existing page is not overwritten", async () => {
  mkdirSync(join(dir, "pages"));
  writeFileSync(page("Home"), "keep me");
  expect(await newPage(["Home"])).toBe(1);
  expect(readFileSync(page("Home"), "utf8")).toBe("keep me");
  expect(error).toHaveBeenCalled();
});

test("a missing title fails", async () => {
  expect(await newPage([])).toBe(1);
  expect(await newPage(["  "])).toBe(1);
  expect(error).toHaveBeenCalled();
  expect(existsSync(join(dir, "pages"))).toBe(false);
});

test("an invalid title fails", async () => {
  for (const title of ["a/b", "a\\b", ".hidden"]) {
    expect(await newPage([title])).toBe(1);
  }
  expect(error).toHaveBeenCalledTimes(3);
  expect(existsSync(join(dir, "pages"))).toBe(false);
});

test("an editor that fails makes the command fail but keeps the page", async () => {
  process.env.EDITOR = "false";
  expect(await newPage(["Home"])).toBe(1);
  expect(readFileSync(page("Home"), "utf8")).toBe("# Home\n");
});
