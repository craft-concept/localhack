// src/entries/electron.js
var [bin, cmd, entry] = process.argv;
var chalk = require("chalk");
import(`./${entry}`).catch((err) => {
  if (err.message === "Cannot read property '0' of null") {
    console.error(chalk.red("\nThere was a problem with an import."));
    console.error("A Node bug has swallowed the original error.\n");
    console.error("You are likely importing a value that was not exported.\n");
    process.exit(1);
  }
});
