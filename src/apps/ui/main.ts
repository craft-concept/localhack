import { pipe, Update } from "../../lib"
import * as WindowEngine from "../../engines/WindowEngine"

export type Action = WindowEngine.Action
export type State = WindowEngine.State

export const { init, engine } = WindowEngine

export const update: Update<Action, State> = action => {
  console.log("action:", action)

  switch (action.type) {
    case "AppReady":
      return pipe(
        WindowEngine.open({
          src: "src/apps/ui/index.html",
          openDevtools: true,
          options: {},
        }),
        WindowEngine.update(action),
      )
  }

  return WindowEngine.update(action)
}

// // Quit when all windows are closed, except on macOS. There, it's common
// // for applications and their menu bar to stay active until the user quits
// // explicitly with Cmd + Q.
// app.on("window-all-closed", function () {
//   if (process.platform !== "darwin") app.quit()
// })
