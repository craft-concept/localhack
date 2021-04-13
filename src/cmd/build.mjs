import { program } from "commander"

import Build from "lib/Build"

program
  .command("build")
  .description("Build the files in the current project.")
  .action(main)

async function main() {
  try {
    await Build.project()
  } catch (err) {
    console.error(err)
  }
}
