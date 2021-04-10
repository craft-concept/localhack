const cwd = process.cwd()
const [node, bin, cmd, ...args] = process.argv

const self = new Lift().use(Build, Markdown)

for (const reply of self.transform(
  { cwd, cmd, args },
  { cwd, cmd, args, console: String },
)) {
  console.log("---")
  console.log(Yaml.stringify(reply))
}

function cli(input, ctx, recur) {
  if (!("cmd" in input)) return

  if (state.flags.debug) send(trace(state.flags.debug))

  switch (input.cmd) {
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

function usageCmd(input, ctx) {
  if (input !== usageCmd) return
  if (ctx.cmd) return

  console.log("Welcome to LocalHack")
}

function buildCmd(input, { args }, recur) {
  if (input !== buildCmd) return

  const glob = "src/**/*.{html,ts,js,mjs,md,ohm}"

  if (args.includes("--watch")) recur(watchCmd)
  if (args.includes("--dist")) recur(distCmd)
  recur({ glob })
}

function distCmd(input, { args }, recur) {
  if (input !== distCmd) return

  const dist = project.build("entries/*.{html,ts,js,mjs}")

  return send => {
    if (args.includes("--watch")) send(watchCmd)

    send(build.bundling, { dist })
  }
}

function testCmd(input) {
  if (input !== testCmd) return

  for (const arg of iter(args)) {
    import(project.build(arg)).catch(console.error)
  }
}

function uiCmd(input, state, recur) {
  if (input !== uiCmd) return

  const child = execFile(
    electron,
    [project.file(project.entry("electron.js")), "main.mjs"],
    err => {
      if (err) return console.error(err)
    },
  )
}

function watchCmd(input, ctx, recur) {
  if (input !== watchCmd) return

  console.log(`Watching for changes...`)
  recur(build.watching)
}
