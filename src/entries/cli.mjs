#!/usr/bin/env node

import { sift, standard, debugging } from "../lib/sift.mjs"

const cwd = process.cwd()
const [node, bin, cmd, ...args] = process.argv
const send = sift()

send(standard, cli)

function cli(input) {
  return state => async send => {
    if (!input.cmd) return

    await import(`../cmds/${input.cmd}`)
  }
}
// send(debugging)

function buildCmd(input) {
  if (input.cmd !== "build") return
  console.log("Building...")
}

send({
  cwd,
  cmd,
  args,
})
