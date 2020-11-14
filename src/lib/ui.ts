import { builder } from "./builder"
import { set } from "./edit"
import { makeFn } from "./fns"

export interface UiState {
  name?: string
  tag?: string
  mods?: string[]
}

export const name = (name: string) => set<UiState>({ name })

export const mods = (mods: string[]) => set<UiState>({ mods })

export const ui = builder({
  name,
  mods,
})({} as UiState)
