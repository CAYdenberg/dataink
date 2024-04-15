import { createContext, createRef, FunctionComponent, JSX } from "preact";
import { useContext } from "preact/hooks";
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

export const ChartStateContext = createContext<ChartState>(
  getDefaultState(),
);

const useChartState = () => {
  return useContext(ChartStateContext);
};

export const ChartStateConsumer: FunctionComponent<
  { children: (chartState: ChartState) => JSX.Element }
> = ({ children }) => {
  const chartState = useChartState();
  return children(chartState);
};

export default useChartState;
