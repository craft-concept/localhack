import { program } from "commander"
import chalk from "chalk"
import { relative, resolve } from "path"

import System from "lib/System"
import Hash from "lib/Hash"
import Clipboard from "lib/Clipboard"

program
  .command("hash")
  .description("Hash stdin as bs58check and copy to clipboard.")
  .action(main)

async function main() {
  try {
    let hash = await Hash.stream(process.stdin)
    await Clipboard.copy(hash)
    System.log(hash)
  } catch (err) {
    System.report(err)
  }
}
