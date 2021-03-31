import fs from "fs/promises"
import fg from "fast-glob"
import { dirname, extname } from "path"

import { T, Future } from "lib"
import * as Project from "lib/project"

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

export async function* BufferReading({ path, buffer }) {
  if (typeof path != "string") return
  if (buffer != Buffer) return

  yield { path, buffer: await fs.readFile(Project.root(path)) }
}

export function* TextBuffering({ path, text }, recur) {
  if (typeof path != "string") return
  if (text != String) return

  yield* recur({ path, buffer: Buffer }).edit(reply => {
    reply.text = String(reply.buffer)
  })
}

export async function* BufferWriting({ path, buffer, mode, writtenAt }) {
  if (writtenAt != Date) return
  if (typeof path != "string") return
  if (!(buffer instanceof Buffer)) return

  mode ??= buffer.slice(0, 2).toString() == "#!" ? 0o755 : 0o644

  await fs.mkdir(dirname(path), { recursive: true })
  await fs.writeFile(path, buffer, { mode })

  yield { path, mode, writtenAt: new Date() }
}

export function TextWriting({ path, text, writtenAt }, recur) {
  if (writtenAt != Date) return
  if (typeof path != "string") return
  if (typeof text != "string") return

  return recur({ path, writtenAt, buffer: Buffer.from(text) })
}

export async function* PathGlobbing({ glob, path }, recur) {
  if (typeof glob != "string") return
  if (path != String) return

  const paths = fg.stream(Project.root(globs), {
    dot: true,
    absolute: true,
  })

  for await (const path of paths) yield { path }
}
