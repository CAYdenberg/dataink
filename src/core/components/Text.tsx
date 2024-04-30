import type { FunctionComponent } from "../../jsx.ts";

import { DEFAULT_FONT_FAMILY } from "../lib/constants.ts";
import { angleBetweenPoints, radiansToDegrees } from "../lib/geometry.ts";
import { normalize } from "../lib/normalize.ts";
import { Point } from "../lib/types.ts";
import useChartState from "../lib/ChartState.tsx";
import { useClip } from "./Clip.tsx";

export interface Props {
  /**
   * The location (in data space) where the text is anchored.
   */
  position: Point;
  /**
   * The text to be rendered.
   */
  text: string;
  /**
   * Offset the text by the provided number of pixels along the x- and y-axis,
   * respectively.
   */
  pxOffset?: [number, number];
  /**
   * Default: #000
   */
  color?: string;
  /**
   * Font. If a non-standard font is used, it must be loaded and registered in CSS.
   * The default font stack is as follows:
   * "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Roboto Light', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'";
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
   * Rotation of the text, IN RADIANS. That is, 0 is horizontal ltr text, as in labeling an x-axis.
   * A rotation of Math.PI * 3 / 2 would be bottom-to-top, as in labeling a y-axis.
   * Alternatively, a Point can be provided, in which case the rotation angle is equivalent to
   * the rotation of a line drawn between the `position` Point and the
   * `rotation` Point.
   * Default: 0;
   */
  rotation?: number | Point;
  /**
   * When false, sets pointer-events: none as an inline style. Useful for
   * for restricting events to the underlying elements, especially the Chart
   * element. Default: true.
   */
  svgPointerEvents?: boolean;
}

/**
 * Renders the text given by `text` at the location `position`, given in data space.
 * The text is anchored (by default) at the bottom left.
 */
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
