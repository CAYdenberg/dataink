import { Point } from "./types.ts";

export type Range = [number, number];
export type ViewboxDuck = Viewbox | [number, number, number, number];
export type ViewboxFactory = (
  input: ViewboxDuck | number,
  yMin?: number,
  width?: number,
  height?: number
) => Viewbox;

interface Edges {
  xMin?: number;
  xMax?: number;
  yMin?: number;
  yMax?: number;
}

interface ConstrainOptions {
  maxZoomX?: number;
  maxZoomY?: number;
}
export default class Viewbox {
  public readonly xMin: number;
  public readonly yMin: number;
  public readonly width: number;
  public readonly height: number;
  public readonly xMax: number;
  public readonly yMax: number;
  public readonly x: Range;
  public readonly y: Range;
  public readonly hash: string;

  constructor(xMin: number, yMin: number, width: number, height: number) {
    this.xMin = xMin;
    this.yMin = yMin;
    this.width = width;
    this.height = height;
    this.xMax = xMin + width;
    this.yMax = yMin + height;
    this.x = [xMin, this.xMax];
    this.y = [yMin, this.yMax];
    this.hash = `${xMin},${yMin},${width},${height}`;
  }

  setEdges(input: Edges): Viewbox {
    const { xMin, xMax, yMin, yMax } = {
      ...this,
      ...input,
    };
    return new Viewbox(xMin, yMin, xMax - xMin, yMax - yMin);
  }

  panX(distance: number): Viewbox {
    return new Viewbox(
      this.xMin + distance,
      this.yMin,
      this.width,
      this.height
    );
  }

  panY(distance: number): Viewbox {
    return new Viewbox(
      this.xMin,
      this.yMin + distance,
      this.width,
      this.height
    );
  }

  zoom(factor: number, anchor?: Point): Viewbox {
    // default anchor is the center of the box:
    anchor =
      anchor ||
      ([this.width / 2 + this.xMin, this.height / 2 + this.yMin] as Point);

    const relativeAnchor = [
      (anchor[0] - this.xMin) / this.width,
      (anchor[1] - this.yMin) / this.height,
    ];

    const width = this.width / factor;
    const dXMin = (this.width - width) * relativeAnchor[0];

    const height = this.height / factor;
    const dYMin = (this.height - height) * relativeAnchor[1];

    return new Viewbox(this.xMin + dXMin, this.yMin + dYMin, width, height);
  }

  interpolate(final: Viewbox, progress: number): Viewbox {
    return new Viewbox(
      this.xMin + progress * (final.xMin - this.xMin),
      this.yMin + progress * (final.yMin - this.yMin),
      this.width + progress * (final.width - this.width),
      this.height + progress * (final.height - this.height)
    );
  }

  bound(
    input: ViewboxDuck | number,
    yMin?: number,
    width?: number,
    height?: number
  ): Viewbox {
    const _bound = createViewbox(input, yMin, width, height);

    return new Viewbox(
      Math.max(
        this.xMax > _bound.xMax ? _bound.xMax - this.width : this.xMin,
        _bound.xMin
      ),

      Math.max(
        this.yMax > _bound.yMax ? _bound.yMax - this.height : this.yMin,
        _bound.yMin
      ),

      Math.min(this.width, _bound.width),
      Math.min(this.height, _bound.height)
    );
  }

  constrainZoom({ maxZoomX, maxZoomY }: ConstrainOptions): Viewbox {
    const _x =
      maxZoomX && this.width < maxZoomX
        ? new Viewbox(
            this.bisectX() - maxZoomX / 2,
            this.yMin,
            maxZoomX,
            this.height
          )
        : this;

    const _y =
      maxZoomY && _x.height < maxZoomY
        ? new Viewbox(_x.xMin, _x.bisectY() - maxZoomY / 2, _x.width, maxZoomY)
        : _x;

    return _y;
  }

  toPath(): Point[] {
    const { xMin, xMax, yMin, yMax } = this;
    return [
      [xMin, yMin],
      [xMax, yMin],
      [xMax, yMax],
      [xMin, yMax],
    ];
  }

  isEqual(test: ViewboxDuck): boolean {
    const _test = createViewbox(test);
    return _test.hash === this.hash;
  }

  pointsWithinX(points: Point[]): Point[] {
    return points.filter(
      (point) => point[0] >= this.xMin && point[0] <= this.xMax
    );
  }

  pointsWithinY(points: Point[]): Point[] {
    return points.filter(
      (point) => point[1] >= this.yMin && point[1] <= this.yMax
    );
  }

  isPointWithin(point: Point, matting = 0): boolean {
    if (this.xMin - matting > point[0]) {
      return false;
    }
    if (this.yMin - matting > point[1]) {
      return false;
    }
    if (this.xMax + matting < point[0]) {
      return false;
    }
    if (this.yMax + matting < point[1]) {
      return false;
    }
    return true;
  }

  private bisectX(fraction = 0.5): number {
    return fraction * this.width + this.xMin;
  }

  private bisectY(fraction = 0.5): number {
    return fraction * this.height + this.yMin;
  }
}

export const createViewbox: ViewboxFactory = (
  input,
  yMin?,
  width?,
  height?
) => {
  if (typeof input === "number" && yMin && width && height) {
    return new Viewbox(input, yMin, width, height);
  }
  if (Array.isArray(input)) {
    return new Viewbox(...input);
  }
  if ((input as Viewbox).hash) {
    return input as Viewbox;
  }

  throw new Error(
    `Unable to create Viewbox from arguments ${input}, ${yMin}, ${width}, ${height}`
  );
};

export const createViewboxFromData = (data: Point[]): Viewbox | null => {
  const flat = data;
  if (!flat.length) {
    return new Viewbox(0, 0, 0, 0);
  }

  let xMin = flat[0][0];
  let xMax = flat[0][0];
  let yMin = flat[0][1];
  let yMax = flat[0][1];
  flat.forEach((point) => {
    const [x, y] = point;
    if (x < xMin) {
      xMin = x;
    }
    if (x > xMax) {
      xMax = x;
    }
    if (y < yMin) {
      yMin = y;
    }
    if (y > yMax) {
      yMax = y;
    }
  });

  return new Viewbox(xMin, yMin, xMax - xMin, yMax - yMin);
};
