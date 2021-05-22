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

  static async stream(strm) {
    let hash = createHash("sha256")

    return new Promise((res, rej) => {
      strm
        .pipe(hash)
        .on("error", rej)
        .on("readable", () => {
          let data = hash.read()
          if (!data) return rej(new Error("No hash found."))
          res(bs58.encode(data))
        })
    })
  }
}
