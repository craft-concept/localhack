import { createHash } from "crypto"

export default class Hash {
  static object(obj) {
    return this.string(JSON.stringify(obj))
  }

  static string(str) {
    return this.buffer(str)
  }

  static buffer(buff) {
    let hash = createHash("sha256")
    hash.update(buff)
    return hash.digest("hex")
  }
}
