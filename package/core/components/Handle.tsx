import { preact } from "~";
const { Fragment } = preact;
import type { FunctionComponent } from "preact";

import useChartState from "../lib/ChartState.tsx";
import useHandle from "../lib/useHandle.ts";
import { EventHandlers } from "../lib/types.ts";

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
