export default (props) => ({
  name: props.name,
  version: props.version,
  // dependencies
  // peerDependencies
});

const mappings = {
  "https://esm.sh/preact@10.20.1": {
    name: "preact",
    version: "^10.20.1",
    peerDependency: true,
  },
  "https://esm.sh/preact@10.20.1/hooks": {
    name: "preact",
    version: "^10.20.1",
    peerDependency: true,
    subPath: "/hooks",
  },
  "https://esm.sh/lodash@4.17.21/debounce": {
    name: "lodash.debounce",
    version: "^4.0.8",
  },
  "https://cdn.skypack.dev/d3-scale@4": {
    name: "d3-scale",
    version: "^4.0.2",
  },
  "https://cdn.skypack.dev/d3-shape@3": {
    name: "d3-shape",
    version: "^3.2.0",
  },
};
