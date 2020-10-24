/**
 * Http requests come in as actions
 */

import { Engine, Update, identity } from "../lib"

export type Action =
  | { type: "SomethingHappened" }
  | { type: "OtherThingHappened" }

export interface State {}

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
