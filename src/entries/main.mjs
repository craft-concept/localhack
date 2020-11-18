import { sift, standard, debugging, current } from "../lib/sift.mjs"
// import { windows } from "../lib/sift/plugins/windows.mjs"

const send = sift()

send(
  standard,
  debugging,
  // , windows(send)
)

send({
  window: {
    src: "index.html",
    openDevtools: true,
    options: {},
  },
})
