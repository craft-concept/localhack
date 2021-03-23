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
var pre = (fn, ...parts) => (...args) => fn(...parts, ...args)

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
var standard = [stdin_default, config, alias]
var debugging = []

// .hack/build/plugins/windows.mjs
import electron2 from "electron"
import "path"

// .hack/build/lib/project.mjs
import { resolve, relative } from "path"
var root = (...paths) => resolve(process.cwd(), ...paths)
var src = pre(root, "src")
var entry = pre(src, "entries")
var local = pre(root, ".hack")
var build = pre(local, "build")
var dist = pre(root, "dist")

// .hack/build/plugins/windows.mjs
var { app, BrowserWindow } = electron2
var windows = send2 => {
  app.on("activate", onActivate)
  app.whenReady().then(onReady)
  function cleanup() {
    app.off("activate", onActivate)
  }
  return input => state2 => {
    var _a, _b, _c, _d, _e, _f, _g
    ;(_a = state2.appReady) != null ? _a : (state2.appReady = false)
    ;(_b = state2.windows) != null ? _b : (state2.windows = {})
    const { windows: windows22 } = state2
    ;(_c = windows22.index) != null ? _c : (windows22.index = new Map())
    ;(_d = windows22.queue) != null ? _d : (windows22.queue = [])
    if (input.appReady) state2.appReady = true
    if (input.windowClosedId) windows22.index.delete(input.windowClosedId)
    if (input.window) windows22.queue.push(input.window)
    if (!state2.appReady) return
    for (const id of (_e = input.closeWindows) != null ? _e : []) {
      ;(_f = state2.windows.index.get(id)) == null ? void 0 : _f.close()
    }
    let req
    while ((req = windows22.queue.pop())) {
      const win = new BrowserWindow({
        ...req.options,
        webPreferences: {
          ...((_g = req.options) == null ? void 0 : _g.webPreferences),
          preload: entry("preload.js"),
          worldSafeExecuteJavaScript: false,
          nodeIntegration: true,
          contextIsolation: false,
        },
      })
      win.loadFile(entry(req.src))
      if (req.openDevtools) win.webContents.openDevTools()
      const id = String(win.id)
      win.on("closed", () => send2({ windowClosedId: id }))
      state2.windows.index.set(id, { id, ...req })
    }
  }
  function onActivate() {
    send2({ appActivated: true })
  }
  function onReady() {
    send2({ appReady: true })
  }
}

// .hack/build/entries/main.mjs
var send = make()
send(standard, debugging, windows(send))
send({
  window: {
    src: "index.html",
    openDevtools: true,
    options: {},
  },
})
