import * as Project from "lib/Project"

export async function build() {
  // test({ watch: true }, "lib/Transform.mjs")

  for await (const path of Project.glob("lib/*.mjs")) {
  }
}
