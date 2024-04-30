import { symbol as d3Symbol } from "d3-shape";
import type { FunctionComponent } from "../../jsx.ts";

import { getD3Symbol } from "../lib/d3ShapeFacade.ts";
import { radiansToDegrees } from "../lib/geometry.ts";
import useChartState from "../lib/ChartState.tsx";
import { useClip } from "./Clip.tsx";

import type { D3SymbolType, SymbolType } from "../lib/d3ShapeFacade.ts";

interface SymbolProps {
  /**
   * The point (in data space), where the symbol should occur.
   */
  point: [number, number];
  /**
   * Offset the symbol by the provided number of pixels along the x- and y-axis,
   * respectively.
   */
  pxOffset?: [number, number];
  /**
   * Default: 64
   */
  size?: number;
  /**
   * The shape of the symbol. Options are "circle", cross", "diamond", "square", "star",
   * "triangle", "wye" and "none". A D3 symbol generator may also be provided, see
   * https://d3js.org/d3-shape/symbol#custom-symbols for more information.
   * Default: "circle"
   */
  symbol?: SymbolType | D3SymbolType;
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
   * Rotate the symbol. The rotation angle IS GIVEN IN RADIANS. That is, a rotation
   * of Math.PI is equal to 180 degrees or turning the symbol upside-down.
   * Default: 0
   */
  rotation?: number;
  /**
   * Opacity of both stroke and fill, ranging from 0 (fully transparent) to 1
   * (fully opaque). Default: 1.
   */
  opacity?: number;
  /**
   * When rendering as SVG, an invisible circle of the given radius is rendered
   * around the symbol. This can help with interaction, ensuring the symbol is
   * clickable even when the actual symbol drawn is very small.
   * Default: no invisible circle is drawn
   */
  quietRenderRadius?: number;
  /**
   * When false, sets pointer-events: none as an inline style. Useful for
   * for restricting events to the underlying elements, especially the Chart
   * element. Default: true.
   */
  svgPointerEvents?: boolean;
}

/**
 * Draw a symbol, (shape) at the provided `point`, given in data space. The
 * basic use for this component is drawing the data points in a scatterplot.
 */
const Symbol: FunctionComponent<SymbolProps> = (props) => {
  const {
    point,
    size,
    symbol,
    stroke,
    fill,
    strokeWidth,
    rotation,
    opacity,
    quietRenderRadius,
    svgPointerEvents,
    pxOffset,
  } = {
    size: 64,
    symbol: "circle" as SymbolType,
    stroke: "#000",
    strokeWidth: 1,
    rotation: 0,
    fill: null,
    opacity: 1,
    quietRenderRadius: 0,
    svgPointerEvents: true,
    pxOffset: [0, 0] as [number, number],
    ...props,
  };
  const { scale, pushToCanvasQueue, isCanvas } = useChartState();
  const clip = useClip();

  const symbolF = getD3Symbol(symbol);
  if (!symbolF) {
    return null;
  }

  const [naturalX, naturalY] = scale(point);
  const x = naturalX + pxOffset[0];
  const y = naturalY + pxOffset[1];

  pushToCanvasQueue &&
    pushToCanvasQueue((renderer, dpr) => {
      clip(renderer, dpr);
      const line = d3Symbol(symbolF, size).context(renderer);

      renderer.setTransform(dpr, 0, 0, dpr, x * dpr, y * dpr);
      renderer.rotate(rotation);
      renderer.beginPath();

      renderer.globalAlpha = opacity;

      line();

      if (stroke && strokeWidth) {
        renderer.strokeStyle = stroke;
        renderer.lineWidth = strokeWidth;
        renderer.stroke();
      }

      if (fill) {
        renderer.fillStyle = fill;
        renderer.fill();
      }
    });

  if (isCanvas) return null;
  const line = d3Symbol(symbolF, size)();
  if (!line) return null;

  return (
    <g
      style={{ pointerEvents: svgPointerEvents ? undefined : "none" }}
      transform={`translate(${x}, ${y}), rotate(${radiansToDegrees(rotation)})`}
    >
      <circle r={quietRenderRadius} cx={0} cy={0} fill="transparent"></circle>
      <path
        d={line}
        stroke={stroke || undefined}
        fill={fill || "transparent"}
        stroke-width={strokeWidth}
        opacity={opacity}
      />
    </g>
  );
};

export default Symbol;
