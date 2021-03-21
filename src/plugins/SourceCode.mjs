export default [TranspilingJs]

export const loaders = {
  ".ohm": "text",
}

export function TranspilingJs({ name, source, compiled }) {
  if (typeof name != "string") return
  if (typeof source != "string") return
  if (compiled != String) return

  // if (!/\/src\/.+\.(m?jsx?|ohm)$/.test(path)) return

  // const outputPath = path
  //   .replace("/src/", "/.hack/build/")
  //   .replace(/\/Readme\.(\w+)$/, ".$1")

  return async send => {
    const { code } = await Esbuild.transform(text, {
      sourcefile: name,
      target: "node12",
      loader: loaders[extname(path)],
      // format: outputPath.endsWith(".mjs") ? "esm" : "cjs",
      format: "esm",
    })

    send({
      name,
      source,
      compiled: code,
    })
  }
}

export function WriteTranspiledFiles({ path }) {}

export function BuildFiles({ path, text }) {}
