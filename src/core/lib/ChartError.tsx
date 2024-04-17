import type { FunctionComponent } from "../deps.ts";
import type { Props } from "../Chart.tsx";

const ChartError: FunctionComponent<Props> = (props) => {
  return (
    <div
      style={{
        height: typeof props.height === "number" ? props.height : "auto",
        background: "#ccc",

        padding: "1rem",
        fontSize: "1.4rem",
        color: "red",
        marginBottom: "1rem",
      }}
    >
      &#x26A0;&emsp;Unable to render chart
    </div>
  );
};

export default ChartError;
