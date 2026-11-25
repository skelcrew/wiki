import { afterEach, beforeEach, expect, spyOn, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import search, { searchUsage } from "../src/commands/search";
import { match } from "../src/highlight";
import { writePage } from "../src/pages";

let dir: string;
let oldCwd: string;
let oldNoColor: string | undefined;
let oldIsTTY: boolean;
let log: ReturnType<typeof spyOn>;
let error: ReturnType<typeof spyOn>;

beforeEach(() => {
  oldCwd = process.cwd();
  dir = mkdtempSync(join(tmpdir(), "wiki-search-"));
  process.chdir(dir);
  oldNoColor = process.env.NO_COLOR;
  oldIsTTY = process.stdout.isTTY;
  log = spyOn(console, "log").mockImplementation(() => {});
  error = spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  log.mockRestore();
  error.mockRestore();
  if (oldNoColor === undefined) delete process.env.NO_COLOR;
  else process.env.NO_COLOR = oldNoColor;
  process.stdout.isTTY = oldIsTTY;
  process.chdir(oldCwd);
  rmSync(dir, { recursive: true, force: true });
});

function withColor(on: boolean) {
  if (on) delete process.env.NO_COLOR;
  else process.env.NO_COLOR = "1";
  process.stdout.isTTY = on;
}

const printed = () => log.mock.calls.map((c: unknown[]) => c.join(" "));

test("lists matching lines across pages, in title then line order", () => {
  withColor(false);
  writePage("Zebra", "stripes\nno match\nmore stripes\n");
  writePage("Apple", "red\nstripes here\n");
  writePage("Middle", "nothing\n");
  expect(search(["stripes"])).toBe(0);
  expect(printed()).toEqual(["Apple:2: stripes here", "Zebra:1: stripes", "Zebra:3: more stripes"]);
});

test("does not search titles", () => {
  withColor(false);
  writePage("Links", "nothing here\n");
  expect(search(["links"])).toBe(1);
});

test("matches case-insensitively and as a substring, keeping the original casing", () => {
  withColor(true);
  writePage("Home", "Links and linked pages\n");
  expect(search(["LINK"])).toBe(0);
  expect(printed()).toEqual([`Home:1: ${match("Link", true)}s and ${match("link", true)}ed pages`]);
});

test("highlights every match on a line", () => {
  withColor(true);
  writePage("Home", "cat, cat and CAT\n");
  expect(search(["cat"])).toBe(0);
  expect(printed()).toEqual([`Home:1: ${match("cat", true)}, ${match("cat", true)} and ${match("CAT", true)}`]);
});

test("with NO_COLOR set, prints the line as is even on a terminal", () => {
  process.env.NO_COLOR = "1";
  process.stdout.isTTY = true;
  writePage("Home", "a cat\n");
  expect(search(["cat"])).toBe(0);
  expect(printed()).toEqual(["Home:1: a cat"]);
});

test("when stdout isn't a terminal, prints the line as is", () => {
  delete process.env.NO_COLOR;
  process.stdout.isTTY = false;
  writePage("Home", "a cat\n");
  expect(search(["cat"])).toBe(0);
  expect(printed()).toEqual(["Home:1: a cat"]);
});

test("keeps spaces in a quoted query", () => {
  withColor(false);
  writePage("Home", "catfish\na cat here\n");
  expect(search([" cat "])).toBe(0);
  expect(printed()).toEqual(["Home:2: a cat here"]);
});

test("joins the arguments into a phrase", () => {
  withColor(false);
  writePage("Home", "getting started\nstarted getting\n");
  expect(search(["getting", "started"])).toBe(0);
  expect(printed()).toEqual(["Home:1: getting started"]);
});

test("no matches prints a message and fails", () => {
  writePage("Home", "hello\n");
  expect(search(["zzz"])).toBe(1);
  expect(printed()).toEqual(["No pages match zzz"]);
});

test("no pages prints a message and fails", () => {
  expect(search(["zzz"])).toBe(1);
  expect(printed()).toEqual(["No pages match zzz"]);
});

test("a missing word prints the usage and fails", () => {
  expect(search([])).toBe(1);
  expect(error).toHaveBeenCalledWith(searchUsage);
  expect(search(["  "])).toBe(1);
  expect(log).not.toHaveBeenCalled();
});

test("regex characters in the word are matched literally", () => {
  withColor(false);
  writePage("Home", "costs $5.00 (approx)\ncosts $5x00\n[[Other]]\n");
  expect(search(["$5.00"])).toBe(0);
  expect(search(["(approx)"])).toBe(0);
  expect(search(["[[Other]]"])).toBe(0);
  expect(printed()).toEqual(["Home:1: costs $5.00 (approx)", "Home:1: costs $5.00 (approx)", "Home:3: [[Other]]"]);
  expect(search([".*"])).toBe(1);
});
