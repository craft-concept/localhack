import Esbuild from "esbuild"
import { extname } from "path"

export const loaders = {
  ".ohm": "text",
}

export default [render]

export function* render({ compiled }) {
  if (typeof this.source != "string") return
  if (compiled != String) return

  return async send => {
    const { code } = await Esbuild.transform(text, {
      sourcefile: this.path,
      target: "node12",
      loader: loaders[this.ext],
      // format: outputPath.endsWith(".mjs") ? "esm" : "cjs",
      format: "esm",
    })

    send({
      name,
      compiled: code,
    })
  }
}
