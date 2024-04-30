import { useCallback, useMemo, useRef } from "../../jsx.ts";
import useChartState from "./ChartState.tsx";
import {
  ChartEvent,
  ChartEventHandler,
  POINTER_EVENTS,
  Point,
} from "./types.ts";

const keyIsSupported = (
  key: string
): key is (typeof POINTER_EVENTS)[number] => {
  const _key = key as (typeof POINTER_EVENTS)[0];
  return POINTER_EVENTS.includes(_key);
};

const selectHandlers = <P extends Record<string, unknown>>(props: P) => {
  return Object.keys(props).reduce((acc, key) => {
    if (key.startsWith("__")) return acc;

    if (typeof props[key] === "undefined") return acc;

    if (keyIsSupported(key)) {
      acc[key] = props[key] as ChartEventHandler;
      return acc;
    }

    return acc;
  }, {} as Record<string, ChartEventHandler>);
};

export default <
  P extends Record<string, unknown> & { elementPosition?: Point }
>(
  props: P
) => {
  const { reverseScale, containerRef, pxBox, cartesianBox } = useChartState();

  const prevPxPoisition = useRef<Point | null>(null);

  const transformPointerEvent = useCallback(
    (event: PointerEvent): ChartEvent => {
      const offsets = containerRef?.current
        ? (containerRef.current as HTMLDivElement).getBoundingClientRect()
        : null;

      if (offsets) {
        const pxPosition: Point = [
          event.clientX - offsets.x,
          event.clientY - offsets.y,
        ];

        let delta: Point | null;
        if (prevPxPoisition.current) {
          delta = [
            (cartesianBox.width *
              (pxPosition[0] - prevPxPoisition.current[0])) /
              pxBox.width,
            (cartesianBox.height *
              (pxPosition[1] - prevPxPoisition.current[1])) /
              pxBox.height,
          ];
        } else {
          delta = null;
        }

        prevPxPoisition.current = pxPosition;

        return {
          event,
          pointerPosition: reverseScale(pxPosition),
          elementPosition: props.elementPosition,
          delta: delta || undefined,
        };
      }

      return {
        event,
        pointerPosition: [0, 0],
      };
    },
    [reverseScale, props.elementPosition]
  );

  const result = useMemo(() => {
    const handlers = selectHandlers(props);
    return Object.keys(handlers).reduce((acc, key) => {
      const handler = handlers[key] as ChartEventHandler;
      acc[key] = (ev: PointerEvent) => {
        ev.preventDefault();
        handler(transformPointerEvent(ev));
        return false;
      };
      return acc;
    }, {} as Record<string, (ev: PointerEvent) => boolean>);
  }, [props]);

  return result;
};
