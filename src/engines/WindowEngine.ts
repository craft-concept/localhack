import { app, BrowserWindow } from "electron"
import * as Path from "path"
import { Engine, map, push, Update, toggle, always, index } from "../lib"

export type WindowId = string & { __type: "WindowId" }

export interface OpenReq {
  src: string
  openDevtools?: boolean
  options?: Partial<Electron.BrowserWindowConstructorOptions>
}

export interface WindowDesc extends OpenReq {
  id: WindowId
}

const Windows = index((win: WindowDesc) => win.id, always)

export interface State {
  isReady: boolean
  windows: typeof Windows.Index
  opening: OpenReq[]
  closing: WindowId[]
}

export const init = (): State => ({
  isReady: false,
  windows: Windows.init(),
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
        windows: Windows.add(...action.opened),
      })
    }

    case "AppReady":
      return map({ isReady: toggle })
  }
}

export const engine: Engine<Action, State> = dispatch => {
  app.on("activate", onActivate)
  app.whenReady().then(onReady)

  function cleanup() {
    app.off("activate", onActivate)
  }

  return ({ isReady, closing, opening }) => {
    if (!isReady) return

    const opened = opening.map(req => {
      const win = new BrowserWindow({
        ...req.options,
        webPreferences: {
          ...req.options?.webPreferences,
          preload: Path.join(__dirname, "../apps/ui/preload.ts"),

          // TODO(jeff): After switching to ES6 modules, this should be fixable
          worldSafeExecuteJavaScript: false,
          contextIsolation: false,
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

    for (const id of closing) {
      BrowserWindow.fromId(Number(id))?.close()
    }

    if (opened.length > 0) dispatch({ type: "WindowsOpened", opened })
    if (closing.length > 0) dispatch({ type: "WindowsClosing", ids: closing })

    return cleanup
  }

  function onActivate() {
    dispatch({ type: "AppActivated" })
  }

  function onReady() {
    dispatch({ type: "AppReady" })
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
