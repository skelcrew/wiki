import { expect, test } from "bun:test";
import { highlightLinks, link, match, missingLink } from "../src/highlight";

test("styles wrap text in ANSI codes only with color", () => {
  expect(link("x", true)).toBe("\x1b[1;36mx\x1b[0m");
  expect(missingLink("x", true)).toBe("\x1b[4;31mx\x1b[0m");
  expect(match("x", true)).toBe("\x1b[30;43mx\x1b[0m");
  expect(link("x", false)).toBe("x");
  expect(missingLink("x", false)).toBe("x");
});

test("highlightLinks styles existing and missing links", () => {
  const exists = (t: string) => t === "Home";
  expect(highlightLinks("See [[Home]] and [[Gone]].", exists, true)).toBe(
    `See ${link("[[Home]]", true)} and ${missingLink("[[Gone]]", true)}.`,
  );
  expect(highlightLinks("See [[Home]] and [[Gone]].", exists, false)).toBe(
    "See [[Home]] and [[Gone]] (missing).",
  );
});
