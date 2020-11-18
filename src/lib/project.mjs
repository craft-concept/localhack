import { resolve, relative } from "path"
import { pre } from "./fns.mjs"

export const find = (...paths) => resolve(process.cwd(), ...paths)

export const src = pre(find, "src")
export const build = pre(find, "build")
export const entry = pre(src, "entries")

export const file = path => relative(find(), path)
