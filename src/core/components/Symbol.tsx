import { d3Shape } from "../deps.ts";
import type { FunctionComponent } from "../deps.ts";

import { getD3Symbol } from "../lib/d3ShapeFacade.ts";
import { radiansToDegrees } from "../lib/geometry.ts";
import useChartState from "../lib/ChartState.tsx";
import { useClip } from "./Clip.tsx";

import type { D3SymbolType, SymbolType } from "../lib/d3ShapeFacade.ts";

const { symbol: d3Symbol } = d3Shape;

interface SymbolProps {
  point: [number, number];
  /**
   * Default: 5
   */
  size?: number;
  /**
   * Default: "circle"
   */
  symbol?: SymbolType | D3SymbolType;
  stroke?: string;
  strokeWidth?: number;
  fill?: string | null;
  rotation?: number;
  opacity?: number;
  /**
   * When rendering as SVG, an invisible circle of the given radius is rendered
   * around the symbol. This can help with interaction, ensuring the symbol is
   * clickable even when the actual symbol drawn is very small.
   */
  quietRenderRadius?: number;
  /**
   * When false, sets pointer-events: none as an inline style. Useful for
   * for restricting events to the underlying elements, especially the Chart
   * element. Default: true.
   */
  svgPointerEvents?: boolean;
  pxOffset?: [number, number];
}

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
    size: 5,
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
      const line = d3Symbol(symbolF, size * 8).context(renderer);

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
  const line = d3Symbol(symbolF, size * 8)();
  if (!line) return null;

  return (
    <g
      style={{ pointerEvents: svgPointerEvents ? undefined : "none" }}
      transform={`translate(${x}, ${y}), rotate(${radiansToDegrees(rotation)})`}
    >
      <circle r={quietRenderRadius} cx={0} cy={0} fill="transparent"></circle>
      <path
        d={line}
        stroke={stroke}
        fill={fill || "transparent"}
        stroke-width={strokeWidth}
        opacity={opacity}
      />
    </g>
  );
};

export default Symbol;
