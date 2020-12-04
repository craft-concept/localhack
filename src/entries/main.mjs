import { sift } from "../lib/Sift.mjs"
import { current } from "../lib/edit.mjs"
import { standard, debugging } from "../plugins/std.mjs"
import { windows } from "../plugins/windows.mjs"

const send = sift()

send(standard, debugging, windows(send))

send({
  window: {
    src: "index.html",
    openDevtools: true,
    options: {},
  },
})
