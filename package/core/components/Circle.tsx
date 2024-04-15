import { FunctionComponent } from "preact";

import useChartState from "../lib/ChartState.tsx";
import { useClip } from "./Clip.tsx";

interface CircleProps {
  point: [number, number];
  /**
   * Default: 0
   */
  radius?: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: string | null;
  opacity?: number;
  /**
   * When false, sets pointer-events: none as an inline style. Useful for
   * for restricting events to the underlying elements, especially the Chart
   * element. Default: true.
   */
  svgPointerEvents?: boolean;
}

export const Circle: FunctionComponent<CircleProps> = (props) => {
  const { scale } = useChartState();

  const pxPoint = scale(props.point);

  return <PxCircle {...props} point={pxPoint} />;
};

export const PxCircle: FunctionComponent<CircleProps> = (props) => {
  const {
    point,
    radius,
    stroke,
    fill,
    strokeWidth,
    opacity,
    svgPointerEvents,
  } = {
    radius: 0,
    stroke: "#000",
    strokeWidth: 1,
    fill: null,
    opacity: 1,
    svgPointerEvents: true,
    ...props,
  };
  const { pushToCanvasQueue, isCanvas } = useChartState();
  const clip = useClip();

  const [x, y] = point;

  pushToCanvasQueue &&
    pushToCanvasQueue((renderer, dpr) => {
      clip(renderer, dpr);

      renderer.beginPath();

      renderer.globalAlpha = opacity;

      renderer.arc(x, y, radius, 0, 2 * Math.PI);

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

  return (
    <g style={{ pointerEvents: svgPointerEvents ? undefined : "none" }}>
      <circle
        r={radius}
        cx={x}
        cy={y}
        fill={fill || undefined}
        stroke-width={strokeWidth}
        stroke={stroke}
        opacity={opacity}
      ></circle>
    </g>
  );
};
