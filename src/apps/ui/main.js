require("ts-node").register()
require("../../hacks")
const Path = require("path")

const { make } = require("../../lib")
make(require("./main.ts"))

navigator.serviceWorker.register(Path.join(__dirname, "compiler.js"))
