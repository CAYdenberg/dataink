import { preact, hooks } from "~";
const { useMemo, useContext } = hooks;
const { createContext, Fragment } = preact;
import type { FunctionComponent } from "preact";

import { line as d3Line } from "d3-shape";

import useHtmlId from "../lib/useHtmlId.ts";
import { CanvasComponent, Point } from "../lib/types.ts";
import useChartState from "../lib/ChartState.tsx";
import { CurveFactory, CurveType, getD3Curve } from "../lib/d3ShapeFacade.ts";
import { normalize } from "../lib/normalize.ts";

export const ClipRendererContext = createContext<CanvasComponent | null>(null);

export const useClip = (): CanvasComponent => {
  const existing = useContext(ClipRendererContext);
  return existing || (() => undefined);
};

interface Props {
  path?: Point[] | null;
  curveType?: CurveType | CurveFactory;
}

const Clip: FunctionComponent<Props> = (props) => {
  const path = props.path;
  const children = props.children;
  const curveFactory = getD3Curve(normalize(props.curveType, "linear"));

  const { scale, isCanvas } = useChartState();
  const prevRenderer = useClip();
  const id = useHtmlId();

  const clipData = useMemo(() => {
    const pxPath = path ? path.map(scale) : [];

    const svgPath = d3Line().curve(curveFactory)(pxPath) as string;
    if (!svgPath) {
      return null;
    }

    const render: CanvasComponent = (renderer, dpr) => {
      prevRenderer(renderer, dpr);
      if (!pxPath.length) return;
      renderer.beginPath();
      // @ts-ignore overall typing in d3 is pretty bad; ignore this
      d3Line().curve(curveFactory).context(renderer)(pxPath);
      renderer.clip("nonzero");
    };

    return {
      svgPath,
      render,
    };
  }, [prevRenderer, path, scale]);

  if (!clipData) {
    return <Fragment>{children}</Fragment>;
  } else if (isCanvas) {
    return (
      <ClipRendererContext.Provider value={clipData.render}>
        {children}
      </ClipRendererContext.Provider>
    );
  }

  const { svgPath } = clipData;

  return (
    <Fragment>
      <defs>
        <clipPath id={id.current} clip-rule="nonzero">
          <path d={svgPath} />
        </clipPath>
      </defs>
      <g clip-path={`url(#${id.current})`}>{children}</g>
    </Fragment>
  );
};

export default Clip;
