import { strict } from "assert"
import { tap } from "./edit"
import { spool } from "./spool"

export const deepEqual = <T>(
  actual: any,
  expected: T,
  message?: string | Error,
): void => {
  process.stdout.write(".")
  strict.deepEqual(actual, expected, message)
}

export const test = spool({
  eq: expected => tap(v => v === expected),
})

// test(1).eq(2)
