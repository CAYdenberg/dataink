import type { FunctionComponent } from "../../jsx.ts";

import { line as d3Line } from "d3-shape";

import { Point } from "../lib/types.ts";
import useChartState from "../lib/ChartState.tsx";
import { useClip } from "./Clip.tsx";
import { getD3Curve, getDashArray } from "../lib/d3ShapeFacade.ts";
import type {
  CurveFactory,
  CurveType,
  DashType,
} from "../lib/d3ShapeFacade.ts";

interface Props {
  /**
   * Path of the line.
   */
  path: Point[];
  /**
   * Stroke color. When null, the stroke is not rendered. Default: #000;
   */
  stroke?: string | null;
  /**
   * Fill color. When null, the path is not filled. Default: null.
   */
  fill?: string | null;
  /**
   * Stroke width (in pixels). When 0, null or undefined, the stroke is not rendered.
   * Default: 1.
   */
  strokeWidth?: number;
  /**
   * Curve connecting the points in the path. Accepts keywords "linear", "cardinal",
   * "natural", "basis" or "step". Also accepts a D3 curve factory function,
   * see https://d3js.org/d3-shape/curve for more.
   * Default: "linear"
   */
  curveType?: CurveType | CurveFactory;
  /**
   * Render the line stroke as a dash. Accepts "solid", "dashed" or "dotted", or
   * an array of numbers representing a dash array. See https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray
   * for more information.
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

/**
 * Renders a line, with the `path` provided in data space.
 */
export const Line: FunctionComponent<Props> = (props) => {
  const { path } = props;
  const { scale } = useChartState();

  const pxData = path.map(scale);

  return <PxLine {...props} path={pxData} />;
};

interface TranslatedLineProps extends Props {
  position: Point;
}

/**
 * Renders a anchored at `position` in data space, with the `path` provided as
 * pixels relative to the anchor point. Useful for things like axis tick marks,
 * that occur at defined positions but are usually a specific size defined in
 * pixels.
 */
export const TranslatedLine: FunctionComponent<TranslatedLineProps> = (
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

/**
 * A line with the `path` provided in pixel space.
 */
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
