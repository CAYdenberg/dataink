import * as path from "path";
import * as esbuild from "https://deno.land/x/esbuild@v0.20.1/mod.js";

// create folder

// create bundle

// create README

// create package.json

const __dirname = path.dirname(path.fromFileUrl(import.meta.url));

await esbuild.build({
  entryPoints: [
    {
      in: path.join(__dirname, "package", "core", "mod.ts"),
      out: path.join(__dirname, "dist", "preact", "core"),
    },
  ],
  loader: { ".tsx": "tsx", ".ts": "ts" },
  jsx: "automatic",
  jsxImportSource: "preact",
  bundle: true,
  // minify: true,
  outdir: path.join("dist", "preact"),
  external: ["preact", "preact/jsx-runtime"],
  alias: {
    "~": "./deps.ts",
  },
});
