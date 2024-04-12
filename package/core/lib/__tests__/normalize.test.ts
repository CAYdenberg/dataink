import { assertEquals } from "assert/assert_equals.ts";
import { normalize } from "../normalize.ts";

Deno.test("normalize: takes the provided prop", () => {
  assertEquals(normalize(1, 0), 1);
});

Deno.test("normalize: takes the default if provided is undefined", () => {
  assertEquals(normalize(undefined, 0), 0);
});
