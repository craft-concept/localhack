import { app, BrowserWindow } from "electron"
import * as Path from "path"
import * as project from "../../project"
import { plugin } from "../core"

export const update = plugin("windows.update", input => state => {
  state.appReady ??= false
  const windows = (state.windows ??= {})
  windows.index ??= new Map()
  windows.opening ??= new Set()
  windows.closing ??= new Set()

  if (input.appReady) state.appReady = true
  if (input.openWindow) windows.opening.add(input.openWindow)
  if (input.closeWindow) windows.closing.add(input.closeWindow)

  if (input.windowClosed) windows.index.delete(input.windowClosed)

  if (input.openedWindows) {
    for (const win of input.openedWindows) {
      windows.index.set(win.id, win)
    }
    windows.opening.clear()
  }

  for (const id of input.closedWindowIds ?? []) {
    windows.closing.remove(id)
    state.index.delete(id)
  }
})

export const engine = dispatch => {
  app.on("activate", onActivate)
  app.whenReady().then(onReady)

  function cleanup() {
    app.off("activate", onActivate)
  }

  return plugin("windows.engine", input => state => {
    const { appReady, windows } = state
    if (!appReady) return

    const opened = []
    for (const req of windows.opening) {
      const win = new BrowserWindow({
        ...req.options,
        webPreferences: {
          ...req.options?.webPreferences,
          preload: project.entry("preload.js"),

          // TODO(jeff): After switching to ES6 modules, this should be fixable
          worldSafeExecuteJavaScript: false,
          contextIsolation: false,
        },
      })

      const id = String(win.id)

      win.loadFile(project.entry(req.src))

      if (req.openDevtools) win.webContents.openDevTools()

      win.on("closed", () => dispatch({ windowClosed: id }))

      opened.push({ id, ...req })
    }

    for (const id of windows.closing) {
      BrowserWindow.fromId(Number(id))?.close()
    }

    const output = {}

    if (opened.length > 0) output.openedWindows = opened
    if (windows.closing.length > 0) output.closedWindowIds = windows.closing

    dispatch(output)
  })

  function onActivate() {
    dispatch({ appActivated: true })
  }

  function onReady() {
    dispatch({ appReady: true })
  }
}
