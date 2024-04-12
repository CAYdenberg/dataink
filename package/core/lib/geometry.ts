import { d3Scale } from "../../deps.ts";
import Viewbox from "./Viewbox.ts";
import type { Origin, Point, Gutter } from "./types.ts";

const { scaleLinear } = d3Scale;

export const closeLineToEdge = (
  line: Point[],
  yEdge: number
): Point[] | null => {
  if (line.length < 2) {
    return null;
  }

  const first = line[0];
  const last = line[line.length - 1];

  return [[first[0], yEdge], ...line, [last[0], yEdge]];
};

export const radiansToDegrees = (radians: number): number => {
  return (radians * 180) / Math.PI;
};

export const degreesToRadians = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

export const angleBetweenPoints = (a: Point, b: Point) => {
  return Math.atan((b[1] - a[1]) / (b[0] - a[0]));
};

export const distanceBetweenPoints = (a: Point, b: Point) => {
  return Math.sqrt(Math.pow(b[1] - a[1], 2) + Math.pow(b[0] - a[0], 2));
};

export const getScale = (
  cartesianBox: Viewbox,
  pxBox: Viewbox,
  gutter: Gutter = [0, 0, 0, 0],
  origin: Origin = "bottom-left"
) => {
  if (origin === "top-left") {
    const scaleX = scaleLinear()
      .domain(cartesianBox.x)
      .range([pxBox.y[0] + gutter[0], pxBox.y[1] - gutter[2]]);
    const scaleY = scaleLinear()
      .domain(cartesianBox.y)
      .range([pxBox.x[0] + gutter[3], pxBox.x[1] - gutter[1]]);

    const scale = (cartesianPoint: Point): Point => [
      scaleY(cartesianPoint[1]),
      scaleX(cartesianPoint[0]),
    ];
    const reverseScale = (pxPoint: Point): Point => [
      scaleX.invert(pxPoint[1]),
      scaleY.invert(pxPoint[0]),
    ];

    return { scale, reverseScale };
  }

  const scaleX = scaleLinear()
    .domain(cartesianBox.x)
    .range([pxBox.x[0] + gutter[3], pxBox.x[1] - gutter[1]]);
  const scaleY = scaleLinear()
    .domain(cartesianBox.y)
    .range([pxBox.y[1] - gutter[2], pxBox.y[0] + gutter[0]]);

  const scale = (cartesianPoint: Point): Point => [
    scaleX(cartesianPoint[0]),
    scaleY(cartesianPoint[1]),
  ];
  const reverseScale = (pxPoint: Point): Point => [
    scaleX.invert(pxPoint[0]),
    scaleY.invert(pxPoint[1]),
  ];

  return { scale, reverseScale };
};
