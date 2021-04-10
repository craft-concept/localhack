import { program } from "commander"
import fs from "fs"
import Translate from "lib/Translate"
import Build from "lib/Build"

program.command("watch").description("Build files that change.").action(main)

export let watcher

async function main() {
  watcher ??= fs.watch(
    Project.src(),
    { recursive: true },
    async (event, relativePath) => {
      let path = Project.src(relativePath)
      let stats = await stat(path)

      Build.file(path)
    },
  )
}
