import fs from "fs"
import fp from "fs/promises"
import fg from "fast-glob"
import { dirname, extname } from "path"

import { T, Future } from "lib"
import Time from "lib/Time"
import * as Project from "lib/Project"

export default [read, write, manage, explore, render]

export function* explore({ path, text, readAt }, recur) {
  if (typeof this.files != "object") return
  if (typeof path != "string") return

  this.files[path] ??= { path }

  for (const file of Object.values(this.files)) yield* recur(file)
}

export function manage({}) {
  if (text == String) {
  }

  if (typeof text == "string") {
    file.text = text
    file.readAt = Time.now
  }
}

export async function* read({ read }) {
  if (!read) return
  if (typeof this.path != "string") return

  yield* fs.createReadStream(Project.root(this.path))
}

export async function* write({ write }) {
  if (!write) return
  if (typeof this.path != "string") return

  yield* fs.createReadStream(Project.root(this.path))
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
    const paths = fg.stream(Project.root(globs), {
      dot: true,
      absolute: true,
    })

    for await (const path of paths) yield { glob, path }
  }
}
