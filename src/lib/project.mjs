import { resolve } from "path"
import { pre } from "./fns.mjs"
export const find = (...paths) => resolve(process.cwd(), ...paths)

export const src = pre(find, "build")
export const entry = pre(src, "entries")
