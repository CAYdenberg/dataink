import { useCallback, useEffect, useState } from "../../jsx.ts";
import type { RefObject } from "../../jsx.ts";

import debounce from "lodash.debounce";
import { WINDOW_RESIZE_RENDER_RATE } from "./constants.ts";
import Viewbox from "./Viewbox.ts";

export default (
  width: number,
  height: number | ((width: number) => number),
  ref: RefObject<HTMLDivElement>
): Viewbox => {
  const getHeight = useCallback(
    (width: number) => (typeof height === "function" ? height(width) : height),
    [height]
  );

  const [pxBox, setPxBox] = useState<Viewbox>(
    new Viewbox(0, 0, width, getHeight(width))
  );

  const calculateSizes = useCallback(() => {
    const containerEl = ref.current;
    if (containerEl) {
      setPxBox(
        new Viewbox(
          0,
          0,
          containerEl.clientWidth,
          getHeight(containerEl.clientWidth)
        )
      );
    }
  }, [getHeight, width]);

  useEffect(() => {
    calculateSizes();

    if (!self) {
      return;
    }
    const debouncedCalculateSizes = debounce(
      calculateSizes,
      WINDOW_RESIZE_RENDER_RATE,
      {
        leading: true,
        trailing: true,
      }
    );

    self.addEventListener("resize", debouncedCalculateSizes);
    return () => {
      self.removeEventListener("resize", debouncedCalculateSizes);
    };
  }, [ref, calculateSizes]);

  return pxBox;
};
