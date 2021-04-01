#!/usr/bin/env node --no-warnings --experimental-loader=./.hack/build/entries/NodeLoader.mjs

if (process.version < "v14.11") {
  console.log(`Node ${process.version} is too old. v14.11+ is required.`)
  process.exit(1)
}

import electron from "electron"
import { execFile, spawn } from "child_process"
import Yaml from "yaml"

import "lib/Testing"
import { iter } from "lib"
import * as project from "lib/project"

import { Lift } from "lib/Lift"
import Cli from "transforms/Cli"
import Build from "transforms/Build"
import Markdown from "transforms/Markdown"

const cwd = process.cwd()
const [node, bin, cmd, ...args] = process.argv

const self = new Lift().use(Build, Markdown)

for (const reply of self.send({ cwd, cmd, args })) {
  console.log("---")
  console.log(Yaml.stringify(reply))
}

function cli(this, _, recur, state) {
  if (!("cmd" in this)) return
  state.cwd = this.cwd
  state.cmd = this.cmd
  state.args = current(this.args)

  if (state.flags.debug) send(trace(state.flags.debug))

  switch (this.cmd) {
    case undefined:
      return recur(usageCmd)
    case "build":
      return recur(buildCmd)
    case "dist":
      return recur(distCmd)
    case "test":
      return recur(testCmd)
    case "watch":
      return recur(buildCmd, watchCmd)
    case "ui":
      return recur(buildCmd, watchCmd, uiCmd)
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
    import(project.build(arg)).catch(console.error)
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
