import { preact, hooks } from "../deps.ts";
const { useMemo, useRef } = hooks;
const { Component } = preact;
import type { FunctionComponent } from "preact";

import ChartError from "./lib/ChartError.tsx";
import { normalize } from "./lib/normalize.ts";
import useCanvas from "./lib/useCanvas.ts";
import useContainerSizes from "./lib/useContainerSizes.ts";
import Viewbox, { createViewbox, ViewboxDuck } from "./lib/Viewbox.ts";
import { ChartStateContext } from "./lib/ChartState.tsx";
import { HtmlLayerElement, HtmlLayerManager } from "./lib/HtmlLayer.tsx";
import { ChartHandle } from "./lib/ChartHandle.tsx";
import {
  ChartWheelEvent,
  EventHandlers,
  Gutter,
  Origin,
  TouchActionCSSValue,
} from "./lib/types.ts";
import { getScale } from "./lib/geometry.ts";

export interface Props extends EventHandlers {
  /**
   * The coordinates of the box containing the visible portion of the chart data.
   * Given as an array in the form: [x minimum, y minimum, width, height] on
   * the Cartesian scale.
   */
  view: ViewboxDuck | ((width: number) => ViewboxDuck);
  /**
   * The origin of the cartesian plane. "bottom-left" is a standard Cartersian
   * chart, "top-left" would be used for a horizontal bar graph, for example.
   */
  origin?: Origin;
  /**
   * CSS max-width value.
   */
  maxWidth?: number | string;
  /**
   * Initial rendered width in pixels. Immediately after rendering,
   * the chart will automatically adjust to the width of its container.
   */
  ssWidth?: number;
  /**
   * Rendered height in pixels. If a function is given, the height
   * will be calculated from the rendered width.
   */
  height?: number | ((width: number) => number);
  /**
   * Extra padding (given in pixels) added to each side of the chart. This is
   * useful for ensuring that axes and other Chart decorations have enough space
   * for proper rendering regardless of the actual dimensions available. Given
   * in the form [top, right, bottom, left], on the pixel scale.
   */
  gutter?: Gutter;
  /**
   * When true, render with the canvas element, instead of SVG.
   */
  isCanvas?: boolean;
  /**
   * touch-action CSS proprety to be applied to the interaction layer.
   */
  touchAction?: TouchActionCSSValue;
  /**
   * Event handler for wheel events. Delta represents the deltaX and deltaY of
   * the native event, rescaled to the cartesian scale.
   */
  onWheel?: (event: ChartWheelEvent) => void;
  /**
   * An element, or array of elements, to be rendered outside of SVG (or canvas).
   * The Given in the form { position: [x, y], render: React element }. Useful
   * for e.g. for tooltips.
   */
  htmlLayer?: HtmlLayerElement[] | HtmlLayerElement | null;
  /** A  React component which will be rendered in case of an error. The error
   * message, if any, is passed as a prop.
   */
  renderError?: FunctionComponent<{ message?: string }>;
}

const ChartInner: FunctionComponent<Props> = (props) => {
  const { children } = props;
  const isCanvas = normalize(props.isCanvas, false);
  const gutter: Gutter = normalize(props.gutter, [0, 0, 0, 0]);
  const origin = normalize(props.origin, "bottom-left");
  const ssWidth = normalize(props.ssWidth, 300);
  const height = normalize(props.height, 150);

  const containerRef = useRef<HTMLDivElement>(null);
  const pxBox = useContainerSizes(ssWidth, height, containerRef);

  const cartesianBox: Viewbox = createViewbox(
    typeof props.view === "function" ? props.view(pxBox.width) : props.view
  );

  const { scale, reverseScale } = getScale(cartesianBox, pxBox, gutter, origin);

  const { pushToCanvasQueue, onRenderCanvas, dpr } = useCanvas(pxBox, isCanvas);

  const chartState = useMemo(
    () => ({
      pushToCanvasQueue,
      isCanvas,
      pxBox,
      cartesianBox,
      scale,
      reverseScale,
      containerRef,
    }),
    // viewboxes use a hash to optimize re-rendering
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pushToCanvasQueue, pxBox, cartesianBox.hash]
  );

  return (
    <div
      ref={containerRef}
      style={{
        height: pxBox.height,
        position: "relative",
        maxWidth: props.maxWidth,
      }}
    >
      <ChartStateContext.Provider value={chartState}>
        <ChartHandle {...props}>
          {isCanvas ? (
            <canvas
              ref={onRenderCanvas}
              width={pxBox.width * dpr.current}
              height={pxBox.height * dpr.current}
              style={{
                width: pxBox.width,
                height: pxBox.height,
              }}
            >
              {children}
            </canvas>
          ) : (
            <svg width={pxBox.width} height={pxBox.height}>
              {children}
            </svg>
          )}
          <HtmlLayerManager htmlLayer={props.htmlLayer} />
        </ChartHandle>
      </ChartStateContext.Provider>
    </div>
  );
};

interface State {
  hasError: boolean;
  errorMessage: string;
}

/**
 * The base component for Hypocube charts.
 */
class Chart extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error) {
    // eslint-disable-next-line no-console
    console.warn("Error while rendering Hypocube chart", error);
  }

  render() {
    if (this.state.hasError && this.props.renderError) {
      const CustomError = this.props.renderError;
      return <CustomError message={this.state.errorMessage} />;
    } else if (this.state.hasError) {
      return <ChartError {...this.props} />;
    }

    return <ChartInner {...this.props} />;
  }
}

export default Chart;
