import electron from "electron"
import * as Path from "path"
import * as project from "lib/project"

const { app, BrowserWindow } = electron

// Todo update from legacy api
export const windows = send => {
  app.on("activate", onActivate)
  app.whenReady().then(onReady)

  function cleanup() {
    app.off("activate", onActivate)
  }

  return input => state => {
    state.appReady ?? (state.appReady = false)
    state.windows ?? (state.windows = {})
    const { windows } = state
    windows.index ?? (windows.index = new Map())
    windows.queue ?? (windows.queue = [])

    if (input.appReady) state.appReady = true
    if (input.windowClosedId) windows.index.delete(input.windowClosedId)
    if (input.window) windows.queue.push(input.window)

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

      win.on("closed", () => send({ windowClosedId: id }))

      state.windows.index.set(id, { id, ...req })
    }
  }

  function onActivate() {
    send({ appActivated: true })
  }

  function onReady() {
    send({ appReady: true })
  }
}
