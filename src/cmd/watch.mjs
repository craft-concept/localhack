import { program } from "commander"
import System from "lib/System"
import Build from "lib/Build"
import { testModule } from "lib/Testing"

program.command("watch").description("Build files that change.").action(main)

async function main() {
  try {
    await Build.watch().tap(async ({ path }) => {
      if (!path.endsWith(".mjs")) return
      path = path.replace(/^.+src\//, "").replace(/\.mjs$/, "")

      await testModule(path)
      console.log()
    })
  } catch (err) {
    System.report(err)
  }
}
