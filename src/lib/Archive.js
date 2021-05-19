import Hash from "lib/Hash"
import OnDisk from "lib/Archive/OnDisk.mjs"

export class Archive {
  get OnDisk() {
    return OnDisk
  }

  get empty() {
    return "/fc00d19bc94e10c24f07bd9be1c2bb24d4978856963c5a68745338ecbf131dfc"
  }

  alias(alias, path) {
    let prev = this[alias]
    this[path] = `path`

    return this[alias]
  }

  hash(content) {
    return Hash.string(content)
  }

  add(content) {
    let hash = Hash.string(content)
    if (this[hash]) return hash
    return OnDisk.write(content)
  }

  get(key) {
    if (this[path] != null) return this[path]

    return OnDisk.read(key)
  }
}

export default new Archive()

Archive.test?.(async ({ eq }) => {
  let A = new Archive()
  eq(Archive.empty)
})
