import type { FunctionComponent } from "preact";

import { line as d3Line } from "d3-shape";

import { Point } from "../lib/types.ts";
import useChartState from "../lib/ChartState.tsx";
import { getD3Curve, getDashArray } from "../lib/d3ShapeFacade.ts";
import type {
  CurveFactory,
  CurveType,
  DashType,
} from "../lib/d3ShapeFacade.ts";
import { useClip } from "./Clip.tsx";

interface Props {
  path: Point[];
  /**
   * Default: #000;
   */
  stroke?: string | null;
  /**
   * Default: null.
   */
  fill?: string | null;
  /**
   * Default: 1.
   */
  strokeWidth?: number;
  /**
   * Default: "linear"
   */
  curveType?: CurveType | CurveFactory;
  /**
   * Default: "solid"
   */
  dash?: DashType;
  /**
   * Opacity of both stroke and fill, ranging from 0 (fully transparent) to 1
   * (fully opaque). Default: 1.
   */
  opacity?: number;
  /**
   * When false, sets pointer-events: none as an inline style. Useful for
   * for restricting events to the underlying elements, especially the Chart
   * element. Default: true.
   */
  svgPointerEvents?: boolean;
}

export const Line: FunctionComponent<Props> = (props) => {
  const { path } = props;
  const { scale } = useChartState();

  const pxData = path.map(scale);

  return <PxLine {...props} path={pxData} />;
};

export const TranslatedLine: FunctionComponent<Props & { position: Point }> = (
  props
) => {
  const { path, position } = props;
  const { scale } = useChartState();
  const pxPosition = scale(position);

  const pxData = path.map(
    (point) => [pxPosition[0] + point[0], pxPosition[1] + point[1]] as Point
  );

  return <PxLine {...props} path={pxData} />;
};

export const PxLine: FunctionComponent<Props> = (props) => {
  const {
    path,
    stroke,
    fill,
    strokeWidth,
    curveType,
    dash,
    opacity,
    svgPointerEvents,
  } = {
    stroke: "#000",
    strokeWidth: 1,
    fill: null,
    curveType: "linear" as CurveType,
    dash: null,
    opacity: 1,
    svgPointerEvents: true,
    ...props,
  };
  const curveFactory = getD3Curve(curveType);
  const dashArray = getDashArray(dash);

  const { pushToCanvasQueue, isCanvas } = useChartState();
  const clip = useClip();

  pushToCanvasQueue &&
    pushToCanvasQueue((renderer, dpr) => {
      clip(renderer, dpr);

      const line = d3Line()
        .curve(curveFactory)
        // @ts-ignore overall typing in d3 is pretty bad; ignore this
        .context(renderer);
      renderer.beginPath();

      line(path);

      renderer.globalAlpha = opacity;

      if (stroke && strokeWidth) {
        renderer.strokeStyle = stroke;
        renderer.lineWidth = strokeWidth;

        if (dashArray) {
          renderer.setLineDash(dashArray);
        }

        renderer.stroke();
      }

      if (fill) {
        renderer.fillStyle = fill;
        renderer.fill();
      }
    });

  if (isCanvas) {
    return null;
  }

  const line = d3Line().curve(curveFactory)(path);
  if (!line) {
    return null;
  }

  return (
    <path
      d={line as string}
      stroke={stroke || "transparent"}
      fill={fill || "transparent"}
      stroke-width={strokeWidth}
      stroke-dasharray={dashArray ? dashArray.join(",") : undefined}
      opacity={opacity}
      style={{ pointerEvents: svgPointerEvents ? undefined : "none" }}
    />
  );
};
