import { app, BrowserWindow } from "electron"
import * as Path from "path"
import * as project from "../../project.mjs"
import { plugin } from "../core.mjs"

export const windows = dispatch => {
  app.on("activate", onActivate)
  app.whenReady().then(onReady)

  function cleanup() {
    app.off("activate", onActivate)
  }

  return plugin("windows", input => state => {
    state.appReady ??= false
    const windows = (state.windows ??= {})
    windows.index ??= new Map()
    windows.queue ??= []

    if (input.appReady) state.appReady = true
    if (input.windowClosedId) windows.index.delete(input.windowClosedId)
    if (input.openWindow) windows.queue.push(input.openWindow)
    if (input.openWindows) windows.queue.push(...input.openWindows)

    if (!state.appReady) return

    for (const id of input.closeWindows ?? []) {
      state.windows.index.get(id)?.close()
    }

    let req
    while ((req = windows.queue.pop())) {
      const win = new BrowserWindow({
        ...req.options,
        webPreferences: {
          ...req.options?.webPreferences,
          preload: project.entry("preload.js"),

          // TODO(jeff): After switching to ES6 modules, this should be fixable
          worldSafeExecuteJavaScript: false,
          nodeIntegration: true,
          contextIsolation: false,
        },
      })

      win.loadFile(project.entry(req.src))
      if (req.openDevtools) win.webContents.openDevTools()

      const id = String(win.id)

      win.on("closed", () => dispatch({ windowClosedId: id }))

      state.windows.index.set(id, { id, ...req })
    }
  })

  function onActivate() {
    dispatch({ appActivated: true })
  }

  function onReady() {
    dispatch({ appReady: true })
  }
}
