import { standard, trace } from "../lib/sift/std.mjs"
import { windows } from "../lib/sift/plugins/windows"

const dispatch = standard()

dispatch({
  plugins: { add: [windows(dispatch), trace] },
})

dispatch({
  openWindows: [
    {
      src: "index.html",
      openDevtools: true,
      options: {},
    },
  ],
})
