import { Point } from "./types.ts";

export type Range = [number, number];

export type ViewboxDuck = Viewbox | [number, number, number, number];

/**
 * A factory function that creates a new viewbox. These will all work:
 * createViewbox(xMin, yMin, width, height)
 * createViewbox([xMin, yMin, width, height])
 * createViewbox(new Viewbox(xMin, yMin, width, height))
 */
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

/**
 * Tracks the viewing area of a Chart. Properties reflect the bounds of a
 * viewing area, eg xMin or height. Methods perform translations on that viewing
 * area (e.g. zoom). Transforming methods return a new viewbox, they do not mutate
 * the existing one.
 */
export default class Viewbox {
  /**
   * Minimum x value (eg, the left bound)
   */
  public readonly xMin: number;
  /**
   * Minimum y value. Usually, the bottom in data space and the top in pixel space.
   */
  public readonly yMin: number;
  /**
   * The width of the viewbox (difference between xMin and xMax)
   */
  public readonly width: number;
  /**
   * The height of the viewbox (difference between yMin and yMax)
   */
  public readonly height: number;
  /**
   * Maximum y value. Usually, the top in data space and the bottom in pixel space.
   */
  public readonly xMax: number;
  /**
   * Maximum x value (eg, the right bound)
   */
  public readonly yMax: number;
  /**
   * An array consisting of [xMin, xMax]
   */
  public readonly x: Range;
  /**
   * An array consisting of [yMin, yMax]
   */
  public readonly y: Range;
  /**
   * A string representation of the viewbox bounds.
   * Useful for comparing two viewboxes to see if they are equivalent.
   */
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

  /**
   * Returns a new viewbox, equivalent to the current viewbox but with any specified
   * edges set to the new value instead. That is, `currentView.setEdges({ yMin: 0 })` would
   * return the current viewbox but with the bottom "locked" at 0
   */
  setEdges(input: Edges): Viewbox {
    const { xMin, xMax, yMin, yMax } = {
      ...this,
      ...input,
    };
    return new Viewbox(xMin, yMin, xMax - xMin, yMax - yMin);
  }

  /**
   * Move the viewbox `distance` in the x-direction. Usually, positive values
   * move to the right (and negative to the left).
   */
  panX(distance: number): Viewbox {
    return new Viewbox(
      this.xMin + distance,
      this.yMin,
      this.width,
      this.height
    );
  }

  /**
   * Move the viewbox `distance` in the y-direction. For viewboxes defined in
   * data space, positive numbers would move the viewbox up (while negative
   * numbers would move it down).
   */
  panY(distance: number): Viewbox {
    return new Viewbox(
      this.xMin,
      this.yMin + distance,
      this.width,
      this.height
    );
  }

  /**
   * Zoom the viewbox in by `factor`. `currentZoom.zoom(2)` would be equivalent
   * to a 200% zoom in a drawing program. The optional `anchor` can act as the
   * anchor point of the zoom operation; otherwise, zoom is centered within the
   * viewbox.
   * Usually, this method call is followed by calling `constrainZoom` and/or `setEdges`
   * to keep the zoom operations within some reasonable bounds.
   */
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

  /**
   * Interpolate between the current viewbox and `final`, based on `progress`, which is
   * a number between 0 and 1. A progress of 0 would be equivalent to the current view,
   * a progress of 1 would be equivalent to the `final` view. Used to animate between
   * two viewbox states.
   */
  interpolate(final: Viewbox, progress: number): Viewbox {
    return new Viewbox(
      this.xMin + progress * (final.xMin - this.xMin),
      this.yMin + progress * (final.yMin - this.yMin),
      this.width + progress * (final.width - this.width),
      this.height + progress * (final.height - this.height)
    );
  }

  /**
   * Returns a new viewbox contained by an "outer" viewbox. Any boundary
   * to the current viewbox which is outside the bounding box is set
   * to the bounds of the viewbox.
   */
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

  /**
   * Prevent zooming in too far. If the width of the current viewbox is less
   * than maxZoomX, then set the width to maxZoomX.
   */
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

  /**
   * Convert the current viewbox to a path (array of points)
   */
  toPath(): Point[] {
    const { xMin, xMax, yMin, yMax } = this;
    return [
      [xMin, yMin],
      [xMax, yMin],
      [xMax, yMax],
      [xMin, yMax],
    ];
  }

  /**
   * Returns a boolean indicating whether the current viewbox is equal in
   * all dimensions to the test viewbox. Useful for checking whether
   * the chart needs to be re-rendered.
   */
  isEqual(test: ViewboxDuck): boolean {
    const _test = createViewbox(test);
    return _test.hash === this.hash;
  }

  /**
   * Filters an array of points to include only those that are within the x bounds
   * of the viewbox.
   */
  pointsWithinX(points: Point[]): Point[] {
    return points.filter(
      (point) => point[0] >= this.xMin && point[0] <= this.xMax
    );
  }

  /**
   * Filters an array of points to include only those that are within the y bounds
   * of the viewbox.
   */
  pointsWithinY(points: Point[]): Point[] {
    return points.filter(
      (point) => point[1] >= this.yMin && point[1] <= this.yMax
    );
  }

  /**
   * Tests whether a given point is within the current viewbox. The optional
   * `matting` argument extends the viewbox outwards. This is useful to test
   * whether a data point needs to be rendered.
   */
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

/**
 * Create a new viewbox. These will all work:
 * createViewbox(xMin, yMin, width, height)
 * createViewbox([xMin, yMin, width, height])
 * createViewbox(new Viewbox(xMin, yMin, width, height))
 */
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

/**
 * Creates the smallest viewbox that will fit around a set of points. Returns
 * null if a viewbox cannot be constructed from those points (eg, is an empty array).
 * The resulting viewbox can be zoomed out slightly to create padding around the data.
 * eg createViewboxFromData(data).zoom(0.9)
 */
export const createViewboxFromData = (data: Point[]): Viewbox | null => {
  if (!data.length) {
    return null;
  }

  let xMin = data[0][0];
  let xMax = data[0][0];
  let yMin = data[0][1];
  let yMax = data[0][1];
  data.forEach((point) => {
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
