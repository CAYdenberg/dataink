import { FunctionComponent } from "preact";

declare global {
  interface Window {
    __STATE__: {
      appUrl: string;
    };
  }
}

declare module "test" {
  export const App: FunctionComponent;
}
