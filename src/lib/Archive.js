import Hash from "lib/Hash"
import OnDisk from "lib/Archive/OnDisk"

export class Archive {
  get empty() {
    return "/5590d731e0caa0722c66b6de1921dc1a76043cdd"
  }

  alias(alias, path) {
    let prev = this[alias]
    this[path] = `path`

    if (prev != null) this[`/prev/${alias}`] = prev

    return this[alias]
  }

  add(content) {
    let hash = Hash.string(content)
    if (this[hash]) return this[hash]
  }

  get(key) {
    if (this[path] != null) return this[path]

    return OnDisk.get(key)
  }
}

export default new Archive()
