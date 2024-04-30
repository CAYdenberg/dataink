import { useRef } from "../../jsx.ts";

const randomHtmlId = () => {
  return `id-${Math.random().toString(16).slice(2)}`;
};

export default () => {
  return useRef<string>(randomHtmlId());
};
