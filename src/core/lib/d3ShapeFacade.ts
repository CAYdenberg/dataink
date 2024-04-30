import {
  curveBasisOpen,
  curveCardinalOpen,
  curveLinear,
  curveNatural,
  curveStepBefore,
  symbolCircle,
  symbolCross,
  symbolDiamond,
  symbolSquare,
  symbolStar,
  symbolTriangle,
  symbolWye,
} from "d3-shape";

export type CurveFactory = typeof curveLinear;
export type CurveType = "linear" | "cardinal" | "natural" | "basis" | "step";

export const getD3Curve = (input?: CurveType | CurveFactory): CurveFactory => {
  if (!input) {
    return curveLinear;
  }

  if (typeof input !== "string") return input;

  switch (input) {
    case "cardinal":
      return curveCardinalOpen;

    case "natural":
      return curveNatural as unknown as CurveFactory;

    case "basis":
      return curveBasisOpen;

    case "step":
      return curveStepBefore;
  }

  return curveLinear;
};

export const DASHED_LINE = [5, 5];
export const DOTTED_LINE = [1, 1];
export type DashType = "solid" | "dashed" | "dotted" | number[] | null;

export const getDashArray = (input: DashType): Array<number> | null => {
  if (typeof input !== "string") return input;

  switch (input) {
    case "solid":
      return null;

    case "dashed":
      return DASHED_LINE;

    case "dotted":
      return DOTTED_LINE;
  }
};

// @ts-ignore: typings are bad, just go with it
export type D3SymbolType = d3Shape.SymbolType;
export type SymbolType =
  | "circle"
  | "cross"
  | "diamond"
  | "square"
  | "star"
  | "triangle"
  | "wye"
  | "none";

export const getD3Symbol = (
  input?: SymbolType | D3SymbolType
): D3SymbolType | null => {
  if (typeof input !== "string") {
    return input as D3SymbolType;
  }

  switch (input) {
    case "cross":
      return symbolCross;

    case "diamond":
      return symbolDiamond;

    case "square":
      return symbolSquare;

    case "star":
      return symbolStar;

    case "triangle":
      return symbolTriangle;

    case "wye":
      return symbolWye;

    case "none":
      return null;
  }

  return symbolCircle;
};
