#!/usr/bin/env node --no-warnings --experimental-loader=./.hack/build/src/entries/NodeLoader.mjs

// .hack/build/src/lib/Testing.mjs
import {strict, AssertionError} from "assert";
import chalk2 from "chalk";
var dot = chalk2.green("\u2713");
var cases = [];
var log = (x) => process.stdout.write(x);
var eq = (actual, expected, message) => {
  strict.deepEqual(actual, expected, message);
  log(dot);
};
var truthy = (actual, message) => {
  strict.ok(actual, message);
  log(dot);
};
var falsy = (actual, message) => {
  if (actual == null || actual === false) {
    log(dot);
  } else {
    strict.fail(message || "Expected falsy value");
  }
};
var throws = (err, fn) => {
  try {
    fn();
  } catch (e) {
    if (e instanceof err)
      return log(dot);
    throw e;
  }
  strict.fail(`Expected to throw ${err.name}`);
};
function test(subject, fn) {
  const filename = callingFilename();
  const entry2 = {filename, subject, fn};
  if (process.env.NODE_ENV == "test")
    runTest(entry2);
  else
    cases.push(entry2);
}
async function runAll() {
  log("\nRunning tests...\n\n");
  for (const entry2 of cases)
    await runTest(entry2);
  log("\nDone.\n");
}
var previousFilename = "";
async function runTest({filename, subject, fn}) {
  if (filename != previousFilename) {
    console.log("\n" + filename);
    previousFilename = filename;
  }
  log(`  ${chalk2.yellow(subject.name || subject)}: `);
  try {
    await fn({eq, throws, truthy, falsy});
    log("\n");
  } catch (err) {
    log(chalk2.red("\u2717"));
    if (err instanceof AssertionError) {
      console.error(chalk2.red("\n\nAssertion failed:\n=================\n"));
      console.error(err.message.replace(/(- expected)/, "\n$1"));
      console.error("\nBacktrace:");
      console.error(backtrace(err));
      console.error("");
    } else {
      console.error(chalk2.red("\n\nError thrown:\n=============\n"));
      console.error(err);
      console.error("\n\n");
    }
  }
}
Function.prototype.test = function testSelf(...inputs) {
  test(this, ...inputs);
  return this;
};
var backtrace = (err) => err.stack.split("\n").filter((line) => /^\s*at ./.test(line)).join("\n");
function* stackDetails(err) {
  const matches = err.stack.matchAll(/ +at.*[( ](?:\w+:\/\/)?(.+):(\d+):(\d+)/g);
  for (const [match2, path4, line, col] of matches) {
    const name = path4.replace(/^.*\/(build|src)\//, "");
    yield {
      name,
      path: path4,
      line: Number(line),
      col: Number(col)
    };
  }
}
function callingFilename() {
  const err = new Error();
  let current2;
  for (const {name} of stackDetails(err)) {
    current2 != null ? current2 : current2 = name;
    if (name !== current2)
      return name;
  }
}

// .hack/build/src/entries/cli.mjs
import commander22 from "commander";
import electron2 from "electron";
import {execFile, spawn as spawn2} from "child_process";
import Yaml6 from "yaml";

// .hack/build/src/cmd/build.mjs
import {program} from "commander";

// .hack/build/src/lib/Build.mjs
import fg from "fast-glob";
import fs from "fs/promises";
import {dirname} from "path";
import chalk23 from "chalk";

// .hack/build/src/lib/Testing.mjs
import {strict as strict2, AssertionError as AssertionError2} from "assert";
import chalk22 from "chalk";
var dot2 = chalk22.green("\u2713");
var cases2 = [];
var log2 = (x) => process.stdout.write(x);
var eq2 = (actual, expected, message) => {
  strict2.deepEqual(actual, expected, message);
  log2(dot2);
};
var truthy2 = (actual, message) => {
  strict2.ok(actual, message);
  log2(dot2);
};
var falsy2 = (actual, message) => {
  if (actual == null || actual === false) {
    log2(dot2);
  } else {
    strict2.fail(message || "Expected falsy value");
  }
};
var throws2 = (err, fn) => {
  try {
    fn();
  } catch (e) {
    if (e instanceof err)
      return log2(dot2);
    throw e;
  }
  strict2.fail(`Expected to throw ${err.name}`);
};
function test2(subject, fn) {
  const filename = callingFilename2();
  const entry2 = {filename, subject, fn};
  if (process.env.NODE_ENV == "test")
    runTest2(entry2);
  else
    cases2.push(entry2);
}
var previousFilename2 = "";
async function runTest2({filename, subject, fn}) {
  if (filename != previousFilename2) {
    console.log("\n" + filename);
    previousFilename2 = filename;
  }
  log2(`  ${chalk22.yellow(subject.name || subject)}: `);
  try {
    await fn({eq: eq2, throws: throws2, truthy: truthy2, falsy: falsy2});
    log2("\n");
  } catch (err) {
    log2(chalk22.red("\u2717"));
    if (err instanceof AssertionError2) {
      console.error(chalk22.red("\n\nAssertion failed:\n=================\n"));
      console.error(err.message.replace(/(- expected)/, "\n$1"));
      console.error("\nBacktrace:");
      console.error(backtrace2(err));
      console.error("");
    } else {
      console.error(chalk22.red("\n\nError thrown:\n=============\n"));
      console.error(err);
      console.error("\n\n");
    }
  }
}
Function.prototype.test = function testSelf2(...inputs) {
  test2(this, ...inputs);
  return this;
};
var backtrace2 = (err) => err.stack.split("\n").filter((line) => /^\s*at ./.test(line)).join("\n");
function* stackDetails2(err) {
  const matches = err.stack.matchAll(/ +at.*[( ](?:\w+:\/\/)?(.+):(\d+):(\d+)/g);
  for (const [match2, path4, line, col] of matches) {
    const name = path4.replace(/^.*\/(build|src)\//, "");
    yield {
      name,
      path: path4,
      line: Number(line),
      col: Number(col)
    };
  }
}
function callingFilename2() {
  const err = new Error();
  let current2;
  for (const {name} of stackDetails2(err)) {
    current2 != null ? current2 : current2 = name;
    if (name !== current2)
      return name;
  }
}

// .hack/build/src/lib/edit.mjs
import {
  produce as produce2,
  isDraft as isDraft2,
  current as currentIm2,
  original as originalIm2
} from "immer";

// .hack/build/src/lib/reify.mjs
var isObj = (obj) => obj != null && typeof obj === "object" && Object.getPrototypeOf(obj) === Object.prototype;
var T = {
  Number: (x) => Number(One(x)),
  String: (x) => String(One(x)),
  Boolean: (x) => Boolean(One(x)),
  Set: (x) => x instanceof Set ? x : new Set(T.Iterable(x)),
  Array: (x) => Array.isArray(x) ? x : [...T.Iterable(x)],
  Object: (x) => {
    if (x == null)
      return {};
    if (isObj(x))
      return x;
    return {};
  },
  Iterable: (x) => {
    if (x == null)
      return [];
    if (x instanceof Map)
      return x.keys();
    if (typeof x === "object" && Symbol.iterator in x)
      return x;
    return [x];
  },
  One: (x) => {
    for (const v of T.Iterable(x)) {
      return v;
    }
  }
};

// .hack/build/src/lib/edit.mjs
import {
  produce,
  isDraft,
  current as currentIm,
  original as originalIm
} from "immer";
var reify2 = (desc) => (state) => {
  for (const [k, as] of entries(desc)) {
    state[k] = as(state[k]);
  }
  return state;
};
test2(reify2, ({eq: eq3}) => {
  const state = {
    number: 12,
    string: "something"
  };
  eq3(reify2({
    number: T.Array,
    string: T.Set
  })(state), {
    number: [12],
    string: new Set(["something"])
  });
});
function edit(objOrFn, fn = void 0) {
  if (!fn)
    return (obj) => edit(obj, objOrFn);
  return produce(objOrFn, (draft) => {
    fn(draft);
  });
}
var DRAFT_STATE = Symbol.for("immer-state");
var draftState = (input) => input[DRAFT_STATE];
var isModified = (input) => {
  var _a6;
  return (_a6 = draftState(input)) == null ? void 0 : _a6.modified_;
};
test2(isModified, ({eq: eq3}) => {
  produce({test: {a: 1}}, (obj) => {
    eq3(isModified(obj), false);
    eq3(isModified(obj.test), false);
    obj.test.a = 2;
    eq3(isModified(obj), true);
    eq3(isModified(obj.test), true);
  });
});
function deepAssign(target, ...sources) {
  for (const source2 of sources)
    for (const k of keys(source2))
      if (typeof target[k] === "object" && typeof source2[k] === "object") {
        deepAssign(target[k], source2[k]);
      } else {
        target[k] = source2[k];
      }
  return target;
}
test2(deepAssign, ({eq: eq3}) => {
  const source2 = {a: {b: 2}};
  eq3(deepAssign({a: 1, c: 3}, source2), {a: {b: 2}, c: 3});
});

// .hack/build/src/lib/Enum.mjs
var _a;
var _b;
var _c;
var _d;
var _e;
function* iter(x) {
  if (x == null)
    return;
  if (x instanceof Map)
    x = x.values();
  if (typeof x == "object" && Symbol.iterator in x) {
    let returns = [];
    for (const xa of x)
      returns.push(yield* iter(xa));
    return returns;
  } else {
    return [yield x];
  }
}
(_a = iter.test) == null ? void 0 : _a.call(iter, ({eq: eq3}) => {
  eq3([...iter()], []);
  eq3([...iter(null)], []);
  eq3([...iter(void 0)], []);
  eq3([...iter(1)], [1]);
  eq3([...iter([1])], [1]);
  eq3([...iter([1, [2, 3], 4])], [1, 2, 3, 4]);
  eq3([
    ...iter(new Map([
      ["1", 1],
      ["2", 2]
    ]))
  ], [1, 2]);
});
function* withNext(iterable) {
  let it = iter(iterable), val, res, next = (v) => val = v;
  do {
    res = it.next(val);
    yield [res, next];
  } while (res.done === false);
}
(_b = withNext.test) == null ? void 0 : _b.call(withNext, ({eq: eq3}) => {
});
function isEmpty(x) {
  for (const _ of iter(x))
    return false;
  return true;
}
(_c = isEmpty.test) == null ? void 0 : _c.call(isEmpty, ({eq: eq3}) => {
  eq3(isEmpty(null), true);
  eq3(isEmpty([]), true);
  eq3(isEmpty([1]), false);
  eq3(isEmpty(1), false);
});
function* keys(obj) {
  if (isObj(obj))
    for (const k in obj)
      yield k;
}
function* entries(obj) {
  if (isObj(obj))
    for (const k in obj)
      yield [k, obj[k]];
}
var iterMap = (fn) => function* iterMap22(...xs) {
  for (const v of iter(xs))
    yield* iter(fn(v));
};
(_d = iterMap.test) == null ? void 0 : _d.call(iterMap, ({eq: eq3}) => {
  const inc = (x) => x + 1;
  const evenOnly = (x) => x % 2 === 0 ? x : null;
  const incs = iterMap(inc);
  const evens = iterMap(evenOnly);
  eq3([...incs()], []);
  eq3([...incs([])], []);
  eq3([...incs(null)], []);
  eq3([...incs(void 0)], []);
  eq3([...incs(1, 2, [3, [4]], 5)], [2, 3, 4, 5, 6]);
  eq3([...incs(null, void 0, 1)], [2]);
  eq3([...evens(1, 2, [3, [4]], 5)], [2, 4]);
});
var Enum2 = class {
  static of(...values22) {
    return new Enum2(() => iter(values22));
  }
  static gen(generator) {
    return new Enum2(generator);
  }
  static get empty() {
    return Enum2.of();
  }
  constructor(fn) {
    this.iter = fn;
  }
  *[Symbol.iterator]() {
    yield* this.iter();
  }
  gen(fn) {
    return Enum2.gen(() => fn(this));
  }
  chain(fn) {
    return this.gen(function* chained(xs) {
      for (const x of xs)
        yield* iter(fn(x));
    });
  }
  flatMap(fn) {
    return this.chain(fn);
  }
  edit(fn) {
    return this.map(edit(fn));
  }
  map(fn) {
    return this.gen(function* mapped(xs) {
      for (const x of xs)
        yield fn(x);
    });
  }
  selectMap(fn) {
    return this.gen(function* selectMapped(xs) {
      for (const x of xs) {
        const res = fn(x);
        if (res != null)
          yield res;
      }
    });
  }
  filter(fn) {
    return this.select(fn);
  }
  select(fn = (x) => x != null) {
    return this.gen(function* selected(xs) {
      for (const x of xs)
        if (fn(x))
          yield x;
    });
  }
  reject(fn) {
    return this.gen(function* rejected(xs) {
      for (const x of xs)
        if (!fn(x))
          yield x;
    });
  }
  between(value) {
    return this.gen(function* betweenMapped(xs) {
      let first = true;
      for (const x of xs)
        if (first) {
          yield x;
          first = false;
        } else {
          yield value;
          yield x;
        }
    });
  }
  partition(fn) {
    return [this.select(fn), this.reject(fn)];
  }
  each(fn) {
    for (const x of this)
      fn(x);
    return this;
  }
  forEach(fn) {
    return this.each(fn);
  }
  join(sep = "") {
    return this.array.join(sep);
  }
  else(fn) {
    if (this.isEmpty)
      return fn();
    return this;
  }
  get isEmpty() {
    for (const _ of this)
      return false;
    return true;
  }
  get first() {
    const [x] = this;
    return x;
  }
  get array() {
    var _a22;
    return (_a22 = this._array) != null ? _a22 : this._array = [...this];
  }
  get set() {
    var _a22;
    return (_a22 = this._set) != null ? _a22 : this._set = new Set(this);
  }
};
(_e = Enum2.test) == null ? void 0 : _e.call(Enum2, ({eq: eq3}) => {
  const inc = (x) => x + 1;
  const dup = (x) => [x, x];
  const en = Enum2.of(1, 2, 3);
  const en2 = Enum2.of(en);
  eq3([...en], [1, 2, 3]);
  eq3([...en2], [1, 2, 3]);
  eq3(en.first, 1);
  eq3(en2.first, 1);
  eq3(en.array, [1, 2, 3]);
  eq3(en2.array, [1, 2, 3]);
  eq3(en.map(inc).array, [2, 3, 4]);
  eq3(en2.map(inc).array, [2, 3, 4]);
  eq3(en.map(dup).array, [
    [1, 1],
    [2, 2],
    [3, 3]
  ]);
  eq3(en2.map(dup).array, [
    [1, 1],
    [2, 2],
    [3, 3]
  ]);
  eq3(en.chain(dup).array, [1, 1, 2, 2, 3, 3]);
  eq3(en2.chain(dup).array, [1, 1, 2, 2, 3, 3]);
  eq3(en.set, new Set([1, 2, 3]));
  eq3(en2.set, new Set([1, 2, 3]));
  en.join.test(() => {
    eq3(en.join(), "123");
  });
  en.between.test(() => {
    eq3(en.between(0).array, [1, 0, 2, 0, 3]);
  });
  en.select.test(() => {
    const isOdd = (x) => x % 2;
    eq3(en.select(isOdd).array, [1, 3]);
    eq3(en2.select(isOdd).array, [1, 3]);
    eq3(en.filter(isOdd).array, [1, 3]);
    eq3(en.map(inc).reject(isOdd).array, [2, 4]);
  });
});

// .hack/build/src/lib/edit.mjs
var reify22 = (desc) => (state) => {
  for (const [k, as] of entries(desc)) {
    state[k] = as(state[k]);
  }
  return state;
};
test2(reify22, ({eq: eq3}) => {
  const state = {
    number: 12,
    string: "something"
  };
  eq3(reify22({
    number: T.Array,
    string: T.Set
  })(state), {
    number: [12],
    string: new Set(["something"])
  });
});
var DRAFT_STATE2 = Symbol.for("immer-state");
var draftState2 = (input) => input[DRAFT_STATE2];
var isModified2 = (input) => {
  var _a6;
  return (_a6 = draftState2(input)) == null ? void 0 : _a6.modified_;
};
test2(isModified2, ({eq: eq3}) => {
  produce2({test: {a: 1}}, (obj) => {
    eq3(isModified2(obj), false);
    eq3(isModified2(obj.test), false);
    obj.test.a = 2;
    eq3(isModified2(obj), true);
    eq3(isModified2(obj.test), true);
  });
});
function deepAssign2(target, ...sources) {
  for (const source2 of sources)
    for (const k of keys(source2))
      if (typeof target[k] === "object" && typeof source2[k] === "object") {
        deepAssign2(target[k], source2[k]);
      } else {
        target[k] = source2[k];
      }
  return target;
}
test2(deepAssign2, ({eq: eq3}) => {
  const source2 = {a: {b: 2}};
  eq3(deepAssign2({a: 1, c: 3}, source2), {a: {b: 2}, c: 3});
});

// .hack/build/src/lib/Enum.mjs
var _a2;
var _b2;
var _c2;
var _d2;
var _e2;
function* iter2(x) {
  if (x == null)
    return;
  if (x instanceof Map)
    x = x.values();
  if (typeof x == "object" && Symbol.iterator in x) {
    let returns = [];
    for (const xa of x)
      returns.push(yield* iter2(xa));
    return returns;
  } else {
    return [yield x];
  }
}
(_a2 = iter2.test) == null ? void 0 : _a2.call(iter2, ({eq: eq3}) => {
  eq3([...iter2()], []);
  eq3([...iter2(null)], []);
  eq3([...iter2(void 0)], []);
  eq3([...iter2(1)], [1]);
  eq3([...iter2([1])], [1]);
  eq3([...iter2([1, [2, 3], 4])], [1, 2, 3, 4]);
  eq3([
    ...iter2(new Map([
      ["1", 1],
      ["2", 2]
    ]))
  ], [1, 2]);
});
function* withNext2(iterable) {
  let it = iter2(iterable), val, res, next = (v) => val = v;
  do {
    res = it.next(val);
    yield [res, next];
  } while (res.done === false);
}
(_b2 = withNext2.test) == null ? void 0 : _b2.call(withNext2, ({eq: eq3}) => {
});
function isEmpty2(x) {
  for (const _ of iter2(x))
    return false;
  return true;
}
(_c2 = isEmpty2.test) == null ? void 0 : _c2.call(isEmpty2, ({eq: eq3}) => {
  eq3(isEmpty2(null), true);
  eq3(isEmpty2([]), true);
  eq3(isEmpty2([1]), false);
  eq3(isEmpty2(1), false);
});
function* entries2(obj) {
  if (isObj(obj))
    for (const k in obj)
      yield [k, obj[k]];
}
var iterMap2 = (fn) => function* iterMap22(...xs) {
  for (const v of iter2(xs))
    yield* iter2(fn(v));
};
(_d2 = iterMap2.test) == null ? void 0 : _d2.call(iterMap2, ({eq: eq3}) => {
  const inc = (x) => x + 1;
  const evenOnly = (x) => x % 2 === 0 ? x : null;
  const incs = iterMap2(inc);
  const evens = iterMap2(evenOnly);
  eq3([...incs()], []);
  eq3([...incs([])], []);
  eq3([...incs(null)], []);
  eq3([...incs(void 0)], []);
  eq3([...incs(1, 2, [3, [4]], 5)], [2, 3, 4, 5, 6]);
  eq3([...incs(null, void 0, 1)], [2]);
  eq3([...evens(1, 2, [3, [4]], 5)], [2, 4]);
});
var Enum4 = class {
  static of(...values22) {
    return new Enum4(() => iter2(values22));
  }
  static gen(generator) {
    return new Enum4(generator);
  }
  static get empty() {
    return Enum4.of();
  }
  constructor(fn) {
    this.iter = fn;
  }
  *[Symbol.iterator]() {
    yield* this.iter();
  }
  gen(fn) {
    return Enum4.gen(() => fn(this));
  }
  chain(fn) {
    return this.gen(function* chained(xs) {
      for (const x of xs)
        yield* iter2(fn(x));
    });
  }
  flatMap(fn) {
    return this.chain(fn);
  }
  edit(fn) {
    return this.map(edit(fn));
  }
  map(fn) {
    return this.gen(function* mapped(xs) {
      for (const x of xs)
        yield fn(x);
    });
  }
  selectMap(fn) {
    return this.gen(function* selectMapped(xs) {
      for (const x of xs) {
        const res = fn(x);
        if (res != null)
          yield res;
      }
    });
  }
  filter(fn) {
    return this.select(fn);
  }
  select(fn = (x) => x != null) {
    return this.gen(function* selected(xs) {
      for (const x of xs)
        if (fn(x))
          yield x;
    });
  }
  reject(fn) {
    return this.gen(function* rejected(xs) {
      for (const x of xs)
        if (!fn(x))
          yield x;
    });
  }
  between(value) {
    return this.gen(function* betweenMapped(xs) {
      let first = true;
      for (const x of xs)
        if (first) {
          yield x;
          first = false;
        } else {
          yield value;
          yield x;
        }
    });
  }
  partition(fn) {
    return [this.select(fn), this.reject(fn)];
  }
  each(fn) {
    for (const x of this)
      fn(x);
    return this;
  }
  forEach(fn) {
    return this.each(fn);
  }
  join(sep = "") {
    return this.array.join(sep);
  }
  else(fn) {
    if (this.isEmpty)
      return fn();
    return this;
  }
  get isEmpty() {
    for (const _ of this)
      return false;
    return true;
  }
  get first() {
    const [x] = this;
    return x;
  }
  get array() {
    var _a22;
    return (_a22 = this._array) != null ? _a22 : this._array = [...this];
  }
  get set() {
    var _a22;
    return (_a22 = this._set) != null ? _a22 : this._set = new Set(this);
  }
};
(_e2 = Enum4.test) == null ? void 0 : _e2.call(Enum4, ({eq: eq3}) => {
  const inc = (x) => x + 1;
  const dup = (x) => [x, x];
  const en = Enum4.of(1, 2, 3);
  const en2 = Enum4.of(en);
  eq3([...en], [1, 2, 3]);
  eq3([...en2], [1, 2, 3]);
  eq3(en.first, 1);
  eq3(en2.first, 1);
  eq3(en.array, [1, 2, 3]);
  eq3(en2.array, [1, 2, 3]);
  eq3(en.map(inc).array, [2, 3, 4]);
  eq3(en2.map(inc).array, [2, 3, 4]);
  eq3(en.map(dup).array, [
    [1, 1],
    [2, 2],
    [3, 3]
  ]);
  eq3(en2.map(dup).array, [
    [1, 1],
    [2, 2],
    [3, 3]
  ]);
  eq3(en.chain(dup).array, [1, 1, 2, 2, 3, 3]);
  eq3(en2.chain(dup).array, [1, 1, 2, 2, 3, 3]);
  eq3(en.set, new Set([1, 2, 3]));
  eq3(en2.set, new Set([1, 2, 3]));
  en.join.test(() => {
    eq3(en.join(), "123");
  });
  en.between.test(() => {
    eq3(en.between(0).array, [1, 0, 2, 0, 3]);
  });
  en.select.test(() => {
    const isOdd = (x) => x % 2;
    eq3(en.select(isOdd).array, [1, 3]);
    eq3(en2.select(isOdd).array, [1, 3]);
    eq3(en.filter(isOdd).array, [1, 3]);
    eq3(en.map(inc).reject(isOdd).array, [2, 4]);
  });
});

// .hack/build/src/lib/Future.mjs
var _a3;
var Future = class {
  static of(fn) {
    return new this(fn);
  }
  constructor(execute) {
    this.watchers = [];
    this.execute = execute;
  }
  get promise() {
    if (this._promise)
      return this._promise;
    this._promise = Promise.resolve(this.execute());
    for (const fn in this.watchers)
      this.watch(fn);
    this.watchers = [];
    return this._promise;
  }
  then(thenFn, catchFn2) {
    return this.promise.then(thenFn, catchFn2);
  }
  catch(fn) {
    return this.promise.catch(void 0, catchFn);
  }
  watch(fn) {
    var _a22;
    ((_a22 = this._promise) == null ? void 0 : _a22.then(fn)) || this.watchers.push(fn);
  }
};
(_a3 = Future.test) == null ? void 0 : _a3.call(Future, async ({eq: eq3}) => {
  let executeCount = 0;
  const a = Future.of(() => executeCount++);
  await a;
  eq3(executeCount, 1);
  await a;
  eq3(executeCount, 1);
});

// .hack/build/src/lib/Compile.mjs
import Esbuild from "esbuild";
import {extname} from "path";

// .hack/build/src/lib/Literate.mjs
import md from "@textlint/markdown-to-ast";
var Literate = class {
  static parse(source2) {
    return md.parse(source2);
  }
  static *tangle(source2, {path: path4}) {
    var _a6, _b5;
    let doc = this.parse(source2);
    let code = {};
    for (let node of doc.children) {
      if (node.type != "CodeBlock")
        continue;
      if (!node.lang)
        continue;
      (_b5 = code[_a6 = node.lang]) != null ? _b5 : code[_a6] = [];
      code[node.lang].push(node.value);
    }
    for (const [ext, blocks] of entries2(code)) {
      yield {
        path: path4.replace(/\.md$/, "." + ext),
        source: blocks.join("\n\n")
      };
    }
    return (send) => {
      for (const [ext, blocks] of entries2(code)) {
        send({
          virtual: true,
          path: path4.replace(/\.md$/, "." + ext),
          text: blocks.join("\n\n")
        });
      }
    };
  }
};

// .hack/build/src/lib/Compile.mjs
var Compile = class {
  static *module(source2, {path: path22}) {
    const ext = extname(path22);
    switch (ext) {
      case ".json":
        yield this.copy(source2, {path: path22});
        yield this.json(source2, {path: path22});
        return;
      case ".yml":
        yield this.copy(source2, {path: path22});
        yield this.yml(source2, {path: path22});
        return;
      case ".mjs":
      case ".js":
        yield this.js(source2, {path: path22});
        return;
      case ".mjsx":
      case ".jsx":
        yield this.jsx(source2, {path: path22});
        return;
      case ".ts":
      case ".tsx":
        yield this.ts(source2, {path: path22});
        return;
      case ".md":
        yield this.copy(source2, {path: path22});
        yield* this.md(source2, {path: path22});
        return;
      case ".html":
      case ".ohm":
        yield this.copy(source2, {path: path22});
        return;
      default:
        throw new Error(`Cannot compile ${ext}`);
    }
  }
  static async js(source2, {path: path22}) {
    const {code} = await Esbuild.transform(source2, {
      sourcefile: path22,
      target: "node12",
      format: "esm"
    });
    return {path: path22, source: source2, compiled: code};
  }
  static async jsx(source2, {path: path22}) {
    const {code} = await Esbuild.transform(source2, {
      loader: "jsx",
      sourcefile: path22,
      target: "node12",
      format: "esm"
    });
    return {path: path22, source: source2, compiled: code};
  }
  static async ts(source2, {path: path22}) {
    const {code} = await Esbuild.transform(source2, {
      loader: "ts",
      sourcefile: path22,
      target: "node12",
      format: "esm"
    });
    return {path: path22, source: source2, compiled: code};
  }
  static yml(source2, {path: path22}) {
    const compiled = `import Yaml from "yaml"

export const path = "${path22}"
export const source = ${JSON.stringify(source2)}
export default Yaml.parse(source)
`;
    return {source: source2, compiled, path: path22 + ".mjs"};
  }
  static json(source2, {path: path22}) {
    const compiled = `export const path = "${path22}"
export const source = ${JSON.stringify(source2)}
export default JSON.parse(source)
`;
    return {source: source2, compiled, path: path22 + ".mjs"};
  }
  static *md(source2, {path: path22}) {
    for (let mod of Literate.tangle(source2, {path: path22})) {
      yield* this.module(mod.source, {path: mod.path});
    }
  }
  static copy(source2, {path: path22}) {
    return {source: source2, compiled: source2, path: path22};
  }
};

// .hack/build/src/lib/Project.mjs
import {resolve, relative} from "path";

// .hack/build/src/lib/fns.mjs
function makeFn(fn, {name, ...props}) {
  const fn2 = copyFn(fn, name);
  return Object.assign(fn2, props);
}
function copyFn(fn, name = fn.name) {
  const clone = function cloned(...args) {
    return fn.apply(this, args);
  };
  Object.defineProperty(clone, "name", {value: name});
  return Object.assign(clone, fn);
}
var pre = (fn, ...parts) => (...args) => fn(...parts, ...args);

// .hack/build/src/lib/Project.mjs
var root = (...paths) => resolve(process.cwd(), ...paths);
var src = pre(root, "src");
var entry = pre(src, "entries");
var local = pre(root, ".hack");
var build = pre(local, "build");
var dist = pre(root, "dist");
var file = (path22) => relative(root(), path22);

// .hack/build/src/lib/Build.mjs
var Build = class {
  static project() {
    return this.all("hack.yml", "src/**/*");
  }
  static async all(...globs) {
    for (let glob of iter2(globs)) {
      let paths = fg.stream(root(glob), {
        dot: true,
        absolute: true
      });
      let prom = [];
      for await (let path22 of paths) {
        prom.push(this.file(file(path22)));
      }
      await Promise.all(prom);
    }
  }
  static async file(path22) {
    let source2 = String(await fs.readFile(root(path22)));
    let mods = Compile.module(source2, {path: path22});
    for (let modP of mods)
      this.write(await modP);
  }
  static async write({path: path22, compiled}) {
    let buildPath = build(path22).replace(/\/Readme(\.[.\w]+)$/, "$1");
    let mode = compiled.slice(0, 2) == "#!" ? 493 : 420;
    let fullPath = root(buildPath);
    await fs.mkdir(dirname(fullPath), {recursive: true});
    await fs.writeFile(fullPath, compiled, {mode});
    console.log(`${chalk23.green("Wrote")}: ${path22}`);
  }
};

// .hack/build/src/cmd/build.mjs
program.command("build").description("Build the files in the current project.").action(main);
async function main() {
  try {
    await Build.project();
  } catch (err) {
    console.error(err);
  }
}

// .hack/build/src/cmd/watch.mjs
import {program as program2} from "commander";
import fs22 from "fs";

// .hack/build/src/lib/patterns.mjs
var T3 = {
  Any: {__type: "any"},
  Nil: {__type: "nil"},
  Null: {__type: "null"},
  Undefined: {__type: "undefined"},
  String: {__type: "string"},
  Number: {__type: "number"},
  Boolean: {__type: "boolean"},
  Tup: (...rest) => rest,
  Array: (item) => [item],
  OneOf: (...opts) => ({__type: "OneOf", opts}),
  Many: (item) => T3.OneOf(item, T3.Array(item)),
  Enum: (item) => T3.OneOf(item, T3.Iterable(item)),
  Function: (...inputs) => ({
    __type: "function",
    inputs
  }),
  Maybe: (item) => T3.OneOf(T3.Nil, item),
  Iterable: (pattern) => ({__type: "iterable", pattern}),
  Ask: (pattern) => ({__type: "pattern", pattern}),
  Quote: (pattern) => ({__type: "pattern", pattern}),
  Pattern: (pattern) => ({__type: "pattern", pattern}),
  Rest: (pattern) => ({__type: "rest", pattern}),
  Var: (name, pattern = T3.Any) => ({
    __type: "var",
    name,
    pattern
  })
};
function reify7(pattern) {
  switch (pattern) {
    case Number:
      return T3.Number;
    case String:
      return T3.String;
    case Boolean:
      return T3.Boolean;
    case Function:
      return T3.Function(...pattern.inputs || [T3.Any]);
    default:
      return pattern;
  }
}
function matchInputs(fn2, inputs) {
  if (!fn2.inputs)
    return;
  return match(fn2.inputs)(inputs);
}
function matchAll(pattern, ...datas) {
  for (let data of datas) {
    if (!match(pattern, data))
      return false;
  }
  return true;
}
function match(pattern, data = void 0) {
  if (data !== void 0)
    return match(pattern)(data);
  if (pattern === null)
    return (data2) => data2 === null;
  pattern = reify7(pattern);
  if (isType(pattern))
    return matchType(pattern);
  switch (typeof pattern) {
    case "string":
    case "number":
    case "boolean":
      return (data2) => data2 === pattern;
    case "object":
      return Array.isArray(pattern) ? matchArray(pattern) : matchObject(pattern);
    case "function":
      return (data2) => pattern(data2);
  }
  throw new Error(`Unimplemented pattern: ${pattern}.`);
}
function isType(pattern) {
  return pattern && typeof pattern === "object" && "__type" in pattern;
}
var matchObject = (pattern) => {
  if (pattern instanceof RegExp)
    return matchRegex(pattern);
  return (data) => {
    if (typeof data !== "object")
      return;
    if (data == null)
      return;
    for (const key in pattern) {
      if (!(key in data))
        return;
      if (!match(pattern[key])(data[key]))
        return;
    }
    return true;
  };
};
var matchArray = (pattern) => (data) => {
  if (!Array.isArray(pattern))
    return;
  if (typeof data !== "object")
    return;
  for (let i = 0; i < pattern.length; i++) {
    if (!match(pattern[i])(data[i]))
      return;
  }
  return true;
};
var matchRegex = (pattern) => (data) => {
  return typeof data == "string" && pattern.test(data);
};
var deepEqual = (a) => (b) => {
  if (a === b)
    return true;
  if (typeof a !== typeof b)
    return;
  if (typeof a !== "object")
    return;
  for (const key in a) {
    if (!(key in b))
      return;
    if (!deepEqual(a[key])(b[key]))
      return;
  }
  return true;
};
function matchType(pattern) {
  switch (pattern.__type) {
    case "any":
      return (_data) => true;
    case "nil":
      return (data) => data == null;
    case "null":
      return (data) => data === null;
    case "var":
      return match(pattern.pattern);
    case "pattern":
      return deepEqual(pattern.pattern);
    case "iterable":
      throw new Error(`Not yet sure how to implement iterable pattern matching`);
    default:
      return (data) => pattern.__type === typeof data;
  }
}
test2(match, async ({truthy: truthy3, falsy: falsy3}) => {
  let {inspect} = await import("util");
  const matches = (p, v) => truthy3(match(p)(v), `Expected: matches(${p}, ${inspect(v)})`);
  const noMatch = (p, v) => falsy3(match(p)(v), `Expected: noMatch(${p}, ${inspect(v)})`);
  matches(T3.Any, 1234);
  matches(T3.Any, "hi");
  matches(T3.Any, {x: 1});
  matches({}, {});
  matches({}, {x: 1});
  noMatch({}, null);
  noMatch(null, {});
  matches(Number, 1234);
  noMatch(Number, "no");
  matches(T3.Number, 1234);
  noMatch(T3.Number, "no");
  matches(String, "hi");
  matches(T3.String, "hi");
  noMatch(T3.String, 1234);
  matches(Boolean, true);
  matches(T3.Boolean, true);
  matches(T3.Boolean, false);
  noMatch(T3.Boolean, 1234);
  matches("hi", "hi");
  noMatch("hi", "no");
  matches(T3.Pattern(T3.Number), T3.Number);
  noMatch(T3.Pattern(T3.Number), T3.String);
  noMatch(T3.Pattern(T3.Number), 1234);
  matches(T3.Pattern(1), 1);
  matches(/bc/, "abcd");
  noMatch(/bc/, "def");
});
guard(guard, [T3.Function(), [T3.Any]]);
function guard(fn2, inputs) {
  fn2.inputs = inputs;
  fn2.with = makeFn(guardedCall, {
    name: `guarded_${fn2.name || "anonymous"}`
  });
  fn2.ensure = makeFn(guardedThrowCall, {
    name: `guarded_throw_${fn2.name || "anonymous"}`
  });
  return fn2.with;
  function guardedCall(...inputs2) {
    const ctx = matchInputs(fn2, inputs2);
    return ctx ? fn2(...inputs2) : null;
  }
  function guardedThrowCall(...inputs2) {
    const ctx = matchInputs(fn2, inputs2);
    if (!ctx)
      throw new TypeError(`Invalid inputs: ${inputs2}.`);
    return fn2(...inputs2);
  }
}
test2(guard, ({eq: eq3, throws: throws3}) => {
  guard(add, [Number, Number]);
  function add(a, b) {
    return a + b;
  }
  eq3(add(1, 2), 3);
  eq3(add.with(1, 2), 3);
  eq3(add.with(1, 2, 9), 3);
  eq3(add.with("hi", 2), null);
  eq3(add.with(1, "hi"), null);
  throws3(TypeError, () => add.ensure("", 1));
});

// .hack/build/src/lib/fns.mjs
function fnWith({name, ...props}, fn) {
  Object.defineProperty(fn, "name", {value: name || fn.name});
  return Object.assign(fn, props);
}

// .hack/build/src/lib/Translate.mjs
import Yaml from "yaml";
var __defProp = Object.defineProperty;
var __publicField = (obj, key, value) => {
  if (typeof key !== "symbol")
    key += "";
  if (key in obj)
    return __defProp(obj, key, {enumerable: true, configurable: true, writable: true, value});
  return obj[key] = value;
};
var Translate = class {
  static shape(type, pattern) {
    var _a6, _b5;
    this.define(type);
    (_b5 = (_a6 = this.shapes)[type]) != null ? _b5 : _a6[type] = [];
    if (!this.shapes[type].includes(pattern))
      this.shapes[type].push(pattern);
    return this;
  }
  static register(type, pattern, fn) {
    this.define(type);
    if (!fn)
      return new Translator(type);
    return this.add(type, [pattern], fn);
  }
  static add(type, inputs, fn) {
    var _a6, _b5;
    fn = fnWith({inputs, name: fn.name || `unnamed_${type}`}, fn);
    (_b5 = (_a6 = this.registry)[type]) != null ? _b5 : _a6[type] = [];
    this.registry[type].unshift(fn);
    return this;
  }
  static to(type, ...inputs) {
    var _a6, _b5;
    (_b5 = (_a6 = this.registry)[type]) != null ? _b5 : _a6[type] = [];
    return Enum4.gen(function* translations() {
      for (const fn of this.registry[type]) {
        if (matchInputs(fn, inputs)) {
          const res = fn(...inputs);
          if (res != null)
            yield res;
        }
      }
    }.bind(this));
  }
  static define(name) {
    if (this[name])
      return;
    this[name] = fnWith({name}, (item, ...rest) => this.to(name, item, ...rest));
  }
};
__publicField(Translate, "registry", {});
__publicField(Translate, "shapes", {});
var Translator = class {
  constructor(type) {
    this.type = type;
  }
  accepts(...inputs) {
    this._accepts = inputs;
    return this;
  }
  then(fn) {
    this._fn = fn;
    Translate.add(this.type, this._accepts[0], fn);
    return this;
  }
};

// .hack/build/src/cmd/watch.mjs
program2.command("watch").description("Build files that change.").action(main2);
var watcher;
async function main2() {
  try {
    console.log("Watching...");
    watcher = fs22.watch(src(), {recursive: true, persistent: true}, async (event, relativePath) => {
      let path4 = file(src(relativePath));
      await Build.file(path4);
    });
  } catch (err) {
    console.error(err);
  }
}

// .hack/build/src/cmd/dist.mjs
import {program as program3} from "commander";

// .hack/build/src/lib/Bundle.mjs
import fg2 from "fast-glob";
import Esbuild2 from "esbuild";

// .hack/build/src/lib/Resolution.mjs
import fs3 from "fs/promises";
var _a4;
var _b3;
function* facetsFor(name) {
  if (/\.m?js$/.test(name))
    return name;
  yield `${name}.mjs`;
  yield `${name}/Readme.mjs`;
  yield `${name}/index.mjs`;
}
(_a4 = facetsFor.test) == null ? void 0 : _a4.call(facetsFor, ({eq: eq3}) => {
  eq3([...facetsFor("lib/Resolution")], ["lib/Resolution.mjs", "lib/Res"]);
});
var defaultRoots = [
  join(process.cwd(), ".hack/build"),
  join(process.cwd(), ".hack/build/src")
];
function* pathsFor(name, from, ...roots) {
  if (isRelative(name)) {
    yield* facetsFor(join(from, name));
    return;
  }
  for (const root2 of [...roots, ...defaultRoots]) {
    yield* facetsFor(join(root2, name));
  }
}
(_b3 = pathsFor.test) == null ? void 0 : _b3.call(pathsFor, ({eq: eq3}) => {
  eq3([...pathsFor("lib/Resolution")], ["lib/Resolution"]);
});
async function realPathFor(name, from, ...roots) {
  for (const path4 of pathsFor(name, from, ...roots)) {
    try {
      await fs3.access(path4);
      return path4;
    } catch (e) {
    }
  }
}
async function isPackage(name) {
  try {
    await fs3.access(join(process.cwd(), "node_modules", name));
    return true;
  } catch (e) {
    return false;
  }
}
function join(...parts) {
  return parts.join("/").replace(/\/+/g, "/");
}
function isRelative(path4) {
  return /^\.\.?\//.test(path4);
}

// .hack/build/src/lib/Bundle.mjs
var __defProp2 = Object.defineProperty;
var __publicField2 = (obj, key, value) => {
  if (typeof key !== "symbol")
    key += "";
  if (key in obj)
    return __defProp2(obj, key, {enumerable: true, configurable: true, writable: true, value});
  return obj[key] = value;
};
var Bundle = class {
  static project() {
    return this.all(".hack/build/src/entries/**/*.{mjs,js,ts,jsx,tsx,mjsx}");
  }
  static async all(...globs) {
    globs = globs.map((p) => root(p));
    let paths = await fg2(globs, {dot: true, absolute: true});
    let prom = [];
    for await (let entry2 of this.entries(paths)) {
      prom.push(Build.write(entry2));
    }
    await Promise.all(prom);
  }
  static async *entries(entryPoints) {
    const {outputFiles, warnings} = await Esbuild2.build({
      entryPoints,
      plugins: [this.resolvePlugin],
      platform: "node",
      bundle: true,
      target: "node12",
      format: "esm",
      outExtension: {".js": ".mjs"},
      external: [
        "chalk",
        "child_process",
        "commander",
        "electron",
        "esbuild",
        "fast-glob",
        "immer",
        "@textlint/markdown-to-ast",
        "react",
        "uuid",
        "vscode",
        "yaml"
      ],
      outdir: dist(),
      write: false
    });
    for (const out of outputFiles) {
      yield {
        path: out.path,
        compiled: out.text
      };
    }
  }
};
__publicField2(Bundle, "resolvePlugin", {
  name: "Resolution",
  setup(build3) {
    build3.onResolve({filter: /./}, async (args) => {
      let path4 = await realPathFor(args.path, args.resolveDir);
      if (path4) {
        return {path: path4};
      } else if (isPackage(args.path)) {
        return {path: args.path, external: true};
      }
      console.log(args.path, "from:", args.resolveDir);
      console.log("  resolved:", path4);
    });
  }
});

// .hack/build/src/cmd/dist.mjs
program3.command("dist").description("Create a distribution build.").action(main3);
async function main3() {
  try {
    await Bundle.project();
  } catch (err) {
    console.error(err);
  }
}

// .hack/build/src/cmd/test.mjs
import {program as program4} from "commander";
import {spawn} from "child_process";
program4.command("test [modules...]").description("Test some modules and its dependencies.").action(main4);
async function main4(modules) {
  try {
    for (const mod of iter2(modules)) {
      await import(mod).catch(console.error);
    }
    runAll();
  } catch (err) {
    console.error(err);
  }
}

// .hack/build/src/cmd/to.mjs
import {program as program5} from "commander";

// .hack/build/src/translate/Json.mjs
Translate.shape("json", String).shape("parse", T3.Any);
Translate.register("json", T3.Any, JSON.stringify);
Translate.register("parse", String, (str) => {
  try {
    return JSON.parse(str);
  } catch (_) {
  }
});

// .hack/build/src/translate/Yaml.mjs
import Yaml2 from "yaml";
var _a5;
var _b4;
(_b4 = (_a5 = Yaml2.defaultOptions).customTags) != null ? _b4 : _a5.customTags = [];
Yaml2.defaultOptions.customTags.push({
  identify: (fn) => typeof fn == "function",
  tag: "!function",
  resolve(doc, cst) {
    return () => {
    };
  },
  stringify(fn, ctx, onComment, onChompKeep) {
    return fn.name || "(anonymous)";
  }
});
Translate.shape("yaml", String).shape("parse", T3.Any);
Translate.register("yaml", T3.Any, Yaml2.stringify);
Translate.register("parse", String, (str) => {
  try {
    return Yaml2.parse(str);
  } catch (_) {
  }
});

// .hack/build/src/translate/Stdio.mjs
Translate.shape("buffer", Buffer).shape("stdin", {_readableState: {}, fd: 0}).shape("stdout", {_readableState: {}, fd: 1}).shape("stderr", {_readableState: {}, fd: 2});
Translate.register("console", T3.Any, (obj) => {
  console.write(obj);
  return obj;
});
Translate.register("stdout", String, (str) => {
  process.stdout.write(str);
  return true;
});
Translate.register("buffer", {_readableState: {pipes: []}}, async (stream) => {
  let out = Buffer.from("");
  for await (const chunk of stream) {
    out = Buffer.concat([out, chunk]);
  }
  return out;
});
Translate.register("string", {_readableState: {pipes: []}}, async (stream) => {
  const buffer = await Translate.buffer(stream).first;
  if (buffer)
    return String(buffer);
});

// .hack/build/src/cmd/to.mjs
program5.command("to <type>").description("Translate stdin to other types.").action(main5);
async function main5(type) {
  try {
    const source2 = await Translate.string(process.stdin).first;
    const out = Translate.to(type, Translate.parse(source2).first).first;
    console.log(out);
  } catch (err) {
    console.error(err);
  }
}

// .hack/build/src/cmd/eval.mjs
import {program as program6} from "commander";

// .hack/build/src/lib/Module.mjs
var Module = class {
  static *namedExports(mod) {
    for (const k in mod) {
      if (k != "default")
        yield [k, mod[k]];
    }
  }
  static async fromString(source2) {
    return import(this.asDataUri(source2));
  }
  static asDataUri(source2) {
    const prefix = "data:text/javascript;charset=utf-8,";
    return prefix + source2;
  }
};

// .hack/build/src/cmd/eval.mjs
program6.command("eval [code...]").description("Eval code in the LocalHack context.").action(main6);
async function main6(code) {
  try {
    code = code.join(" ");
    if (!code)
      code = await Translate.string(process.stdin).first;
    const compiled = await Compile.js(code, {path: "(eval)"});
    await Module.fromString(compiled);
  } catch (err) {
    console.error(err);
  }
}

// .hack/build/src/cmd/http.mjs
import {program as program7} from "commander";
import {createServer} from "http";

// .hack/build/hack.yml.mjs
import Yaml4 from "yaml";
var source = '# example: lib/Enum -> .hack/build/src/lib/Enum.mjs\npaths:\n  - "%.mjs"\n  - .hack/%\n  - .hack/build/%\n  - src/%\n  - node_modules/%\n  - "@core/%"\n\nhttp:\n  port: 1337\n';
var hack_yml_default = Yaml4.parse(source);

// .hack/build/src/lib/Config.mjs
var __defProp3 = Object.defineProperty;
var __publicField3 = (obj, key, value) => {
  if (typeof key !== "symbol")
    key += "";
  if (key in obj)
    return __defProp3(obj, key, {enumerable: true, configurable: true, writable: true, value});
  return obj[key] = value;
};
var Config = class {
  static merge(config) {
    for (let k in config) {
      switch (k) {
        case "paths":
          this.paths.unshift(...config[k]);
        default:
          if (matchAll({}, this[k], config[k])) {
            deepAssign2(this[k], config[k]);
          } else {
            this[k] = config[k];
          }
      }
    }
  }
};
__publicField3(Config, "paths", []);
__publicField3(Config, "http", {});
Config.merge(hack_yml_default);

// .hack/build/src/translate/Http.mjs
Translate.register("http", {}, (req, res) => {
  const str = Translate.yaml(res).first;
  res.write(str);
});
Translate.register("http", {url: "/status"}, (req, res) => {
  res.write(req.url + "\n");
  return "OK";
});
Translate.register("http", {url: "/echo"}, (req, res) => {
  req.pipe(res);
  return "";
});

// .hack/build/src/cmd/http.mjs
program7.command("http").description("Start an http server.").option("-p, --port <number>", "Port to listen on.", Config.http.port).action(main7);
function main7({port}) {
  server.listen(port, () => console.log(`HTTP listening on port ${port}.`));
}
var server = createServer(async (req, res) => {
  try {
    const str = await Translate.http(req, res).first;
    res.end(`${str}`);
  } catch (e) {
    console.error(e);
  }
});

// .hack/build/src/entries/cli.mjs
if (process.version < "v14.11") {
  console.log(`Node ${process.version} is too old. v14.11+ is required.`);
  process.exit(1);
}
commander22.program.name("hack").usage("[global flags] command").description("Construct JS computer programs quickly.").parse(process.argv);
