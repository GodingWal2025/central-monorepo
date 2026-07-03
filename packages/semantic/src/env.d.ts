interface ImportMetaEnv {
  readonly [key: string]: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.css';

declare var process: {
  env: {
    NODE_ENV: string;
    [key: string]: string | undefined;
  }
};
