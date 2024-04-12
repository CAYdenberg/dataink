import { Chart, Line } from "@pvalue/core";

export default () => (
  <Chart view={[0, 0, 10, 10]} gutter={[1, 1, 1, 1]}>
    <Line
      path={[
        [0, 0],
        [5, 10],
        [10, 0],
        [0, 0],
      ]}
      stroke="black"
      strokeWidth={2}
    />
  </Chart>
);
