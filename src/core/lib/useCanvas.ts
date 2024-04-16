import { useCallback, useEffect, useRef, useState } from "../deps.ts";
import { CanvasComponent } from "./types.ts";
import Viewbox from "./Viewbox.ts";

export default (pxBox: Viewbox, isCanvas: boolean | HTMLCanvasElement) => {
  const canvasNode = useRef<HTMLCanvasElement | null>(
    typeof isCanvas === "boolean" ? null : (isCanvas as HTMLCanvasElement)
  );
  const canvasContext = useRef<CanvasRenderingContext2D | null>(null);
  const dpr = useRef<number>(1);

  const [, setHash] = useState<number>(Math.random());
  const forceUpdate = useCallback(() => {
    setHash(Math.random());
  }, []);

  // these are intentionally recreated on every re-render to draw the canvas
  // on each frame
  const queue: Array<CanvasComponent> = [];
  const pushToCanvasQueue = isCanvas
    ? (func: CanvasComponent) => {
        queue.push(func);
      }
    : null;

  const setDpr = useCallback(() => {
    dpr.current = globalThis.devicePixelRatio || 1;
  }, []);

  const onRenderCanvas = useCallback((node: HTMLCanvasElement | null) => {
    if (!node) {
      canvasNode.current = null;
      canvasContext.current = null;
      return;
    }
    canvasNode.current = node;
    canvasContext.current = canvasNode.current.getContext("2d");

    // set canvas sizes, and get the device pixel ratio for scaling
    setDpr();

    // if the child components run before the canvas DOM node renders, will
    // need to re-run them to draw on canvas
    forceUpdate();
    // forceUpdate should never change; callback runs only when canvas DOM node
    // is rendered
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // when resizing occurs, set the canvas sizes again
  useEffect(() => {
    setDpr();
  }, [pxBox.hash, setDpr]);

  // this is a "no-dependency" useEffect: it should run *after* rendering
  // every time
  useEffect(() => {
    if (!canvasContext.current) return;
    const cc = canvasContext.current as CanvasRenderingContext2D;

    canvasContext.current.scale(dpr.current, dpr.current);
    canvasContext.current.clearRect(0, 0, pxBox.x[1], pxBox.y[1]);
    canvasContext.current.setTransform(1, 0, 0, 1, 0, 0);

    queue.forEach((func) => {
      cc.save();
      cc.scale(dpr.current, dpr.current);
      func(cc, dpr.current);

      cc.globalAlpha = 1;
      cc.restore();
      cc.setTransform(1, 0, 0, 1, 0, 0);
    });
  });

  const getPng = useCallback(() => {
    if (!canvasNode.current) return "";

    return canvasNode.current.toDataURL();
  }, []);

  return {
    pushToCanvasQueue,
    onRenderCanvas,
    dpr,
    getPng,
  };
};
