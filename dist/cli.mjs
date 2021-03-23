#!/usr/bin/env node

// .hack/build/lib/Sift.mjs
import { produce as produce2 } from "immer"

// .hack/build/lib/Testing.mjs
import { strict, AssertionError } from "assert"
import chalk2 from "chalk"
var dot = chalk2.green("\u2713")
var log = x => process.stdout.write(x)
var eq = (actual, expected, message) => {
  strict.deepEqual(actual, expected, message)
  log(dot)
}
var truthy = (actual, message) => {
  strict.ok(actual, message)
  log(dot)
}
var falsy = (actual, message) => {
  if (actual == null || actual === false) {
    log(dot)
  } else {
    strict.fail(message || "Expected falsy value")
  }
}
var throws = (err, fn) => {
  try {
    fn()
  } catch (e) {
    if (e instanceof err) return log(dot)
    throw e
  }
  strict.fail(`Expected to throw ${err.name}`)
}
if (process.env.NODE_ENV === "test") log("\nRunning tests...\n\n")
var previousFilename = ""
function test(subject, fn) {
  if (process.env.NODE_ENV !== "test") return
  const filename = callingFilename()
  if (filename !== previousFilename) {
    console.log("\n" + filename)
    previousFilename = filename
  }
  log(`  ${chalk2.yellow(subject.name || subject)}: `)
  try {
    fn({ eq, throws, truthy, falsy })
    log("\n")
  } catch (err) {
    log(chalk2.red("\u2717"))
    if (err instanceof AssertionError) {
      console.error(chalk2.red("\n\nAssertion failed:\n=================\n"))
      console.error(err.message.replace(/(- expected)/, "\n$1"))
      console.error("\nBacktrace:")
      console.error(backtrace(err))
      console.error("")
    } else {
      console.error(chalk2.red("\n\nError thrown:\n=============\n"))
      console.error(err)
      console.error("\n\n")
    }
  }
}
var backtrace = err =>
  err.stack
    .split("\n")
    .filter(line => /^\s*at ./.test(line))
    .join("\n")
