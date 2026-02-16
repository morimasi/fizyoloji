// Replaced missing /// <reference types="vite/client" /> with manual definitions

interface ImportMetaEnv {
  readonly VITE_API_KEY: string;
  readonly VITE_APP_TITLE: string;
  readonly VITE_APP_VERSION: string;
  [key: string]: string | boolean | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Fix for "Property 'div' does not exist on type 'JSX.IntrinsicElements'"
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
