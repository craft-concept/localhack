import * as Meta from "lib/Meta"

function* ParseToken(token) {}

// function* (a, b) {
//   yield a + b
// }

function Raw(...terms) {
  return terms.join(" ")
}

function RunOps(a, op, b) {
  switch (op) {
    case "+":
      return a + b
    case "-":
      return a - b
    case "*":
      return a * b
    case "/":
      return a / b
  }
}

function* BasicLookup(term) {
  if (term in this) yield this[term]
  yield term
}

function* BasicSubtraction(a, op, b) {
  if (op != "-") return

  yield a - b
  yield Number(a) + Number(b)
  if (a in this && b in this) yield this[a] + this[b]
}

function* BasicAddition(a, op, b) {
  if (op != "+") return

  if (a in this && b in this) yield this[a] + this[b]
  yield a + b
  yield Number(a) + Number(b)
}

function BasicAssignment(a, op, b) {
  if (op != "=") return
  this[a] = b
}

Meta.extract(
  Array.prototype,
  class {
    get last() {
      return this[this.length - 1]
    }
  },
)

function* receive(ch) {
  this.prevStack ??= []
  this.stack ??= []
  this.term ??= ""

  switch (ch) {
    case " ":
      if (this.stack.last != "") this.stack.push("")
      return
    case "\n":
      this.prevStack = this.stack
      this.stack = []
  }
}

function* eachLine(line) {
  for (const term of line.split(/ +/)) eachTerm.call(this, ter)
}
