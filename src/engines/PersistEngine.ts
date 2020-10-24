import * as Path from "path"
import { promises as Fs } from "fs"
import { Engine, Update, identity, set, map, always } from "../lib"

export type Action<Data> =
  | { type: "NoData" }
  | { type: "DataLoaded"; data: Partial<Data> }
  | { type: "DataSaving"; data: Data }
  | { type: "DataSaved" }

export type Status = "loading" | "saving" | "idle"

export interface State<Data> {
  status: Status
  data: Data
}

export const init = <Data>(data: Data): State<Data> => ({
  status: "loading",
  data,
})

export const update: Update<Action<any>, State<any>> = action => {
  switch (action.type) {
    case "NoData":
      return map({ status: always("idle") })

    case "DataLoaded":
      return map({ data: set(action.data), status: always("idle") })

    case "DataSaving":
      return map({ status: always("saving") })

    case "DataSaved":
      return map({ status: always("idle") })

    default:
      return identity
  }
}

export const engine = (
  relativePath: string,
): Engine<Action<any>, State<any>> => async dispatch => {
  const path = Path.join(process.cwd(), relativePath)

  await Fs.mkdir(Path.dirname(path), { recursive: true })
  try {
    await Fs.readFile(path)
      .then(String)
      .then(JSON.parse)
      .then(data => dispatch({ type: "DataLoaded", data }))
  } catch {
    dispatch({ type: "NoData" })
  }

  let prev = undefined
  return async ({ data, status }) => {
    if (status !== "idle") return
    if (data === prev) return
    prev = data

    dispatch({ type: "DataSaving", data })
    await Fs.writeFile(path, JSON.stringify(data))
    dispatch({ type: "DataSaved" })
  }
}
