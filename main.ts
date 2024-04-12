import * as path from "path";
import * as esbuild from "https://deno.land/x/esbuild@v0.20.1/mod.js";
import { Application, Request } from "https://deno.land/x/oak@14.2.0/mod.ts";

const app = new Application();
const controller = new AbortController();
const { signal } = controller;

const parseReq = (req: Request) => {
  const { pathname } = new URL(req.url);
  const parts = pathname.split("/");
  const file = parts[parts.length - 1];
  const fileParts = file.split(".");
  return {
    pathname,
    file: fileParts[0],
    ext: fileParts[1],
  };
};

const read = async (...filepath: string[]) => {
  const file = await Deno.readFile(path.join(Deno.cwd(), ...filepath));
  return new TextDecoder().decode(file);
};

app.use(async (ctx, next) => {
  const { file, ext } = parseReq(ctx.request);
  if (ext !== "html") {
    return next();
  }

  const html = await read("sandbox", "index.html");
  const processedHtml = html.replaceAll(
    "%=TEST=%",
    `/sandbox/suite/${file}.tsx`
  );

  ctx.response.headers.set("Content-Type", "text/html");
  ctx.response.body = processedHtml;
});

app.use(async (ctx, next) => {
  const { file, pathname, ext } = parseReq(ctx.request);
  if (!["ts", "tsx", "js"].includes(ext)) {
    return next();
  }
  if (!pathname.startsWith("/package") && !pathname.startsWith("/sandbox")) {
    return next();
  }

  const src = await read(file === "main" ? "/sandbox/main.js" : pathname);

  const exe = await esbuild.transform(src, {
    loader: ext === "js" ? "jsx" : (ext as "ts" | "tsx"),
    jsx: "automatic",
    jsxImportSource: "preact",
  });

  ctx.response.headers.set("Content-Type", "text/javascript");
  ctx.response.body = exe.code;
});

const listenPromise = app.listen({ port: 8000, signal });

controller.abort();

await listenPromise;
await esbuild.stop();
