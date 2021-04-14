import { program } from "commander"
import fs from "fs"
import * as Project from "lib/Project"
import Translate from "lib/Translate"
import Build from "lib/Build"

program.command("watch").description("Build files that change.").action(main)

export let watcher

async function main() {
  try {
    console.log("Watching...")

    watcher = fs.watch(
      Project.src(),
      { recursive: true, persistent: true },
      async (event, relativePath) => {
        let path = Project.file(Project.src(relativePath))

        await Build.file(path)
      },
    )
  } catch (err) {
    console.error(err)
  }
}
