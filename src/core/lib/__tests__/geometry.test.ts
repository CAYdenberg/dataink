import { assertEquals } from "assert/assert_equals.ts";
import { assertFalse } from "assert/assert_false.ts";
import * as lib from "../geometry.ts";

import { Point } from "../types.ts";

Deno.test(
  "closeLineToEdge: connects a polyline to a horizontal edge by adding two additional datapoints",
  () => {
    const data: Point[] = [
      [1, 2],
      [3, 4],
    ];
    const y = 6;
    const result = [
      [1, 6],
      [1, 2],
      [3, 4],
      [3, 6],
    ];
    assertEquals(lib.closeLineToEdge(data, y), result);
  }
);

Deno.test("closeLineToEdge: returns null if the polyline has no length", () => {
  const data: Point[] = [[3, 4]];
  const y = 6;
  assertFalse(lib.closeLineToEdge(data, y));
});
