#!/usr/bin/env node

require("ts-node").register()
require("../../hacks")

const { make } = require("../../lib")
const store = make(require("./main.ts"))

store.dispatch({ type: "Start" })
