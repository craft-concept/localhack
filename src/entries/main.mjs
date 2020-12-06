import { make } from "../lib/Sift.mjs"
import { current } from "../lib/edit.mjs"
import { standard, debugging } from "../plugins/std.mjs"
import { windows } from "../plugins/windows.mjs"

const send = make()

send(standard, debugging, windows(send))

send({
  window: {
    src: "index.html",
    openDevtools: true,
    options: {},
  },
})
