import { join } from "path"
import { promises as ps } from "fs"

import { draft, Draft, Prop } from "./drafting"

export type Node = Draft<string[], Promise<Buffer>>

export const get = (root: Prop) => (path: Prop) =>
  join(String(root), String(path))

export const invoke = (path: Prop) => (...exts: string[]) =>
  ps.readFile(`${String(path)}${exts.length > 0 ? "." + exts.join(".") : ""}`)

export const node = draft({
  get,
  invoke,
})

export const cwd = node(process.cwd())
