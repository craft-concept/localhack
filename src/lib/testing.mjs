/**
 * I just want a testing framework that lets me write tests in the same file
 * as the source code.
 */

import { strict } from "assert"

export const log = x => process.stdout.write(x)
export const eq = (actual, expected, message) => {
  strict.deepEqual(actual, expected, message)
  log(".")
}

export const throws = (err, fn) => {
  try {
    fn()
  } catch (e) {
    if (!(e instanceof err)) throw e
  }

  log(".")
}

if (process.env.NODE_ENV === "test") log("\nRunning tests...\n\n")

/**
 * Write tests at the bottom of your source files.
 */
export const test = (subject, fn) => {
  if (process.env.NODE_ENV !== "test") return

  log(`Testing ${subject.name || subject}: `)
  fn({ eq, throws })
  log("\n")
}
