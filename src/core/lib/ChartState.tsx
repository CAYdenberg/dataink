import { preact, useContext } from "../../jsx.ts";
import type { FunctionComponent, JSX } from "../../jsx.ts";

const { createRef, createContext } = preact;

import Viewbox from "./Viewbox.ts";
import { ChartState } from "./types.ts";

export const getDefaultState = (): ChartState => ({
  containerRef: createRef<HTMLDivElement>(),
  isCanvas: false,
  cartesianBox: new Viewbox(0, 0, 1, 1),
  pxBox: new Viewbox(0, 0, 1, 1),
  scale: (point) => point,
  reverseScale: (point) => point,
  pushToCanvasQueue: () => undefined,
});

export const ChartStateContext = createContext<ChartState>(getDefaultState());

/**
 * Retrieves the current ChartState from the context provided by the chart.
 */
const useChartState = () => {
  return useContext(ChartStateContext);
};

/**
 * Retrieves the current ChartState using the function-as-child-component
 * (FACC) pattern.
 */
export const ChartStateConsumer: FunctionComponent<{
  children: (chartState: ChartState) => JSX.Element;
}> = ({ children }) => {
  const chartState = useChartState();
  return children(chartState);
};

export default useChartState;
