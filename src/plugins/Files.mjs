import fs from "fs/promises"
import fg from "fast-glob"
import { dirname, extname } from "path"

import { T, Future } from "lib"
import * as project from "lib/project"

export default [
  BufferCaching,
  BufferReading,
  TextBuffering,
  BufferWriting,
  TextWriting,
  PathGlobbing,
]

export function BufferCaching({ path, buffer }) {
  if (typeof path != "string") return

  if (buffer instanceof Buffer) this[path] = buffer
  if (this[path] && buffer == Buffer) return { path, buffer: this[path] }
}

export function BufferReading({ path, buffer }) {
  if (typeof path != "string") return
  if (buffer != Buffer) return

  return async () => ({ path, buffer: await fs.readFile(project.root(path)) })
}

export function TextBuffering({ path, text }) {
  if (typeof path != "string") return
  if (text != String) return

  return send =>
    send({ path, buffer: Buffer }).edit(reply => {
      reply.text = String(reply.buffer)
    })
}

export function BufferWriting({ path, buffer, mode, writtenAt }) {
  if (writtenAt != Date) return
  if (typeof path != "string") return
  if (!(buffer instanceof Buffer)) return

  mode ??= buffer.slice(0, 2).toString() == "#!" ? 0o755 : 0o644

  return async () => {
    await fs.mkdir(dirname(path), { recursive: true })
    await fs.writeFile(path, buffer, { mode })
    return { path, mode, writtenAt: new Date() }
  }
}

export function TextWriting({ path, text, writtenAt }) {
  if (writtenAt != Date) return
  if (typeof path != "string") return
  if (typeof text != "string") return

  return send => send({ path, writtenAt, buffer: Buffer.from(text) })
}

export function PathGlobbing({ glob, path }) {
  if (typeof glob != "string") return
  if (path != String) return

  return async function* (send) {
    const paths = fg.stream(project.root(globs), {
      dot: true,
      absolute: true,
    })

    for await (const path of paths) yield { glob, path }
  }
}
