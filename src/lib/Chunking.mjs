import { deduplicate, targetSize } from "vendor/@ronomon/deduplication"

export default class Chunking {
  static average = 64 * 1024
  static minimum = (64 * 1024) / 2
  static maximum = 64 * 1024 * 3

  static async buffer(buff) {
    // holds the chunk hashes (32 bytes) + chunkSizes (4 bytes)
    let target = new Buffer.alloc(targetSize(this.minimum, buff))

    return new Promise((res, rej) => {
      deduplicate(
        this.average,
        this.minimum,
        this.maximum,
        buff,
        0, // sourceOffset
        buff.length,
        target,
        0, // targetOffset
        !"FLAGS",
        hashFn,
        (err, sourceOffset, targetOffset) => {
          if (err) return rej(err)

          res(target)
        }
      )
    })
  }
}

function hashFn(source, sourceOffset, sourceSize, target, targetOffset) {
  var digest = crypto.createHash("SHA256")
  digest.update(source.slice(sourceOffset, sourceOffset + sourceSize))
  digest.digest().copy(target, targetOffset)
}

Chunking.test?.(({ eq }) => {
  let input = "Hello, world."
})
