#!/usr/bin/env node --no-warnings --experimental-loader=./.hack/build/entries/NodeLoader.mjs

if (process.version < "v14.11") {
  console.log(`Node ${process.version} is too old. v14.11+ is required.`)
  process.exit(1)
}

import commander from "commander"
import electron from "electron"
import { execFile, spawn } from "child_process"
import Yaml from "yaml"

import "cmd/http"
import "cmd/to"

import "lib/Testing"
import { iter } from "lib"
import * as project from "lib/project"

import { Lift } from "lib/Lift"
import Cli from "transforms/Cli"
import Build from "transforms/Build"
import Markdown from "transforms/Markdown"

commander.program
  .name("hack")
  .usage("[global flags] command")
  .description("Construct JS computer programs quickly.")
  .parse(process.argv)
