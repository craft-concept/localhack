import { resolve, relative } from "path"
import { pre } from "./fns.mjs"

export const root = (...paths) => resolve(process.cwd(), ...paths)

export const src = pre(root, "src")
export const entry = pre(src, "entries")
export const local = pre(root, ".localhack")
export const build = pre(local, "build")

export const file = path => relative(root(), path)
