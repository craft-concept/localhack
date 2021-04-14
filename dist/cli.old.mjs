// .hack/build/src/entries/cli.old.mjs
var cwd = process.cwd();
var [node, bin, cmd, ...args] = process.argv;
var self = new Lift().use(Build, Markdown);
for (const reply of self.transform({cwd, cmd, args}, {cwd, cmd, args, console: String})) {
  console.log("---");
  console.log(Yaml.stringify(reply));
}
