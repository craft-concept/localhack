import { resolve, relative } from "path"
import { pre } from "./fns"

import Precursor from "lib/Precursor"
import Asset from "lib/Asset"

export const root = (...paths) => resolve(process.cwd(), ...paths)

export const src = pre(root, "src")
export const entry = pre(src, "entries")
export const local = pre(root, ".hack")
export const build = pre(local, "build")
export const dist = pre(root, "dist")

export const file = path => relative(root(), path)

export default Precursor.clone
  .def({
    name: "Project",
  })
  .lazy({
    assets() {
      return Asset.withRoot(this.root)
    },

    root() {
      // Todo: Should be crawling upwards for this
      return process.cwd()
    },
  })
