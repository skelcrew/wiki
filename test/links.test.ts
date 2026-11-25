import { afterEach, beforeEach, expect, spyOn, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import links, { linksUsage } from "../src/commands/links";
import { writePage } from "../src/pages";

let dir: string;
let oldCwd: string;
let log: ReturnType<typeof spyOn>;
let error: ReturnType<typeof spyOn>;

beforeEach(() => {
  oldCwd = process.cwd();
  dir = mkdtempSync(join(tmpdir(), "wiki-links-"));
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

function printed(): string[] {
  return log.mock.calls.map((c: unknown[]) => c[0] as string);
}

test("lists every page that links to the page, sorted, once each", () => {
  writePage("Target", "# Target\n");
  writePage("Zebra", "See [[Target]] and [[Target]] again.\n");
  writePage("Apple", "Go to [[ Target ]].\n");
  writePage("Middle", "Links to [[Other]] only, and mentions Target.\n");
  writePage("Other", "[[Target page]] [[target]]\n");
  expect(links(["Target"])).toBe(0);
  expect(printed()).toEqual(["Apple", "Zebra"]);
  expect(error).not.toHaveBeenCalled();
});

test("a page that links to itself is listed", () => {
  writePage("Home", "[[Home]]\n");
  expect(links(["Home"])).toBe(0);
  expect(printed()).toEqual(["Home"]);
});

test("joins the arguments into a multi-word title", () => {
  writePage("Getting started", "Start.\n");
  writePage("Home", "Read [[Getting started]].\n");
  expect(links(["Getting", "started"])).toBe(0);
  expect(printed()).toEqual(["Home"]);
});

test("a page nobody links to prints a message", () => {
  writePage("Lonely", "# Lonely\n");
  writePage("Home", "[[Elsewhere]]\n");
  expect(links(["Lonely"])).toBe(0);
  expect(printed()).toEqual(['No pages link to "Lonely".']);
});

test("an unknown page prints a one line error naming it and fails", () => {
  writePage("Home", "[[Nope]]\n");
  expect(links(["Nope"])).toBe(1);
  expect(error).toHaveBeenCalledTimes(1);
  expect(error.mock.calls[0]![0]).toBe('wiki links: no page named "Nope"');
  expect(log).not.toHaveBeenCalled();
});

test("an invalid title prints an error and fails", () => {
  expect(links(["../secret"])).toBe(1);
  expect(error).toHaveBeenCalledTimes(1);
  expect(log).not.toHaveBeenCalled();
});

test("a missing title prints the usage and fails", () => {
  expect(links([])).toBe(1);
  expect(error).toHaveBeenCalledWith(linksUsage);
  expect(links(["  "])).toBe(1);
  expect(log).not.toHaveBeenCalled();
});
