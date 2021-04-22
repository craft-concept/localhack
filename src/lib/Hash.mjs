import { createHash } from "crypto"

export default class Hash {
  static object(obj) {
    return this.string(JSON.stringify(obj))
  }

  static string(str) {
    let hash = createHash("sha256")
    hash.update(str)
    return hash.digest("hex")
  }
}
