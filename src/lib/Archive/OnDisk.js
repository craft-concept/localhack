import fp from "fs/promises"
import Hash from "lib/Hash"

export class OnDisk {
  async alias(alias, path) {
    // write alias to file
    return this[alias]
  }

  async add(content) {
    let hash = Hash.string(content)
    await fp.writeFile(`.hack/archive/${content}`)
    if (this[hash]) return this[hash]
  }

  get(key) {
    if (this[path] != null) return this[path]

    return OnDisk.get(key)
  }
}

export default new Archive()
