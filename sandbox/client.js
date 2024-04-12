import { render, h } from "preact";
import { EditorView, basicSetup } from "codemirror/codemirror/dist/index.js";
import { drawSelection } from "codemirror/view/dist/index.js";
import { oneDark } from "codemirror/theme-one-dark/dist/index.js";
import { javascript } from "codemirror/lang-javascript/dist/index.js";

const root = document.getElementById("output");
const edRoot = document.getElementById("input");
let editor;
let timer;

function initEditor(code) {
  editor?.destroy();

  editor = new EditorView({
    doc: code || "",
    extensions: [
      basicSetup,
      drawSelection(),
      javascript({
        jsx: true,
        typescript: true,
      }),
      oneDark,
      EditorView.updateListener.of((update) => {
        if (!update.docChanged) return;

        clearTimeout(timer);
        timer = setTimeout(() => {
          // execute(code);
        }, 1000);
      }),
    ],
    parent: edRoot,
  });
}

fetch(window.__STATE__.appUrl, {
  headers: {
    Accept: "text/plain",
  },
})
  .then((res) => {
    return res.text();
  })
  .then((text) => {
    initEditor(text);
    import("test").then((module) => {
      const App = module.default;
      render(h(App), root);
    });
  });
