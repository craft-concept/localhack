import { program } from "commander"
import chalk from "chalk"
import { relative, resolve } from "path"
import fp from "fs/promises"

import System from "lib/System"
import OnDisk from "lib/Archive/OnDisk"

program
  .command("ingest [files...]")
  .alias("in")
  .description("Move files into LocalHack's Archive.")
  .option(
    "--keep",
    "Keep the original files as-is, instead of the default behavior of replacing them with a symlink.",
    false
  )
  .action(main)

async function main(paths, { keep }) {
  try {
    let proms = []
    for (let path of paths) {
      if (keep) System.log("Keeping originals in place...")
      else System.log("Moving files and replacing originals with symlink...")

      let full = resolve(path)
      let rel = relative(process.cwd(), full)
      let hashP = keep ? OnDisk.write(fp.readFile(full)) : OnDisk.ingest(full)

      proms.push(hashP.then(hash => System.log(`${full}: ${hash}`)))
    }

    await Promise.all(proms)
    System.log("Done.")
  } catch (err) {
    System.report(err)
  }
}
