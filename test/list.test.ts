import { afterEach, beforeEach, expect, spyOn, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import list from "../src/commands/list";
import { pagesDir, writePage } from "../src/pages";

let dir: string;
let oldCwd: string;
let log: ReturnType<typeof spyOn>;
let error: ReturnType<typeof spyOn>;

beforeEach(() => {
  oldCwd = process.cwd();
  dir = mkdtempSync(join(tmpdir(), "wiki-list-"));
  process.chdir(dir);
  log = spyOn(console, "log").mockImplementation(() => {});
  error = spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  log.mockRestore();
  error.mockRestore();
  process.chdir(oldCwd);
  rmSync(dir, { recursive: true, force: true });
});

const printed = () => log.mock.calls.map((c: unknown[]) => c.join(" "));

test("prints each title, one per line, sorted", () => {
  writePage("Zebra", "");
  writePage("Apple pie", "");
  writePage("Middle", "");
  expect(list([])).toBe(0);
  expect(printed()).toEqual(["Apple pie", "Middle", "Zebra"]);
});

test("without a pages/ folder prints a friendly message and succeeds", () => {
  expect(list([])).toBe(0);
  expect(printed()).toEqual(["No pages yet. Create one with: wiki new <title>"]);
});

test("with an empty pages/ folder prints a friendly message and succeeds", () => {
  mkdirSync(pagesDir());
  expect(list([])).toBe(0);
  expect(printed()).toEqual(["No pages yet. Create one with: wiki new <title>"]);
});

test("rejects extra arguments", () => {
  expect(list(["extra"])).toBe(1);
  expect(error).toHaveBeenCalledWith("Usage: wiki list");
  expect(log).not.toHaveBeenCalled();
});
