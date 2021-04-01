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

export function BufferCaching(_, _, state) {
  const { path, buffer } = this
  if (typeof path != "string") return

  if (buffer instanceof Buffer) state[path] = buffer
  if (state[path] && buffer == Buffer) return { path, buffer: state[path] }
}

export async function* BufferReading() {
  const { path, buffer } = this
  if (typeof path != "string") return
  if (buffer != Buffer) return

  yield { path, buffer: await fs.readFile(Project.root(path)) }
}

export function* TextBuffering(_, recur) {
  const { path, text } = this
  if (typeof path != "string") return
  if (text != String) return

  yield* recur({ path, buffer: Buffer }).edit(reply => {
    reply.text = String(reply.buffer)
  })
}

export async function* BufferWriting() {
  const { path, buffer, mode, writtenAt } = this
  if (writtenAt != Date) return
  if (typeof path != "string") return
  if (!(buffer instanceof Buffer)) return

  mode ??= buffer.slice(0, 2).toString() == "#!" ? 0o755 : 0o644

  await fs.mkdir(dirname(path), { recursive: true })
  await fs.writeFile(path, buffer, { mode })

  yield { path, mode, writtenAt: new Date() }
}

export function TextWriting(_, recur) {
  const { path, text, writtenAt } = this

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
