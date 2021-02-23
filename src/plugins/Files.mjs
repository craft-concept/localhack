import fs from "fs/promises"
import { T, Future } from "../lib.mjs"
import * as project from "../lib/project.mjs"

export default [
  CacheAsBuffer,
  ReadAsBuffer,
  BufferAsText,
  WriteBuffer,
  WriteText,
]

export function CacheAsBuffer({ path, buffer }) {
  if (typeof path != "string") return

  if (buffer instanceof Buffer) this[path] = buffer
  if (this[path] && buffer == Buffer) return { path, buffer: this[path] }
}

export function ReadAsBuffer({ path, buffer }) {
  if (typeof path != "string") return
  if (buffer != Buffer) return

  return async () => ({ path, buffer: await fs.readFile(project.root(path)) })
}

export function BufferAsText({ path, text }) {
  if (typeof path != "string") return
  if (text != String) return

  return send =>
    send({ path, buffer: Buffer }).edit(reply => {
      reply.text = String(reply.buffer)
    })
}

export function WriteBuffer({ path, buffer, write }) {
  if (!write) return
  if (typeof path != "string") return
  if (!(buffer instanceof Buffer)) return

  return async () => {
    await fs.writeFile(path, buffer)
    return { path, written: true }
  }
}

export function WriteText({ path, text, write }) {
  if (!write) return
  if (typeof path != "string") return
  if (typeof text != "string") return

  return send => send({ path, write, buffer: Buffer.from(text) })
}
