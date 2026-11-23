import { expect, test } from "bun:test";
import { wikiPageSlug } from "./index";

test("converts a wiki page title to a lowercase slug", () => {
  expect(wikiPageSlug("  Getting   Started  ")).toBe("getting-started");
});
