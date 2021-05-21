import { createHash } from "crypto"
import bs58 from "bs58check"

export default class Hash {
  static object(obj) {
    return this.string(JSON.stringify(obj))
  }

  static string(str) {
    return this.buffer(str)
  }

  static buffer(buff) {
    let hash = createHash("sha256").update(buff).digest()
    return bs58.encode(hash)
  }
}
