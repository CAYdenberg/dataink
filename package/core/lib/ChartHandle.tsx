import { FunctionComponent } from "preact";
import type {
  ChartWheelEvent,
  EventHandlers,
  TouchActionCSSValue,
} from "./types.ts";
import useHandle from "./useHandle.ts";
import useChartState from "./ChartState.tsx";

interface Props extends EventHandlers {
  onWheel?: (event: ChartWheelEvent) => void;
  touchAction?: TouchActionCSSValue;
}

export const ChartHandle: FunctionComponent<Props> = ({
  touchAction,
  children,
  onWheel,
  ...props
}) => {
  const { cartesianBox, pxBox } = useChartState();
  const handlers = useHandle(props);
  return (
    <div
      {...handlers}
      style={
        Object.keys(handlers).length
          ? { touchAction, userSelect: "none" }
          : undefined
      }
      onWheel={
        onWheel
          ? (event) => {
              const deltaX = (event.deltaX * cartesianBox.width) / pxBox.width;
              const deltaY =
                (event.deltaY * cartesianBox.height) / pxBox.height;

              onWheel({
                event,
                delta: [deltaX, deltaY],
              });
            }
          : undefined
      }
    >
      {children}
    </div>
  );
};
