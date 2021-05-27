import { program } from "commander"
import chalk from "chalk"
import { relative, resolve } from "path"
import fp from "fs/promises"
import fg from "fast-glob"

import System from "lib/System"
import Archive from "lib/Archive"

program
  .command("read <hash>")
  .description("Read from LocalHack's Archive.")
  .action(main)

async function main(hash) {
  try {
    await new Promise((res, rej) => {
      Archive.stream(hash).pipe(process.stdout).on("end", res).on("error", rej)
    })
  } catch (err) {
    System.report(err)
  }
}
