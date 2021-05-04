# Testing Page

A set of functions for defining tests next to the code they are testing. See the
`test` function.

```mjs
import { strict, AssertionError } from "assert"
import chalk from "chalk"

export const dot = chalk.green("✓")

export const cases = {}

export const log = x => process.stdout.write(x)
export const eq = (actual, expected, message) => {
  strict.deepEqual(actual, expected, message)
  log(dot)
}

export const truthy = (actual, message) => {
  strict.ok(actual, message)
  log(dot)
}

export const falsy = (actual, message) => {
  if (actual == null || actual === false) {
    log(dot)
  } else {
    strict.fail(message || "Expected falsy value")
  }
}

export const throws = (err, fn) => {
  if (!fn) {
    fn = err
    err = Error
  }

  try {
    fn()
  } catch (e) {
    if (e === err || e instanceof err) return log(dot)
    throw e
  }

  strict.fail(`Expected to throw ${err.name}`)
}

export const rejects = async (prom, err = Error) => {
  try {
    await prom
  } catch (e) {
    if (e instanceof err) return log(dot)
    throw e
  }

  strict.fail(`Expected to reject with ${err.name}`)
}
```

The function you're most likely here for. Example usage:
`test(someFunction, ({ eq }) => { eq(someFunction(), expectedOutput) })`

```mjs
export function test(subject, fn) {
  const filename = callingFilename()

  const entry = { filename, subject, fn }
  if (process.env.NODE_ENV == "test") runTest(entry)
  else {
    let k = entry.filename
    cases[k] ??= []
    cases[k].push(entry)
  }
}

export async function testModule(mod) {
  // await import(`${mod}?break=${Math.random()}`).catch(console.error)
  await import(mod).catch(console.error)

  let Res = await import("lib/Resolution")
  let Project = await import("lib/project")
  let resolved = await Res.realPathFor(mod)
  let name = Project.file(resolved).replace(/^.+src\//, "")

  await runTestsFor(name)
}

export async function runAll() {
  log("\nRunning tests...\n\n")
  for (const k in cases) await runTestsFor(k)
  log("\nDone.\n")
}

export async function runTestsFor(name) {
  if (!cases[name]) {
    console.log(`No test cases for ${name}`)
    return
  }
  console.log("\n" + name)
  for (const entry of cases[name]) await runTest(entry)
}

export async function runTest({ filename, subject, fn }) {
  let name = subject.name || subject
  name = name.replace(/^bound /, "")

  log(`  ${chalk.yellow(name)}: `)
  try {
    await fn({ rejects, eq, throws, truthy, falsy })
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

Function.prototype.test = function testSelf(...inputs) {
  test(this, ...inputs)
  return this
}
```

And we define some helpers for handling stack traces.

```mjs
export const backtrace = err =>
  err.stack
    .split("\n")
    .filter(line => /^\s*at ./.test(line))
    .join("\n")

/**
 * Parses details from the stacktrace of the given error.
 */
export function* stackDetails(err) {
  const matches = err.stack.matchAll(/ +at.*[( ](?:\w+:\/\/)?(.+):(\d+):(\d+)/g)

  for (const [match, path, line, col] of matches) {
    const name = path.replace(/^.*\/(build|src)\//, "")
    yield {
      name,
      path,
      line: Number(line),
      col: Number(col),
    }
  }
}

/**
 * Returns the first filename in the call stack that is not this one.
 */
export function callingFilename() {
  const err = new Error()
  let current
  for (const { name } of stackDetails(err)) {
    current ??= name
    if (name !== current) return name
  }
}
```
