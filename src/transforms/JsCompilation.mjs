import Esbuild from "esbuild"
import { extname } from "path"

export const loaders = {
  ".ohm": "text",
}

export default [compile]

export async function* compile({ source, path, ext }, { compiled }, send) {
  if (typeof source != "string") return
  if (compiled != String) return

  const { code } = await Esbuild.transform(text, {
    sourcefile: path,
    target: "node12",
    loader: loaders[ext],
    // format: outputPath.endsWith(".mjs") ? "esm" : "cjs",
    format: "esm",
  })

  send({
    name,
    compiled: code,
  })
}
