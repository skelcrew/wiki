import { afterEach, beforeEach, expect, spyOn, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import show, { showUsage } from "../src/commands/show";
import { link, missingLink } from "../src/highlight";
import { writePage } from "../src/pages";

let dir: string;
let oldCwd: string;
let oldNoColor: string | undefined;
let oldIsTTY: boolean;
let log: ReturnType<typeof spyOn>;
let error: ReturnType<typeof spyOn>;

beforeEach(() => {
  oldCwd = process.cwd();
  dir = mkdtempSync(join(tmpdir(), "wiki-show-"));
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

test("prints the page with existing and missing links highlighted", () => {
  withColor(true);
  writePage("Home", "# Home\n\nSee [[Other page]] and [[Nowhere]].\n");
  writePage("Other page", "hi\n");
  expect(show(["Home"])).toBe(0);
  expect(log).toHaveBeenCalledTimes(1);
  expect(log.mock.calls[0]![0]).toBe(
    `# Home\n\nSee ${link("[[Other page]]", true)} and ${missingLink("[[Nowhere]]", true)}.`,
  );
});

test("without color, missing links are marked", () => {
  withColor(false);
  writePage("Home", "[[Home]] [[Gone]] [[a/b]] [[.draft]]\n");
  expect(show(["Home"])).toBe(0);
  expect(log.mock.calls[0]![0]).toBe("[[Home]] [[Gone]] (missing) [[a/b]] (missing) [[.draft]] (missing)");
});

test("joins the arguments into a multi-word title", () => {
  withColor(false);
  writePage("Getting started", "Start here.\n");
  expect(show(["Getting", "started"])).toBe(0);
  expect(log).toHaveBeenCalledWith("Start here.");
});

test("an unknown page prints an error naming it and fails", () => {
  expect(show(["Nope"])).toBe(1);
  expect(error.mock.calls[0]![0]).toContain('"Nope"');
  expect(log).not.toHaveBeenCalled();
});

test("an invalid title prints an error and fails", () => {
  expect(show(["../secret"])).toBe(1);
  expect(error).toHaveBeenCalled();
});

test("a missing title prints the usage and fails", () => {
  expect(show([])).toBe(1);
  expect(error).toHaveBeenCalledWith(showUsage);
  expect(show(["  "])).toBe(1);
});
