/**
 * I just want a testing framework that lets me write tests in the same file
 * as the source code.
 */

import { strict, AssertionError } from "assert"
import chalk from "chalk"

export const dot = chalk.green("✓")

export const log = x => process.stdout.write(x)
export const eq = (actual, expected, message) => {
  strict.deepEqual(actual, expected, message)
  log(dot)
}

export const throws = (err, fn) => {
  try {
    fn()
  } catch (e) {
    if (!(e instanceof err)) throw e
    log(dot)
  }

  strict.fail(`Expected to throw ${err.name}`)
}

if (process.env.NODE_ENV === "test") log("\nRunning tests...\n\n")

/**
 * Write tests next to the source.
 */
export const test = (subject, fn) => {
  if (process.env.NODE_ENV !== "test") return

  log(`Testing ${chalk.yellow(subject.name || subject)}: `)
  try {
    fn({ eq, throws })
    log("\n")
  } catch (err) {
    log(chalk.red("✗"))

    if (err instanceof AssertionError) {
      console.error(chalk.red("\n\nAssertion failed:\n=================\n"))
      console.error(err.message.replace(/(- expected)/, "\n$1"))
      console.error("\nBacktrace:")
      console.error(backtrace(err))
      console.error("")
    } else {
      console.error(chalk.red("\n\nError thrown:\n=============\n"))
      console.error(err)
      console.error("\n\n")
    }
  }
}

export const backtrace = err =>
  err.stack
    .split("\n")
    .filter(line => /^\s*at ./.test(line))
    .join("\n")
