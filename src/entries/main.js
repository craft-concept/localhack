import { standard, trace } from "../lib/sift/plugins/std"
import * as windows from "../lib/sift/plugins/windows"

const dispatch = standard()

dispatch({
  plugins: [windows.update, windows.engine(dispatch), trace],
})

dispatch({
  openWindow: {
    src: "index.html",
    openDevtools: true,
    options: {},
  },
})
