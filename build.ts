import * as path from "path";
import * as esbuild from "https://deno.land/x/esbuild@v0.20.1/mod.js";

// create folder

// create bundle

// create README

// create package.json

const __dirname = path.dirname(path.fromFileUrl(import.meta.url));

const D3_EXT = [
  "d3-array",
  "d3-delaunay",
  "d3-dsv",
  "d3-ease",
  "d3-interpolate",
  "d3-scale",
  "d3-shape",
  "lodash.debounce",
];

(["esm", "cjs"] as const).forEach(async (format) => {
  await esbuild.build({
    entryPoints: [
      {
        in: path.join(__dirname, "src", "core", "mod.ts"),
        out: `core.${format}`,
      },
    ],
    loader: { ".tsx": "tsx", ".ts": "ts" },
    jsx: "automatic",
    jsxImportSource: "preact",
    bundle: true,
    format,
    target: "es2020",
    minify: true,
    outdir: path.join("dist", "preact"),
    external: ["preact", "preact/jsx-runtime", "lodash.debounce", ...D3_EXT],
    alias: {
      "~": "./src/build/npm.ts",
    },
  });
});
