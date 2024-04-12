import type { FunctionComponent } from "preact";

import { DEFAULT_FONT_FAMILY } from "../lib/constants.ts";
import { angleBetweenPoints, radiansToDegrees } from "../lib/geometry.ts";
import { normalize } from "../lib/normalize.ts";
import { Point } from "../lib/types.ts";
import useChartState from "../lib/ChartState.tsx";
import { useClip } from "./Clip.tsx";

export interface Props {
  position: Point;
  text: string;
  pxOffset?: [number, number];
  /**
   * Default: #000
   */
  color?: string;
  /**
   * Default: "Helvetica"
   */
  font?: string;
  /**
   * Default: 16
   */
  fontSize?: number;
  /**
   * Default: 400
   */
  fontWeight?: number;
  /**
   * Default: left
   */
  align?: "left" | "center" | "right";
  /**
   * Rotation of the text, in radians. 0 is horizontal ltr text. Alternatively,
   * a Point can be provided, in which case the rotation angle is equivalent to
   * the rotation of a line drawn between the `position` Point and the
   * `rotation` Point.
   */
  rotation?: number | Point;
  /**
   * When false, sets pointer-events: none as an inline style. Useful for
   * for restricting events to the underlying elements, especially the Chart
   * element. Default: true.
   */
  svgPointerEvents?: boolean;
}

const Text: FunctionComponent<Props> = (props) => {
  const { scale, pushToCanvasQueue, isCanvas } = useChartState();
  const clip = useClip();

  const { position, text } = props;

  const font = normalize(props.font, DEFAULT_FONT_FAMILY);
  const fontWeight = normalize(props.fontWeight, 400);
  const fontSize = normalize(props.fontSize, 16);
  const color = normalize(props.color, "#000");
  const align = normalize(props.align, "left");
  const pxOffset = normalize(props.pxOffset, [0, 0]);
  const rotation = normalize(props.rotation, 0);
  const svgPointerEvents = normalize(props.svgPointerEvents, true);

  const pxPosition = scale(position);
  const x = pxPosition[0] + pxOffset[0];
  const y = pxPosition[1] + pxOffset[1];

  const _rotation: number = Array.isArray(rotation)
    ? angleBetweenPoints(pxPosition, scale(rotation))
    : rotation;

  pushToCanvasQueue &&
    pushToCanvasQueue((renderer, dpr) => {
      clip(renderer, dpr);
      renderer.font = `${fontWeight} ${fontSize}px ${font}`;
      renderer.translate(x, y);
      renderer.rotate(_rotation);
      renderer.textAlign = align;
      renderer.fillStyle = color;
      renderer.fillText(text, 0, 0);
    });

  if (isCanvas) {
    return null;
  }

  const svgAnchor =
    align === "center" ? "middle" : align === "right" ? "end" : "start";

  return (
    <text
      x={x}
      y={y}
      fill={color}
      font-size={fontSize}
      style={{
        fontFamily: font,
        pointerEvents: svgPointerEvents ? undefined : "none",
        fontWeight,
        userSelect: "none",
      }}
      text-anchor={svgAnchor}
      transform={
        rotation
          ? `rotate(${radiansToDegrees(_rotation)} ${x} ${y})`
          : undefined
      }
    >
      {text}
    </text>
  );
};

export default Text;
