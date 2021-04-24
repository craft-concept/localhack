import { program } from "commander"
import System from "lib/System"
import Build from "lib/Build"

program.command("watch").description("Build files that change.").action(main)

async function main() {
  try {
    await Build.watch()
  } catch (err) {
    System.report(err)
  }
}
