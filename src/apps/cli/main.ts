import { Engine, Update, identity, map, makeListener } from "../../lib"
import * as Persist from "../../engines/PersistEngine"

export type Action =
  | { type: "Start" }
  | { type: "DataChanged"; next: Persist.Action<Data> }
  | { type: "CmdInvoked"; cmd: string; args: string[] }

export interface State {
  persist: Persist.State<Data>
}

export interface Data {
  version: number
  counter: number
}

export const init = (): State => ({
  persist: Persist.init({ version: 1, counter: 0 }),
})

export const update: Update<Action, State> = action => {
  // console.log(action)

  switch (action.type) {
    case "Start":
      return identity

    case "DataChanged":
      return map({ persist: Persist.update(action.next) })

    case "CmdInvoked":
      switch (action.cmd) {
        case "inc":
          return map({
            persist: map({ data: map({ counter: (x: number) => x + 1 }) }),
          })

        case "test":
          // HACK: move to engine
          import("path")
            .then(
              ({ resolve }) => import(resolve(process.cwd(), action.args[0])),
            )
            .then(mod => mod.tests())

          return identity

        default:
          throw new Error(`Sub-command ${action.cmd} not found`)
      }

    default:
      return identity
  }
}

const persistEngine = Persist.engine(".localhack/data")

export const engine: Engine<Action, State> = async dispatch => {
  const persistListener = makeListener(
    persistEngine(next => dispatch({ type: "DataChanged", next })),
  )

  let invoked = false
  return ({ persist }) => {
    persistListener(persist)

    if (invoked) return

    if (persist.status === "idle") {
      const [, , cmd, ...args] = process.argv
      if (!cmd) throw new Error("Sub-command is required!")

      invoked = true
      dispatch({ type: "CmdInvoked", cmd, args })
    }
  }
}
