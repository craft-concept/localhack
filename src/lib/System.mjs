import chalk from "chalk"

import Precursor from "lib/Precursor"

export default Precursor.clone.def({
  name: "System",

  log(...xs) {
    console.log(...xs)
  },

  warn(...xs) {
    console.warn(...xs)
  },

  report(err) {
    let line = chalk.red("\n========================\n")
    console.error(line, chalk.red("Error:"), err, line)
  },
})
