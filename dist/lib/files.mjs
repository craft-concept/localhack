import { join } from "path";
import { promises as ps } from "fs";
import { draft } from "./drafting";
export const get = (root) => (path) => join(String(root), String(path));
export const invoke = (path) => (...exts) => ps.readFile(`${String(path)}${exts.length > 0 ? "." + exts.join(".") : ""}`);
export const node = draft({
    get,
    invoke,
});
export const cwd = node(process.cwd());
