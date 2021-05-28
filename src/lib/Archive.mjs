import { join, dirname } from "path"
import { homedir } from "os"
import fs from "fs"
import fp from "fs/promises"
import Hash from "lib/Hash"

export class Archive {
  get root() {
    return `${homedir}/.hack/Archive/`
  }

  async mkRoot() {
    return fp.mkdir(this.root, { recursive: true })
  }

  at(hash) {
    return join(this.root, hash)
  }

  async has(hash) {
    try {
      let stats = await this.stat(hash)
      return stats.size > 0 && !(stats.mode & 0o222)
    } catch (err) {}

    return false
  }

  async stat(hash) {
    return fp.stat(this.at(hash))
  }

  async write(content) {
    let hash = Hash.string(content)
    let path = this.at(hash)
    await this.mkRoot()

    let existed = false

    try {
      await fp.writeFile(path, content, {
        mode: 0o444,
        encoding: "utf8",
      })
    } catch (err) {
      if (err.code != "EACCES" || err.syscall != "open") throw err
      existed = true
    }

    return { hash, existed }
  }

  async read(hash) {
    return fp.readFile(this.at(hash), "utf8")
  }

  stream(hash) {
    return fs.createReadStream(this.at(hash))
  }

  async purge(hash) {
    return fp.unlink(this.at(hash))
  }
}

export default new Archive()

Archive.test?.(async ({ eq, rejects }) => {
  let archive = new Archive()

  let { hash } = await archive.write("Hello, world.\n")
  eq(hash, "CkrrcgnhJZ1YkE7BDcqUWrnDyAaBiVUYxakmpdCV7FrE5T7ok")

  eq(await archive.has(hash), true)
  eq(await archive.read(hash), "Hello, world.\n")

  let randContent = String(Math.random())
  let { hash: rhash } = await archive.write(randContent)
  await archive.purge(rhash)
  await rejects(archive.read(rhash), Error)
})
