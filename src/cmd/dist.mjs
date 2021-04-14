import { program } from "commander"

import Bundle from "lib/Bundle"

program.command("dist").description("Create a distribution build.").action(main)

async function main() {
  try {
    await Bundle.project()
  } catch (err) {
    console.error(err)
  }
}
