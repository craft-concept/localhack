#!/usr/bin/env node

import { sift, standard, debugging, current } from "../lib/sift.mjs"
import * as build from "../lib/sift/plugins/build.mjs"

const cwd = process.cwd()
const [node, bin, cmd, ...args] = process.argv
const send = sift()

send(standard, build.all, cli, watchCmd, buildCmd)

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
  }
}

function buildCmd(input) {
  if (input.cmd !== "build") return

  const glob = "src/**/*.{html,ts,js,mjs}"
  console.log(`Building ${glob}...`)

  let watching = false
  if (input.args.includes("--watch")) {
    watching = true
    console.log(`Watching for changes...`)
    send(build.watch)
  }

  return state => send => send({ glob, watching })
}

function watchCmd(input) {
  if (input.cmd !== "watch") return

  input.cmd = "build"
  input.args.push("--watch")
}
