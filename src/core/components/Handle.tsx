import { preact } from "../../jsx.ts";
import type { FunctionComponent } from "../../jsx.ts";

import useChartState from "../lib/ChartState.tsx";
import useHandle from "../lib/useHandle.ts";
import { EventHandlers } from "../lib/types.ts";

const { Fragment } = preact;

/**
 * Renders an SVG `g` element around all children, and attaches the provided
 * EventHandlers. This component has no effect when `isCanvas` is not false.
 */
const Handle: FunctionComponent<EventHandlers> = (props) => {
  const { isCanvas } = useChartState();
  if (isCanvas) {
    return <Fragment>{props.children}</Fragment>;
  }

  return <HandleInner {...props} />;
};

const HandleInner: FunctionComponent<EventHandlers> = ({
  children,
  ...props
}) => {
  const handlers = useHandle(props);
  return <g {...handlers}>{children}</g>;
};

export default Handle;
