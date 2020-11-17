#!/usr/bin/env node

import { sift, standard, debugging } from "../lib/sift.mjs"
import { glob, modules } from "../lib/sift/plugins/build.mjs"

const cwd = process.cwd()
const [node, bin, cmd, ...args] = process.argv
const send = sift()

send(standard, glob, modules, debugging, cli, build)

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
    state.args = input.args
  }
}

function build(input) {
  if (input.cmd !== "build") return

  const glob = "src/**/*.{html,ts,js,mjs}"
  console.log(`Building ${glob}...`)

  return state => send => send({ glob })
}
