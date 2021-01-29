import { iter } from "../lib/edit.mjs"

export function persist(input, state) {
  for (const key of iter(input.persist)) {
    state.persist ??= new Set()
    state.persist.add(key)
  }
}
