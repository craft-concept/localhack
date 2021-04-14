// .hack/build/src/entries/NodeLoader.mjs
import fs from "fs/promises";
import {dirname} from "path";
import {
  realPathFor
} from "../lib/Resolution.mjs";
var root = process.cwd();
async function resolve(spec, {conditions, parentURL}, defaultResolve) {
  const parent = parentURL && dirname(new URL(parentURL).pathname);
  const path2 = await realPathFor(spec, parent) || spec;
  return defaultResolve(path2, {conditions, parentURL}, defaultResolve);
}
export {
  resolve
};
