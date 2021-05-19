import { join, dirname } from "path"
import { homedir } from "os"
import fp from "fs/promises"
import Hash from "lib/Hash"

export class OnDisk {
  get root() {
    return `${homedir}/.hack/Archive/`
  }

  at(path) {
    return join(this.root, path)
  }

  async alias(alias, path) {
    return fp.symlink(this.at(path), this.at(alias), "file")
  }

  async write(content) {
    let hash = Hash.string(content)
    let path = this.at(hash)
    await fp.mkdir(this.root, { recursive: true })

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
}

export default new OnDisk()

OnDisk.test?.(async ({ eq, rejects }) => {
  let archive = new OnDisk()

  let hash = await archive.write("Hello, world.\n")
  eq(hash, "1ab1a2bb8502820a83881a5b66910b819121bafe336d76374637aa4ea7ba2616")

  eq(await archive.read(hash), "Hello, world.\n")

  let randContent = String(Math.random())
  let rhash = await archive.write(randContent)
  await archive.purge(rhash)
  await rejects(archive.read(rhash), Error)
})
