#!/usr/bin/env node --no-warnings --experimental-loader=./.hack/build/entries/NodeLoader.mjs

if (process.version < "v14.11") {
  console.log(`Node ${process.version} is too old. v14.11+ is required.`)
  process.exit(1)
}

import electron from "electron"
import { execFile, spawn } from "child_process"
import Yaml from "yaml"

import "lib/Testing"
import { current, iter } from "lib"
import { Fold } from "lib/Fold"
import { standard, debugging, trace } from "plugins/std"
import * as build from "plugins/build"
import * as CLI from "plugins/CLI"
import * as Files from "plugins/Files"
import * as Http from "plugins/Http"
import * as project from "lib/project"

const cwd = process.cwd()
const [node, bin, cmd, ...args] = process.argv
const self = Fold()

self(
  // Plugins
  // debugging,
  standard,
  // Http.default,
  Files.default,
  CLI.all,
  cli,
)

for (const reply of self({ cwd, cmd, args })) {
  console.log("---")
  console.log(Yaml.stringify(reply))
}

function cli(input, state) {
  if (!("cmd" in input)) return
  state.cwd = input.cwd
  state.cmd = input.cmd
  state.args = current(input.args)

  return send => {
    if (state.flags.debug) send(trace(state.flags.debug))

    switch (input.cmd) {
      case undefined:
        return send(usageCmd)
      case "build":
        return send(buildCmd)
      case "dist":
        return send(distCmd)
      case "test":
        return send(testCmd)
      case "watch":
        return send(buildCmd, watchCmd)
      case "ui":
        return send(buildCmd, watchCmd, uiCmd)
    }
  }
}

function usageCmd(input, state) {
  if (input !== usageCmd) return
  if (state.cmd) return

  console.log("Welcome to LocalHack")
}

function buildCmd(input, state) {
  if (input !== buildCmd) return

  const glob = "src/**/*.{html,ts,js,mjs,md,ohm}"

  return send => {
    if (state.flags.watch) send(watchCmd)
    if (state.flags.dist) send(distCmd)
    send({ glob })
  }
}

function distCmd(input, state) {
  if (input !== distCmd) return

  const dist = project.build("entries/*.{html,ts,js,mjs}")

  return send => {
    if (state.flags.watch) send(watchCmd)

    send(build.bundling, { dist })
  }
}

function testCmd(input) {
  if (input !== testCmd) return

  for (const arg of iter(args)) {
    import(project.build(arg))
  }
}

function uiCmd(input, state) {
  if (input !== uiCmd) return

  return async send => {
    const child = execFile(
      electron,
      [project.file(project.entry("electron.js")), "main.mjs"],
      err => {
        if (err) return console.error(err)
      },
    )
  }
}

function watchCmd(input, state) {
  if (input !== watchCmd) return

  return send => {
    console.log(`Watching for changes...`)
    send(build.watching)
  }
}