function* stackDetails(err) {
  const matches = err.stack.matchAll(/ +at.*[( ](?:\w+:\/\/)?(.+):(\d+):(\d+)/g)
  for (const [match, path3, line, col] of matches) {
    const name = path3.replace(/^.*\/(build|src)\//, "")
    yield {
      name,
      path: path3,
      line: Number(line),
      col: Number(col),
    }
  }
}
function callingFilename() {
  const err = new Error()
  let current2
  for (const { name } of stackDetails(err)) {
    current2 != null ? current2 : (current2 = name)
    if (name !== current2) return name
  }
}

// .hack/build/lib/edit.mjs
import {
  produce,
  isDraft,
  current as currentIm,
  original as originalIm,
} from "immer"

// .hack/build/lib/reify.mjs
var isObj = obj =>
  obj != null &&
  typeof obj === "object" &&
  Object.getPrototypeOf(obj) === Object.prototype
var T = {
  Number: x => Number(One(x)),
  String: x => String(One(x)),
  Boolean: x => Boolean(One(x)),
  Set: x => (x instanceof Set ? x : new Set(T.Iterable(x))),
  Array: x => (Array.isArray(x) ? x : [...T.Iterable(x)]),
  Object: x => {
    if (x == null) return {}
    if (isObj(x)) return x
    return {}
  },
  Iterable: x => {
    if (x == null) return []
    if (x instanceof Map) return x.keys()
    if (typeof x === "object" && Symbol.iterator in x) return x
    return [x]
  },
  One: x => {
    for (const v of T.Iterable(x)) {
      return v
    }
  },
}

// .hack/build/lib/Enum.mjs
function* iter(x) {
  if (x == null) return
  if (x instanceof Map) x = x.values()
  if (typeof x === "object" && Symbol.iterator in x) {
    for (const xa of x) yield* iter(xa)
  } else {
    yield x
  }
}
test(iter, ({ eq: eq2 }) => {
  eq2([...iter()], [])
  eq2([...iter(null)], [])
  eq2([...iter(void 0)], [])
  eq2([...iter(1)], [1])
  eq2([...iter([1])], [1])
  eq2([...iter([1, [2, 3], 4])], [1, 2, 3, 4])
  eq2(
    [
      ...iter(
        new Map([
          ["1", 1],
          ["2", 2],
        ]),
      ),
    ],
    [1, 2],
  )
})
function* withNext(iterable) {
  let it = iter(iterable),
    val,
    res,
    next = v => (val = v)
  do {
    res = it.next(val)
    yield [res, next]
  } while (res.done === false)
}
test(withNext, ({ eq: eq2 }) => {})
function isEmpty(x) {
  for (const _ of iter(x)) return false
  return true
}
test(isEmpty, ({ eq: eq2 }) => {
  eq2(isEmpty(null), true)
  eq2(isEmpty([]), true)
  eq2(isEmpty([1]), false)
  eq2(isEmpty(1), false)
})
function* keys(obj) {
  if (isObj(obj)) for (const k in obj) yield k
}
function* entries(obj) {
  if (isObj(obj)) for (const k in obj) yield [k, obj[k]]
}
var iterMap = fn =>
  function* iterMap2(...xs) {
    for (const v of iter(xs)) yield* iter(fn(v))
  }
test(iterMap, ({ eq: eq2 }) => {
  const inc = x => x + 1
  const evenOnly = x => (x % 2 === 0 ? x : null)
  const incs = iterMap(inc)
  const evens = iterMap(evenOnly)
  eq2([...incs()], [])
  eq2([...incs([])], [])
  eq2([...incs(null)], [])
  eq2([...incs(void 0)], [])
  eq2([...incs(1, 2, [3, [4]], 5)], [2, 3, 4, 5, 6])
  eq2([...incs(null, void 0, 1)], [2])
  eq2([...evens(1, 2, [3, [4]], 5)], [2, 4])
})
var Enum = class {
  static of(...values2) {
    return new Enum(() => iter(values2))
  }
  static gen(generator) {
    return new Enum(generator)
  }
  constructor(fn) {
    this.iter = fn
  }
  [Symbol.iterator]() {
    return this.iter()[Symbol.iterator]()
  }
  gen(fn) {
    return Enum.gen(() => fn(this.iter()))
  }
  chain(fn) {
    return this.gen(function* chained(xs) {
      for (const x of xs) yield* iter(fn(x))
    })
  }
  map(fn) {
    return this.gen(function* mapped(xs) {
      for (const x of xs) yield fn(x)
    })
  }
  filter(fn) {
    return this.select(fn)
  }
  select(fn) {
    return this.gen(function* filtered(xs) {
      for (const x of xs) if (fn(x)) yield x
    })
  }
  reject(fn) {
    return this.gen(function* filtered(xs) {
      for (const x of xs) if (!fn(x)) yield x
    })
  }
  each(fn) {
    for (const x of this.iter()) fn(x)
    return this
  }
  forEach(fn) {
    return this.each(fn)
  }
  get array() {
    var _a
    return (_a = this._array) != null ? _a : (this._array = [...this.iter()])
  }
  get set() {
    var _a
    return (_a = this._set) != null ? _a : (this._set = new Set(this.iter()))
  }
}
test(Enum, ({ eq: eq2 }) => {
  const inc = x => x + 1
  const dup = x => [x, x]
  const en = Enum.of(1, 2, 3)
  const en2 = Enum.of(en)
  eq2([...en], [1, 2, 3])
  eq2([...en2], [1, 2, 3])
  eq2(en.array, [1, 2, 3])
  eq2(en2.array, [1, 2, 3])
  eq2(en.map(inc).array, [2, 3, 4])
  eq2(en2.map(inc).array, [2, 3, 4])
  eq2(en.map(dup).array, [
    [1, 1],
    [2, 2],
    [3, 3],
  ])
  eq2(en2.map(dup).array, [
    [1, 1],
    [2, 2],
    [3, 3],
  ])
  eq2(en.chain(dup).array, [1, 1, 2, 2, 3, 3])
  eq2(en2.chain(dup).array, [1, 1, 2, 2, 3, 3])
  eq2(en.set, new Set([1, 2, 3]))
  eq2(en2.set, new Set([1, 2, 3]))
  test(en.select, () => {
    const isOdd = x => x % 2
    eq2(en.select(isOdd).array, [1, 3])
    eq2(en2.select(isOdd).array, [1, 3])
    eq2(en.filter(isOdd).array, [1, 3])
    eq2(en.map(inc).reject(isOdd).array, [2, 4])
  })
})

// .hack/build/lib/edit.mjs
var isNil = x => x == null
var exists = x => x != null
var reify22 = desc => state2 => {
  for (const [k, as] of entries(desc)) {
    state2[k] = as(state2[k])
  }
  return state2
}
test(reify22, ({ eq: eq2 }) => {
  const state2 = {
    number: 12,
    string: "something",
  }
  eq2(
    reify22({
      number: T.Array,
      string: T.Set,
    })(state2),
    {
      number: [12],
      string: new Set(["something"]),
    },
  )
})
var DRAFT_STATE = Symbol.for("immer-state")
var draftState = input => input[DRAFT_STATE]
var isModified = input => {
  var _a
  return (_a = draftState(input)) == null ? void 0 : _a.modified_
}
var current = input => (isDraft(input) ? currentIm(input) : input)
function deepAssign(target, ...sources) {
  for (const source of sources)
    for (const k of keys(source))
      if (typeof target[k] === "object" && typeof source[k] === "object") {
        deepAssign(target[k], source[k])
      } else {
        target[k] = source[k]
      }
  return target
}
test(deepAssign, ({ eq: eq2 }) => {
  const source = { a: { b: 2 } }
  eq2(deepAssign({ a: 1, c: 3 }, source), { a: { b: 2 }, c: 3 })
})
test(isModified, ({ eq: eq2 }) => {
  produce({ test: { a: 1 } }, obj => {
    eq2(isModified(obj), false)
    eq2(isModified(obj.test), false)
    obj.test.a = 2
    eq2(isModified(obj), true)
    eq2(isModified(obj.test), true)
  })
})

// .hack/build/lib/Sift.mjs
function make(...metas) {
  function self(...inputs) {
    return self.send(...inputs)
  }
  self.self = self
  self.send = inputs => (self.inputs = inputs)
  self.meta = (...metas2) => {
    for (const meta of iter(metas2)) self.send = meta(self) || self.send
    return self
  }
  self.meta(originalPlugin, ...metas)
  return self
}
function originalPlugin({ self }) {
  return (...inputs) => {
    var _a, _b, _c
    if (self.sending) {
      ;(_a = self.queue) != null ? _a : (self.queue = [])
      self.queue.push(...iter(inputs))
      return inputs
    }
    self.sending = true
    ;(_b = self.state) != null ? _b : (self.state = {})
    const results = produce2(inputs, inputs2 => {
      self.state = produce2(self.state, state2 => {
        var _a2
        ;(_a2 = state2.plugins) != null ? _a2 : (state2.plugins = [])
        for (const input of iter(inputs2)) {
          if (typeof input === "function") state2.plugins.push(input)
          runWith(state2.plugins, input, state2, self.send)
        }
      })
    })
    self.sending = false
    const queued = (_c = self.queue) == null ? void 0 : _c.shift()
    if (queued) self.send(queued)
    return results
  }
}
function runWith(fns3, input, state2, send2) {
  const out = []
  const delayed = []
  for (const fn of fns3) {
    const result = fn(input, state2)
    for (let reply of iter(result)) {
      if (typeof reply === "function") reply = result(send2)
      if (reply != null) {
        if (typeof reply.then === "function") delayed.push(reply)
        else out.push(reply)
      }
    }
  }
  return out.push(...delayed)
}
test(make, ({ eq: eq2 }) => {
  const self = make()
  self(
    (input, state2) => {
      var _a
      ;(_a = state2.count) != null ? _a : (state2.count = 0)
      state2.count++
    },
    input => {},
    input => (input.testing = true),
    (input, state2) => send2 => {
      if (state2.count === 4) send2({ msg: "count is 4!" })
    },
  )
  eq2(self({}), [{ testing: true }])
  eq2(self.state.count, 6)
})

// .hack/build/lib/fns.mjs
var pre = (fn, ...parts) => (...args2) => fn(...parts, ...args2)

// .hack/build/plugins/memory.mjs
import { v4 } from "uuid"
function acceptIndexes(input, state2) {
  var _a, _b
  ;(_a = state2.indexers) != null ? _a : (state2.indexers = {})
  for (const [name, fn] of entries(input.indexers)) {
    state2.indexers[name] = fn
    ;(_b = state2[name]) != null ? _b : (state2[name] = state2[name])
  }
}
function findId(input, state2) {
  if (input.id) return
  for (const [name, indexer] of entries(state2.indexers)) {
    const index = state2[name]
    if (!index) return
    for (const key of iter(indexer(input))) {
      if (index[key]) {
        input.id = index[key]
        return
      }
    }
  }
}
function populateFromId(input, state2) {
  var _a
  if (!input.id) return
  ;(_a = state2.byId) != null ? _a : (state2.byId = {})
  const cached = state2.byId[input.id]
  if (cached) {
    deepAssign(cached, current(input))
    deepAssign(input, current(cached))
  }
}
function writeIndexes(input, state2) {
  var _a, _b, _c
  for (const [name, indexer] of entries(state2.indexers)) {
    ;(_a = state2[name]) != null ? _a : (state2[name] = {})
    for (const key of iter(indexer(input))) {
      ;(_b = input.id) != null ? _b : (input.id = v4())
      ;(_c = input.createdAt) != null
        ? _c
        : (input.createdAt = new Date().toISOString())
      state2[name][key] = input.id
    }
  }
}
function writeToCache(input, state2) {
  var _a, _b, _c, _d
  if (!input.id) return
  ;(_a = state2.byId) != null ? _a : (state2.byId = {})
  const cached =
    (_d = (_b = state2.byId)[(_c = input.id)]) != null ? _d : (_b[_c] = {})
  deepAssign(cached, current(input))
  deepAssign(input, current(cached))
}
var stdin_default = [
  acceptIndexes,
  findId,
  populateFromId,
  writeIndexes,
  writeToCache,
]

// .hack/build/plugins/std.mjs
var alias = input => {
  if (typeof input.alias === "string") state[input.alias] = input
}
var config = input => {
  if (typeof input.config !== "object") return
  return state2 => {
    state2.config || (state2.config = {})
    deepAssign(state2.config, input.config)
  }
}
var trace = key =>
  function trace2(input) {
    if (key in input) console.log(`input.${key}:`, input[key])
  }
var standard = [stdin_default, config, alias]

// .hack/build/plugins/build.mjs
import fg from "fast-glob"
import chalk22 from "chalk"
import { constants, watch } from "fs"
import Esbuild from "esbuild"
import { copyFile, mkdir, readFile, writeFile, stat } from "fs/promises"
import { dirname, extname } from "path"

// .hack/build/lib/project.mjs
import { resolve, relative } from "path"
var root = (...paths) => resolve(process.cwd(), ...paths)
var src = pre(root, "src")
var entry = pre(src, "entries")
var local = pre(root, ".hack")
var build = pre(local, "build")
var dist = pre(root, "dist")
var file = path22 => relative(root(), path22)

// .hack/build/plugins/markdown.mjs
import MarkdownIt from "markdown-it"
var md = new MarkdownIt({})
function parseMarkdown(input) {
  const { path: path3, text } = input
  if (!text) return
  if (!path3.endsWith(".md")) return
  input.markdown = md.parse(text, {})
}
var all = [parseMarkdown]

// .hack/build/plugins/Literate.mjs
function tangling(input, state2) {
  var _a, _b
  const { path: path3, markdown: markdown2 } = input
  if (!path3) return
  if (!markdown2) return
  const code = {}
  for (const node2 of iter(markdown2)) {
    if (node2.type !== "fence") continue
    const blocks = (_b = code[(_a = node2.info)]) != null ? _b : (code[_a] = [])
    blocks.push(node2.content)
  }
  return send2 => {
    for (const [ext, blocks] of entries(code)) {
      send2({
        virtual: true,
        path: path3.replace(/\.md$/, "." + ext),
        text: blocks.join("\n\n"),
      })
    }
  }
}
var all2 = [tangling]

// .hack/build/plugins/build.mjs
var { COPYFILE_FICLONE } = constants
var isJsPath = path22 => /\.(mjs|js)x?$/.test(path22)
function globbing(input, state2) {
  const globs = input.glob
  if (!globs) return
  return async send2 => {
    for await (const path22 of fg.stream(root(globs), {
      dot: true,
      absolute: true,
    })) {
      send2({ path: path22, name: file(path22), ext: extname(path22) })
    }
  }
}
function reading(input, state2) {
  if (input.reading) return
  if (!input.path) return
  if (exists(input.text)) return
  const { path: path22 } = input
  input.reading = true
  return async send2 => {
    const text = await readFile(path22).then(String)
    send2({ path: path22, text, persisted: true, reading: false })
  }
}
function writing(input, state2) {
  if (input.persisted) return
  if (input.virtual) return
  if (!input.path) return
  if (isNil(input.text)) return
  const { path: path22, text } = input
  const mode = text.startsWith("#!") ? 493 : 420
  return async send2 => {
    await mkdir(dirname(path22), { recursive: true })
    await writeFile(path22, text, {
      mode,
    })
    console.log(`${chalk22.green("Wrote")}: ${file(path22)}`)
    send2({ path: path22, persisted: true })
  }
}
var loaders = {
  ".ohm": "text",
}
function transpiling(input, state2) {
  const { name, path: path22, text } = input
  if (!path22) return
  if (!text) return
  if (!/\/src\/.+\.(m?jsx?|ohm)$/.test(path22)) return
  const outputPath = path22
    .replace("/src/", "/.hack/build/")
    .replace(/\/Readme\.(\w+)$/, ".$1")
  return async send2 => {
    const { code } = await Esbuild.transform(text, {
      sourcefile: name != null ? name : path22,
      target: "node12",
      loader: loaders[extname(path22)],
      format: "esm",
    })
    send2({
      path: outputPath,
      text: code,
      source: path22,
      persisted: false,
    })
  }
}
function bundling(input, state2) {
  const { name, dist: dist2 } = input
  if (!dist2) return
  const entryPoints = fg.sync(dist2).filter(isJsPath)
  return async send2 => {
    const { outputFiles, warnings } = await Esbuild.build({
      entryPoints,
      platform: "node",
      bundle: true,
      target: "node12",
      format: "esm",
      loader: loaders,
      outExtension: { ".js": ".mjs" },
      external: [
        "chalk",
        "electron",
        "esbuild",
        "fast-glob",
        "immer",
        "markdown-it",
        "react",
        "uuid",
        "vscode",
        "yaml",
      ],
      outdir: dist(),
      write: false,
    })
    for (const out of outputFiles) {
      send2({
        path: out.path,
        text: out.text,
        persisted: false,
      })
    }
  }
}
function watching(input, state2) {
  return send2 => {
    var _a
    ;(_a = state2.watcher) != null
      ? _a
      : (state2.watcher = watch(
          src(),
          { recursive: true },
          async (event, relativePath) => {
            if (event !== "change") return
            const path22 = src(relativePath)
            const stats = await stat(path22)
            send2({
              path: path22,
              watching: true,
              modifiedAt: stats.mtime.toISOString(),
            })
          },
        ))
  }
}
var indexers = {
  byPath: input => input.path,
}
var all3 = [{ indexers }, globbing, writing, reading, transpiling, all, all2]

// .hack/build/plugins/CLI.mjs
function parseFlags(input, state2) {
  var _a, _b, _c, _d
  for (const arg of iter(input.args)) {
    const [m, name, value] = arg.match(/^--(\w[-_\w]*)(?:=(\w+))?$/) || []
    if (!name) continue
    ;(_a = input.flags) != null ? _a : (input.flags = {})
    ;(_c = (_b = input.flags)[name]) != null ? _c : (_b[name] = [])
    if (value) input.flags[name].push(value)
  }
  ;(_d = state2.flags) != null ? _d : (state2.flags = {})
  Object.assign(state2.flags, input.flags)
}
var all4 = [parseFlags]

// .hack/build/entries/cli.mjs
import electron2 from "electron"
import { execFile, spawn } from "child_process"
var cwd = process.cwd()
var [node, bin, cmd, ...args] = process.argv
var send = make()
send(standard, all3, all4, cli)
send({
  cwd,
  cmd,
  args,
})
function cli(input, state2) {
  if (!("cmd" in input)) return
  state2.cwd = input.cwd
  state2.cmd = input.cmd
  state2.args = current(input.args)
  return send2 => {
    if (state2.flags.debug) send2(trace(state2.flags.debug))
    switch (input.cmd) {
      case void 0:
        return send2(usageCmd)
      case "build":
        return send2(buildCmd)
      case "dist":
        return send2(distCmd)
      case "test":
        return send2(testCmd)
      case "watch":
        return send2(buildCmd, watchCmd)
      case "ui":
        return send2(buildCmd, watchCmd, uiCmd)
    }
  }
}
function usageCmd(input, state2) {
  if (input !== usageCmd) return
  if (state2.cmd) return
  console.log("Welcome to LocalHack")
}
function buildCmd(input, state2) {
  if (input !== buildCmd) return
  const glob = "src/**/*.{html,ts,js,mjs,md,ohm}"
  return send2 => {
    if (state2.flags.watch) send2(watchCmd)
    if (state2.flags.dist) send2(distCmd)
    send2({ glob })
  }
}
function distCmd(input, state2) {
  if (input !== distCmd) return
  const dist2 = build("entries/*.{html,ts,js,mjs}")
  return send2 => {
    if (state2.flags.watch) send2(watchCmd)
    send2(bundling, { dist: dist2 })
  }
}
function testCmd(input) {
  if (input !== testCmd) return
  for (const arg of iter(args)) {
    import(build(arg))
  }
}
function uiCmd(input, state2) {
  if (input !== uiCmd) return
  return async send2 => {
    const child = execFile(
      electron2,
      [file(entry("electron.js")), "main.mjs"],
      err => {
        if (err) return console.error(err)
      },
    )
  }
}
function watchCmd(input, state2) {
  if (input !== watchCmd) return
  return send2 => {
    console.log(`Watching for changes...`)
    send2(watching)
  }
}
