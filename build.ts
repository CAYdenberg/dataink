import * as path from "path";
import { build } from "npm:vite";

// create folder

// create bundle

// create README

// create package.json

const __dirname = path.dirname(path.fromFileUrl(import.meta.url));

await build({
  build: {
    emptyOutDir: true,
    outDir: "/dist/core",
    lib: {
      entry: path.resolve(__dirname, "package", "core", "mod.ts"),
      name: "index",
    },
  },
});
