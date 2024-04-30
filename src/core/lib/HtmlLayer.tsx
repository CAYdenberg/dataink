import { Fragment, useRef, useEffect, useState } from "../../jsx.ts";
import type { FunctionComponent, JSX } from "../../jsx.ts";

import useChartState from "./ChartState.tsx";
import { Point } from "./types.ts";

export interface HtmlLayerElement {
  position: Point;
  render: JSX.Element | null;
}

interface Props {
  htmlLayer?: HtmlLayerElement[] | HtmlLayerElement | null;
}

export const HtmlLayerManager: FunctionComponent<Props> = (props) => {
  const htmlLayer: HtmlLayerElement[] = Array.isArray(props.htmlLayer)
    ? props.htmlLayer
    : props.htmlLayer
    ? [props.htmlLayer]
    : [];

  return (
    <Fragment>
      {htmlLayer.map((layer) => (
        <Item {...layer} key={`${layer.position[0]}-${layer.position[1]}`} />
      ))}
    </Fragment>
  );
};

const Item: FunctionComponent<HtmlLayerElement> = (layer) => {
  const { scale } = useChartState();

  const pos = scale(layer.position);

  const [rightShift, setRightShift] = useState<number>(-1);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();

    const overflow = globalThis.innerWidth - rect.right;

    setRightShift(overflow < 0 ? Math.min(ref.current.clientWidth, pos[0]) : 0);
  }, [pos[0], pos[1]]);

  return (
    <div
      style={{
        position: "absolute",
        left: pos[0] - rightShift,
        top: pos[1],
        visibility: rightShift < 0 ? "hidden" : "visible",
      }}
      ref={ref}
    >
      {layer.render}
    </div>
  );
};
