import { join, dirname } from "path"
import { homedir } from "os"
import fp from "fs/promises"
import Hash from "lib/Hash"

export class OnDisk {
  get root() {
    return `${homedir}/.hack/Archive/`
  }

  async mkRoot() {
    return fp.mkdir(this.root, { recursive: true })
  }

  at(path) {
    return join(this.root, path)
  }

  async alias(alias, path) {
    return fp.symlink(this.at(path), this.at(alias), "file")
  }

  async has(path) {
    try {
      let stats = await this.stat(path)
      return stats.size > 0 && !(stats.mode & 0o222)
    } catch (err) {}

    return false
  }

  async stat(path) {
    return fp.stat(this.at(path))
  }

  async write(content) {
    let hash = Hash.string(content)
    let path = this.at(hash)
    await this.mkRoot()

    try {
      await fp.writeFile(this.at(hash), content, {
        mode: 0o444,
        encoding: "utf8",
      })
    } catch (err) {
      if (err.code != "EACCES" || err.syscall != "open") throw err
    }

    return hash
  }

  async read(path) {
    return fp.readFile(this.at(path), "utf8")
  }

  async purge(path) {
    return fp.unlink(this.at(path))
  }

  async ingest(path) {
    await fp.chmod(path, 0o444)
    let hash = Hash.buffer(await fp.readFile(path))

    if (await this.has(hash)) {
      await fp.unlink(path)
    } else {
      await this.mkRoot()
      await fp.rename(path, this.at(hash))
    }

    await fp.symlink(this.at(hash), path, "file")
    return hash
  }
}

export default new OnDisk()

OnDisk.test?.(async ({ eq, rejects }) => {
  let archive = new OnDisk()

  let hash = await archive.write("Hello, world.\n")
  eq(hash, "CkrrcgnhJZ1YkE7BDcqUWrnDyAaBiVUYxakmpdCV7FrE5T7ok")

  eq(await archive.has(hash), true)
  eq(await archive.read(hash), "Hello, world.\n")

  let randContent = String(Math.random())
  let rhash = await archive.write(randContent)
  await archive.purge(rhash)
  await rejects(archive.read(rhash), Error)
})
