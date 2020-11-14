import * as React from "react"
import { Engine, Update, Dispatch, identity } from "../lib"

export type Action =
  | { type: "SomethingHappened" }
  | { type: "OtherThingHappened" }

export interface State {}

export const init = (): State => ({})

export const update: Update<Action, State> = action => {
  switch (action.type) {
    case "SomethingHappened":
      return identity

    default:
      return identity
  }
}

export const engine: Engine<Action, State> = dispatch => {
  return state => {}
}

export interface Props {
  state: State
  dispatch: Dispatch<Action>
}

export default function SomeComponent(props: Props): React.ReactNode {
  return null
}
