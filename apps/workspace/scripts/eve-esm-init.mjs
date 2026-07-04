import { register } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const loaderPath = resolve(__dirname, "./eve-esm-loader.mjs");
register(loaderPath, import.meta.url);
