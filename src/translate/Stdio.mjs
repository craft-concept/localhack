import Translate, { T } from "lib/Translate"

Translate.shape("buffer", Buffer)
  .shape("stdin", { _readableState: {}, fd: 0 })
  .shape("stdout", { _readableState: {}, fd: 1 })
  .shape("stderr", { _readableState: {}, fd: 2 })

Translate.register("console", T.Any, obj => {
  console.write(obj)
  return obj
})

Translate.register("stdout", String, str => {
  process.stdout.write(str)
  return true
})

Translate.register(
  "buffer",
  { _readableState: { pipes: [] } },
  async stream => {
    let out = Buffer.from("")
    for await (const chunk of stream) {
      out = Buffer.concat([out, chunk])
    }
    return out
  },
)

Translate.register(
  "string",
  { _readableState: { pipes: [] } },
  async stream => {
    const buffer = await Translate.buffer(stream).first
    if (buffer) return String(buffer)
  },
)
