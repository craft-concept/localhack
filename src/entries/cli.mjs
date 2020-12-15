#!/usr/bin/env node

import { make } from "../lib/Sift.mjs"
import { current, iter } from "../lib/edit.mjs"
import { standard, debugging, trace } from "../plugins/std.mjs"
import * as build from "../plugins/build.mjs"
import * as CLI from "../plugins/CLI.mjs"
import * as project from "../lib/project.mjs"
import electron from "electron"
import { execFile, spawn } from "child_process"

const cwd = process.cwd()
const [node, bin, cmd, ...args] = process.argv
const send = make()

send(standard, build.all, CLI.all, cli)

send({
  cwd,
  cmd,
  args,
})

function cli(input) {
  if (!("cmd" in input)) return

  return state => {
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
}

function usageCmd(input) {
  if (input !== usageCmd) return

  return state => {
    if (state.cmd) return

    console.log("Welcome to LocalHack")
  }
}

function buildCmd(input) {
  if (input !== buildCmd) return

  const glob = "src/**/*.{html,ts,js,mjs,md,ohm}"

  return state => send => {
    if (state.flags.watch) send(watchCmd)
    if (state.flags.dist) send(distCmd)
    send({ glob })
  }
}

function distCmd(input) {
  if (input !== distCmd) return

  const dist = project.build("entries/*.{html,ts,js,mjs}")

  return state => send => {
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

function uiCmd(input) {
  if (input !== uiCmd) return

  return state => async send => {
    const child = execFile(
      electron,
      [project.file(project.entry("electron.js")), "main.mjs"],
      err => {
        if (err) return console.error(err)
      },
    )
  }
}

function watchCmd(input) {
  if (input !== watchCmd) return

  console.log(`Watching for changes...`)
  send(build.watching)
}
