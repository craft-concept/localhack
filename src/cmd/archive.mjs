import { program } from "commander"
import chalk from "chalk"
import { relative, resolve } from "path"
import fp from "fs/promises"
import fg from "fast-glob"

import System from "lib/System"
import Archive from "lib/Archive"

program
  .command("archive [globs...]")
  .description("Copy files into LocalHack's Archive.")
  .option("--replace", "Replace the original files with a symlink.", false)
  .action(main)

async function main(globs, { replace }) {
  try {
    let paths = fg.stream(globs, { absolute: true, onlyFiles: true })
    let proms = []
    if (replace)
      System.log("Moving files and replacing originals with symlink...")
    else System.log("Keeping originals in place...")

    for await (let path of paths) {
      let full = resolve(path)
      let rel = relative(process.cwd(), full)
      let hashP = replace
        ? Archive.ingest(full)
        : Archive.write(await fp.readFile(full))

      proms.push(hashP.then(hash => System.log(`${hash}\t<-\t${rel}`)))
    }

    await Promise.all(proms)
    System.log("Done.")
  } catch (err) {
    System.report(err)
  }
}
