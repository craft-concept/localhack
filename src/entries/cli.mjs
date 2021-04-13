#!/usr/bin/env node --no-warnings --experimental-loader=./.hack/build/entries/NodeLoader.mjs

if (process.version < "v14.11") {
  console.log(`Node ${process.version} is too old. v14.11+ is required.`)
  process.exit(1)
}

import "lib/Testing"
import commander from "commander"
import electron from "electron"
import { execFile, spawn } from "child_process"
import Yaml from "yaml"

import "cmd/build"
import "cmd/watch"
import "cmd/test"
import "cmd/to"
import "cmd/eval"
import "cmd/http"

import { Lift } from "lib/Lift"
import Cli from "transforms/Cli"
import Build from "transforms/Build"
import Markdown from "transforms/Markdown"

commander.program
  .name("hack")
  .usage("[global flags] command")
  .description("Construct JS computer programs quickly.")
  .parse(process.argv)
