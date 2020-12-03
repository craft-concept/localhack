#!/usr/bin/env node

import { sift, standard, debugging, current } from "../lib/sift.mjs"
import * as build from "../lib/sift/plugins/build.mjs"
import * as project from "../lib/project.mjs"
import electron from "electron"
import { execFile, spawn } from "child_process"

const cwd = process.cwd()
const [node, bin, cmd, ...args] = process.argv
const send = sift()

send(standard, build.all, cli)

send({
  cwd,
  cmd,
  args,
})

function cli(input) {
  if (!input.cmd) return

  return state => {
    state.cwd = input.cwd
    state.cmd = input.cmd
    state.args = current(input.args)

    return send => {
      switch (input.cmd) {
        case "build":
          return send(buildCmd)
        case "test":
          return send(buildCmd, testCmd)
        case "watch":
          return send(buildCmd, watchCmd)
        case "ui":
          return send(buildCmd, watchCmd, uiCmd)
      }
    }
  }
}

function buildCmd(input) {
  if (input !== buildCmd) return

  const glob = "src/**/*.{html,ts,js,mjs}"

  return state => send => {
    if (state.args.includes("--watch")) send(watchCmd)
    send({ glob })
  }
}

function testCmd(input) {
  if (input !== testCmd) return

  return state => {
    const globs = [...iter(state.args)]
    if (!globs.length) globs.push("entries/test.mjs")

    spawn(
      electron,
      [project.file("build/entries/electron.js"), state.args[0]],
      { env: { ELECTRON_RUN_AS_NODE: "1", NODE_ENV: "test" } },
      err => {
        if (err) return console.error(err)
      },
    )
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
