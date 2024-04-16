/**
 * TYPESCRIPT UTITLIES
 */

type ObjectFromList<T extends ReadonlyArray<string>, V = string> = {
  [K in T extends ReadonlyArray<infer U> ? U : never]: V;
};

/**
 * Basics
 */

import { preact } from "../deps.ts";
import Viewbox from "./Viewbox.ts";

export type Point = [number, number];

export type Gutter = [number, number, number, number];

export type Origin = "bottom-left" | "top-left";

export type CanvasComponent = (
  renderer: CanvasRenderingContext2D,
  dpr: number
) => void;

export interface ChartState {
  containerRef: ReturnType<typeof preact.createRef>;
  isCanvas: boolean;
  pushToCanvasQueue: ((func: CanvasComponent) => void) | null;

  cartesianBox: Viewbox;
  pxBox: Viewbox;
  scale: (cartesianPoint: Point) => Point;
  reverseScale: (pxPoint: Point) => Point;
}

/**
 *  EVENTS
 */

export interface ChartEvent {
  event: PointerEvent;
  pointerPosition: Point;
  delta?: Point;
  elementPosition?: Point;
}

export interface ChartWheelEvent {
  event: WheelEvent;
  delta: Point;
}

export type ChartEventHandler = (event: ChartEvent) => void;

export const POINTER_EVENTS = [
  "onPointerDown",
  "onPointerMove",
  "onPointerUp",
  "onPointerCancel",
  "onGotPointerCapture",
  "onLostPointerCapture",
  "onPointerEnter",
  "onPointerLeave",
  "onPointerOver",
  "onPointerOut",
] as const;

export type EventHandlers = Partial<
  ObjectFromList<typeof POINTER_EVENTS, ChartEventHandler>
>;

export type TouchActionCSSValue =
  | "auto"
  | "none"
  | "pan-x"
  | "pan-left"
  | "pan-right"
  | "pan-y"
  | "pan-up"
  | "pan-down"
  | "manipulation"
  | "manipulation-pan-x"
  | "manipulation-pan-y"
  | "pinch-zoom"
  | "double-tap-zoom"
  | "zoom"
  | "inherit"
  | "initial"
  | "unset";
