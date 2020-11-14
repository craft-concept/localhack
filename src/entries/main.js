import { standard, trace } from "../lib/sift/plugins/std"
import { windows } from "../lib/sift/plugins/windows"

const dispatch = standard()

dispatch({
  plugins: [windows(dispatch), trace],
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
