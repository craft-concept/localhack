// src/lib/testing.mjs
import {strict, AssertionError} from "assert";
import chalk2 from "chalk";
var dot = chalk2.green("\u2713");
var log = (x) => process.stdout.write(x);
var eq = (actual, expected, message) => {
  strict.deepEqual(actual, expected, message);
  log(dot);
};
var throws = (err, fn) => {
  try {
    fn();
  } catch (e) {
    if (!(e instanceof err))
      throw e;
    log(dot);
  }
  strict.fail(`Expected to throw ${err.name}`);
};
if (process.env.NODE_ENV === "test")
  log("\nRunning tests...\n\n");
var previousFilename = "";
var test = (subject, fn) => {
  if (process.env.NODE_ENV !== "test")
    return;
  const filename = callingFilename();
  if (filename !== previousFilename) {
    console.log("\n" + filename);
    previousFilename = filename;
  }
  log(`  ${chalk2.yellow(subject.name || subject)}: `);
  try {
    fn({eq, throws});
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
};
var backtrace = (err) => err.stack.split("\n").filter((line) => /^\s*at ./.test(line)).join("\n");
function* stackDetails(err) {
  const matches = err.stack.matchAll(/ +at.*[( ](?:\w+:\/\/)?(.+):(\d+):(\d+)/g);
  for (const [match, path2, line, col] of matches) {
    const name = path2.replace(/^.*\/(build|src)\//, "");
    yield {
      name,
      path: path2,
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

// src/lib/sift/edit.mjs
import {
  produce,
  isDraft,
  current as currentIm,
  original as originalIm
} from "immer";

// src/lib/sift/reify.mjs
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

// src/lib/sift/edit.mjs
var reify2 = (desc) => (state2) => {
  for (const [k, as] of entries(desc)) {
    state2[k] = as(state2[k]);
  }
  return state2;
};
test(reify2, ({eq: eq2}) => {
  const state2 = {
    number: 12,
    string: "something"
  };
  eq2(reify2({
    number: T.Array,
    string: T.Set
  })(state2), {
    number: [12],
    string: new Set(["something"])
  });
});
function* iter(x) {
  if (x == null)
    return;
  if (x instanceof Map)
    x = x.keys();
  if (typeof x === "object" && Symbol.iterator in x) {
    for (const xa of x)
      yield* iter(xa);
  } else {
    yield x;
  }
}
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
test(iter, ({eq: eq2}) => {
  eq2([...iter()], []);
  eq2([...iter(null)], []);
  eq2([...iter(void 0)], []);
  eq2([...iter(1)], [1]);
  eq2([...iter([1])], [1]);
  eq2([...iter([1, [2, 3], 4])], [1, 2, 3, 4]);
});
var iterMap = (fn) => function* iterMap2(...xs) {
  for (const v of iter(xs))
    yield* iter(fn(v));
};
test(iterMap, ({eq: eq2}) => {
  const inc = (x) => x + 1;
  const evenOnly = (x) => x % 2 === 0 ? x : null;
  const incs = iterMap(inc);
  const evens = iterMap(evenOnly);
  eq2([...incs()], []);
  eq2([...incs([])], []);
  eq2([...incs(null)], []);
  eq2([...incs(void 0)], []);
  eq2([...incs(1, 2, [3, [4]], 5)], [2, 3, 4, 5, 6]);
  eq2([...incs(null, void 0, 1)], [2]);
  eq2([...evens(1, 2, [3, [4]], 5)], [2, 4]);
});
var DRAFT_STATE = Symbol.for("immer-state");
var draftState = (input) => input[DRAFT_STATE];
var isModified = (input) => {
  var _a;
  return (_a = draftState(input)) == null ? void 0 : _a.modified_;
};
var current = (input) => isDraft(input) ? currentIm(input) : input;
function deepAssign(target, ...sources) {
  for (const source of sources)
    for (const k of keys(source))
      if (typeof target[k] === "object" && typeof source[k] === "object") {
        deepAssign(target[k], source[k]);
      } else {
        target[k] = source[k];
      }
  return target;
}
test(deepAssign, ({eq: eq2}) => {
  const source = {a: {b: 2}};
  eq2(deepAssign({a: 1, c: 3}, source), {a: {b: 2}, c: 3});
});
test(isModified, ({eq: eq2}) => {
  produce({test: {a: 1}}, (obj) => {
    eq2(isModified(obj), false);
    eq2(isModified(obj.test), false);
    obj.test.a = 2;
    eq2(isModified(obj), true);
    eq2(isModified(obj.test), true);
  });
});

// src/lib/sift/core.mjs
import {produce as produce2} from "immer";
var sift = (...inputs) => {
  const send2 = make(originalPlugin);
  send2(...inputs);
  return send2;
};
var make = (...metaPlugins) => root().meta(metaPlugins);
var root = () => {
  send2.send = send2;
  send2.next = () => {
  };
  send2.meta = (...fns3) => {
    for (const fn of iter(fns3))
      send2.next = fn(send2) || send2.next;
    return send2;
  };
  return send2;
  function send2(...inputs) {
    return send2.next(inputs);
  }
};
var originalPlugin = ({send: send2}) => (inputs) => {
  var _a, _b;
  if (send2.sending) {
    send2.queue || (send2.queue = []);
    send2.queue.push(...iter(inputs));
    return inputs;
  }
  send2.sending = true;
  (_a = send2.state) != null ? _a : send2.state = {};
  const result = produce2(inputs, (inputs2) => {
    send2.state = produce2(send2.state, (state2) => {
      var _a2;
      (_a2 = state2.plugins) != null ? _a2 : state2.plugins = [];
      for (const input of iter(inputs2)) {
        if (typeof input === "function")
          state2.plugins.push(input);
        runWith(state2.plugins, input, state2, send2);
      }
    });
  });
  send2.sending = false;
  const queued = (_b = send2.queue) == null ? void 0 : _b.shift();
  if (queued)
    send2(queued);
  return result;
};
var isFunction = (x) => typeof x === "function";
var apply = (fn, x) => [...iter(fn(x))].filter(isFunction);
var run = (fns3, x) => {
  const out = [];
  for (const fn of iter(fns3))
    out.push(...apply(fn, x));
  return out;
};
var runWith = (fns3, ...steps) => {
  for (const step of steps) {
    fns3 = run(fns3, step);
  }
};
test(make, ({eq: eq2}) => {
  const send2 = sift((input) => (state2) => {
    var _a;
    (_a = state2.count) != null ? _a : state2.count = 0;
    state2.count++;
  }, (input) => {
  }, (input) => input.testing = true, (input) => (state2) => (send3) => {
    if (state2.count === 4)
      send3({msg: "count is 4!"});
  });
  eq2(send2({}), [{testing: true}]);
  eq2(send2.state.count, 6);
});

// src/lib/fns.mjs
var pre = (fn, ...parts) => (...args) => fn(...parts, ...args);

// src/lib/sift/plugins/memory.mjs
import {v4 as uuid2} from "uuid";
var acceptIndexes = (input) => (state2) => {
  var _a, _b;
  (_a = state2.indexers) != null ? _a : state2.indexers = {};
  for (const [name, fn] of entries(input.indexers)) {
    state2.indexers[name] = fn;
    (_b = state2[name]) != null ? _b : state2[name] = state2[name];
  }
};
function findId(input) {
  if (input.id)
    return;
  return (state2) => {
    for (const [name, indexer] of entries(state2.indexers)) {
      const index = state2[name];
      if (!index)
        return;
      for (const key of iter(indexer(input))) {
        if (index[key]) {
          input.id = index[key];
          return;
        }
      }
    }
  };
}
var populateFromId = (input) => (state2) => {
  var _a;
  if (!input.id)
    return;
  (_a = state2.byId) != null ? _a : state2.byId = {};
  const cached = state2.byId[input.id];
  if (cached) {
    deepAssign(cached, current(input));
    deepAssign(input, current(cached));
  }
};
var writeIndexes = (input) => (state2) => {
  var _a, _b, _c;
  for (const [name, indexer] of entries(state2.indexers)) {
    (_a = state2[name]) != null ? _a : state2[name] = {};
    for (const key of iter(indexer(input))) {
      (_b = input.id) != null ? _b : input.id = uuid2();
      (_c = input.createdAt) != null ? _c : input.createdAt = new Date().toISOString();
      state2[name][key] = input.id;
    }
  }
};
function writeToCache(input) {
  var _a, _b, _c, _d;
  if (!input.id)
    return;
  (_a = state.byId) != null ? _a : state.byId = {};
  const cached = (_d = (_b = state.byId)[_c = input.id]) != null ? _d : _b[_c] = {};
  deepAssign(cached, current(input));
  deepAssign(input, current(cached));
}
var memory_default = [
  acceptIndexes,
  findId,
  populateFromId,
  writeIndexes,
  writeToCache
];

// src/lib/sift/std.mjs
var alias = (input) => {
  if (typeof input.alias === "string")
    state[input.alias] = input;
};
var config = (input) => {
  if (typeof input.config !== "object")
    return;
  return (state2) => {
    state2.config || (state2.config = {});
    deepAssign(state2.config, input.config);
  };
};
var trace = (input) => {
  console.log("input:", current(input));
};
var standard = [memory_default, config, alias];
var debugging = [trace];

// src/lib/sift/plugins/windows.mjs
import electron2 from "electron";
import "path";

// src/lib/project.mjs
import {resolve, relative} from "path";
var root2 = (...paths) => resolve(process.cwd(), ...paths);
var src = pre(root2, "src");
var entry = pre(src, "entries");
var local = pre(root2, ".localhack");
var build = pre(local, "build");
var dist = pre(root2, "dist");

// src/lib/sift/plugins/windows.mjs
var {app, BrowserWindow} = electron2;
var windows = (send2) => {
  app.on("activate", onActivate);
  app.whenReady().then(onReady);
  function cleanup() {
    app.off("activate", onActivate);
  }
  return (input) => (state2) => {
    var _a, _b, _c, _d, _e, _f, _g;
    (_a = state2.appReady) != null ? _a : state2.appReady = false;
    (_b = state2.windows) != null ? _b : state2.windows = {};
    const {windows: windows3} = state2;
    (_c = windows3.index) != null ? _c : windows3.index = new Map();
    (_d = windows3.queue) != null ? _d : windows3.queue = [];
    if (input.appReady)
      state2.appReady = true;
    if (input.windowClosedId)
      windows3.index.delete(input.windowClosedId);
    if (input.window)
      windows3.queue.push(input.window);
    if (!state2.appReady)
      return;
    for (const id of (_e = input.closeWindows) != null ? _e : []) {
      (_f = state2.windows.index.get(id)) == null ? void 0 : _f.close();
    }
    let req;
    while (req = windows3.queue.pop()) {
      const win = new BrowserWindow({
        ...req.options,
        webPreferences: {
          ...(_g = req.options) == null ? void 0 : _g.webPreferences,
          preload: entry("preload.js"),
          worldSafeExecuteJavaScript: false,
          nodeIntegration: true,
          contextIsolation: false
        }
      });
      win.loadFile(entry(req.src));
      if (req.openDevtools)
        win.webContents.openDevTools();
      const id = String(win.id);
      win.on("closed", () => send2({windowClosedId: id}));
      state2.windows.index.set(id, {id, ...req});
    }
  };
  function onActivate() {
    send2({appActivated: true});
  }
  function onReady() {
    send2({appReady: true});
  }
};

// src/entries/main.mjs
var send = sift();
send(standard, debugging, windows(send));
send({
  window: {
    src: "index.html",
    openDevtools: true,
    options: {}
  }
});
