import { afterEach, beforeEach, expect, spyOn, test } from "bun:test";
import { main, usage } from "../src/cli";

let log: ReturnType<typeof spyOn>;
let error: ReturnType<typeof spyOn>;

beforeEach(() => {
  log = spyOn(console, "log").mockImplementation(() => {});
  error = spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  log.mockRestore();
  error.mockRestore();
});

test("no command prints the usage", async () => {
  expect(await main([])).toBe(0);
  expect(log).toHaveBeenCalledWith(usage);
});

test("an unknown command prints the usage and fails", async () => {
  expect(await main(["bogus"])).toBe(1);
  expect(log).toHaveBeenCalledWith(usage);
  expect(await main(["toString"])).toBe(1);
});
