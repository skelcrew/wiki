import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  listPages,
  pageExists,
  pagePath,
  pagesDir,
  parseLinks,
  readPage,
  writePage,
} from "../src/pages";

let dir: string;
let oldCwd: string;

beforeEach(() => {
  oldCwd = process.cwd();
  dir = mkdtempSync(join(tmpdir(), "wiki-pages-"));
  process.chdir(dir);
});

afterEach(() => {
  process.chdir(oldCwd);
  rmSync(dir, { recursive: true, force: true });
});

describe("pagePath", () => {
  test("is the title plus .md in pages/ at the working directory", () => {
    expect(pagePath("Other page")).toBe(join(pagesDir(), "Other page.md"));
    expect(pagesDir()).toBe(join(process.cwd(), "pages"));
  });

  test("rejects titles with slashes, a leading dot, or nothing", () => {
    expect(() => pagePath("a/b")).toThrow();
    expect(() => pagePath("a\\b")).toThrow();
    expect(() => pagePath(".hidden")).toThrow();
    expect(() => pagePath("..")).toThrow();
    expect(() => pagePath("")).toThrow();
    expect(() => pagePath("  ")).toThrow();
  });
});

describe("reading and writing", () => {
  test("writePage creates pages/ and readPage reads it back", () => {
    expect(pageExists("Home")).toBe(false);
    writePage("Home", "# Home\n");
    expect(pageExists("Home")).toBe(true);
    expect(readPage("Home")).toBe("# Home\n");
  });

  test("readPage throws for a missing page", () => {
    expect(() => readPage("Nope")).toThrow();
  });
});

describe("listPages", () => {
  test("is empty without a pages/ folder", () => {
    expect(listPages()).toEqual([]);
  });

  test("lists the .md titles, sorted, skipping other files", () => {
    writePage("Zebra", "");
    writePage("Apple pie", "");
    writePage("Middle", "");
    writeFileSync(join(pagesDir(), "notes.txt"), "");
    writeFileSync(join(pagesDir(), ".hidden.md"), "");
    mkdirSync(join(pagesDir(), "folder.md"));
    expect(listPages()).toEqual(["Apple pie", "Middle", "Zebra"]);
  });
});

describe("parseLinks", () => {
  test("returns link titles in order, with repeats", () => {
    expect(parseLinks("See [[Home]] and [[Other page]], then [[Home]].")).toEqual([
      "Home",
      "Other page",
      "Home",
    ]);
  });

  test("trims titles and ignores text without links", () => {
    expect(parseLinks("[[ Spaced ]]")).toEqual(["Spaced"]);
    expect(parseLinks("no links, [single] or [[]] or [[a\nb]]")).toEqual([]);
  });
});
