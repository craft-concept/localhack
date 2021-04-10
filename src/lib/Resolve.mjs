import { paths } from "hack.yml"
import * as Resolve from "@core/lib/Resolve"

export function* roots() {}

export function* aliased(name) {
  for (const path of paths) {
    yield path.replace("%", name)
  }

  for (const path of paths) {
    yield* aliased(path.replace("%", name))
  }
}

export async function real(path, parent) {}
