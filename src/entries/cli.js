import * as flob from "fast-glob"
import { plugin } from "../lib/sift"
import { standard, trace } from "../lib/sift/plugins/std"

const [bin, cmd, ...args] = process.argv
const dispatch = standard({
  cwd: process.cwd(),
  cmd,
  args,
})

const buildCmd = plugin("buildCmd", input => state => {
  if (input.cmd !== "build") return
  console.log("Building...")

  const files = glob.stream(["src/**/*.ts"])
})

dispatch({
  plugins: { add: [trace, buildCmd] },
  cmd,
  args,
})
