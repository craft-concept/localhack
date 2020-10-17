import { app, BrowserWindow } from "electron"
import * as path from "path"
import { Engine, map, push, Update, mut, toggle, always } from "../lib"

export type WindowId = string & { __type: "WindowId" }

export interface OpenReq {
  src: string
  openDevtools?: boolean
  options?: Partial<Electron.BrowserWindowConstructorOptions>
}

export interface WindowDesc extends OpenReq {
  id: WindowId
}

export interface State {
  isReady: boolean
  windows: { [id: string]: WindowDesc }
  opening: OpenReq[]
  closing: WindowId[]
}

export const init = (): State => ({
  isReady: false,
  windows: {},
  opening: [],
  closing: [],
})

export type Action =
  | { type: "AppReady" }
  | { type: "AppActivated" }
  | { type: "WindowsOpened"; opened: WindowDesc[] }
  | { type: "WindowsClosing"; ids: WindowId[] }
  | { type: "WindowClosed"; id: WindowId }

export const update: Update<Action, State> = (action: Action) => {
  switch (action.type) {
    case "WindowsOpened": {
      return map({
        opening: always([]),
        windows: mut(all => {
          for (const win of action.opened) {
            all[win.id] = win
          }
        }),
      })
    }

    case "AppReady":
      return map({ isReady: toggle })
  }
}

export const engine: Engine<Action, State> = dispatch => {
  const handles: { [id: string]: BrowserWindow } = {}

  app.on("activate", () => {
    dispatch({ type: "AppActivated" })
  })

  app.whenReady().then(() => {
    dispatch({ type: "AppReady" })
  })

  return state => {
    if (!state.isReady) return

    const opened = state.opening.map(req => {
      const win = new BrowserWindow({
        ...req,
        webPreferences: {
          preload: path.join(__dirname, "../apps/ui/preload.js"),
        },
      })

      const id = String(win.id) as WindowId

      win.loadFile(req.src)

      if (req.openDevtools) win.webContents.openDevTools()

      win.on("closed", () => dispatch({ type: "WindowClosed", id }))

      return {
        id,
        ...req,
      }
    })

    const closing = state.closing.map(id => {
      handles[id].close()
      return id
    })

    if (opened.length > 0) dispatch({ type: "WindowsOpened", opened })
    if (closing.length > 0) dispatch({ type: "WindowsClosing", ids: closing })
  }
}

export const open = (req: OpenReq) =>
  map<any, State>({
    opening: push(req),
  })

export const close = (id: WindowId) =>
  map({
    closing: push(id),
  })
