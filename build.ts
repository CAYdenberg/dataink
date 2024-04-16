import * as path from "path";
import { build, emptyDir } from "@deno/dnt";

// create folder

// create bundle

// create README

// create package.json

const __dirname = path.dirname(path.fromFileUrl(import.meta.url));

await emptyDir("./dist");

await build({
  entryPoints: [path.join(__dirname, "src", "core", "mod.ts")],
  test: false,
  outDir: path.join("dist", "react"),
  package: {
    name: "pvalue-react",
    version: "0.0.2",
    license: "MIT",
    devDependencies: {
      "@types/d3-scale": "^4.0.2",
      "@types/d3-shape": "^3.1.6",
      "@types/lodash.debounce": "^4.0.9",
      "@types/react": "^18.2.0",
    },
  },
  shims: {
    deno: true,
    custom: [
      {
        package: {
          name: "react",
          version: "18.2.0",
        },
        globalNames: ["preact", "React", "JSX"],
        typesPackage: {
          name: "@types/react",
          version: "^18.2.0",
        },
      },
    ],
  },
  compilerOptions: {
    lib: ["ES2020", "DOM"],
  },
  mappings: {
    "https://esm.sh/preact@10.20.1": {
      name: "react",
      version: "^18.2.0",
      peerDependency: true,
    },
    "https://esm.sh/preact@10.20.1/hooks": {
      name: "react",
      version: "^18.2.0",
      peerDependency: true,
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
  },
});
