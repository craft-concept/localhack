import Esbuild from "esbuild"
import { extname } from "path"

export const loaders = {
  ".ohm": "text",
}

export default class Compile {
  static async js(source, { path }) {
    const ext = extname(path)

    const { code } = await Esbuild.transform(source, {
      sourcefile: path,
      target: "node12",
      loader: loaders[ext],
      // format: outputPath.endsWith(".mjs") ? "esm" : "cjs",
      format: "esm",
    })

    return code
  }
}
