```mjs
function unify(a, b) {
  // `this` is state
}

unify.test?.(({ eq }) => {
  const state = {}

  unify.call(state, v("a"), 1)
  eq(state, { a: 1 })
})
```

A plugin describes:

> given some input and what we know, we also know these yielded values

    Inputs + State -> Derived Knowledge

Functions can be any arity and can choose to access any state on `this` the
functions cannot, however, limit themselves to particular inputs. There is no
limit to what we can learn from any given inputs. Each plugin contributes
learnings.

Plugins can request to perform some side-effectual action in the world by
returning a function. This should be considered a "sync" and should be
negotiated via CRDT.

```mjs
function unifyEqual(a, b) {
  if (a === b) return a // we have learned that there is only `a`
  // otherwise, we've learned nothing
}

function unifyInstances(a, b) {
  if (a instanceof b) return a
}

function unifyTypes(a, b) {
  if (b.__type === typeof a) return a
}

function unifyObjects(a, b) {
  if (typeof a != 'object') return
  if (typeof b != 'object') return

  for (const )
}

function unifyVars(a, b) {

  if (a.__type != 'var') return
  if ('pattern' in a) return send => {


    // yield* send(a.pattern, b)
    if (send(a.pattern, b) == null) return
  }
  this[a.name] = b

  //  ({
  //   __type: "var",
  //   name,
  //   pattern,
  // }),
}
```

```mjs
function* walkChildren(node) {
  if (!Array.isArray(node.children)) return
  const parent = this

  return function* stacked() {
    // We are now at depth + 1
    // `this` is `Object.create(parent)`
    yield* node.children
  }
}
```

```mjs
unify({
  firstName: lvar("first"),
  lastName: lvar("last"),
  fullName: concat(lvar("first"), " ", lvar("last")),
})

function FullName({ firstName, lastName }) {
  this.fullName = [firstName, lastName].join(" ")
}
```

```db
name = "Jeff Peterson"
born = 1993-08-12
age = 27
height = 6'0"
```

## Dates and Times

Dates vs Times seems to be problematic. Referring to a day is different than
referring to the very first second of that day. A day contains an infinite
number of times; a day is a time _period_ or time _span_, just like a week.

`March 2021` Refers to 365 days. A programming language must not restrict itself
to a single representation. Sometimes, we want the beginning and end _times_.

So, 2021-03-15 refers to a date. It needn't be anything more or less until
required. We could say `var today = "2021-03-15"`. And we could say,
`today.seconds`, and we'd expect to get `86_400`. But we consistently have the
problem of what to do when we have two possible answers. How do we decide which
value to use?

This is where multiple realities come in. Minikanren uses the s-map for this
purpose. It is an immutable data-structure and so allows exploring many
possibilities to determine if they result in new knowledge.

Basically, we want to be able to operate _as if_ `today` were a date, while
simultaneously operating _as if_ it were a standard string.

How about a proxy where reading and writing are separated.

Reading a value `this.name` returns a generator of names. Writing a value
`this.name = "Bob"` pushes into that generator.

But now we have a fundamentally different problem. I might have
`this.firstName == ["Jeff", "Bob"]` and
`this.lastName == ["Peterson", "Yakson"]`, but there only exists a Jeff Peterson
and Bob Yakson but no Jeff Yakson. No branch should have access to Jeff Yakson
or Bob Peterson. This appears to be a fundamental flaw with most languages. Any
attempt to capture this "reality of realities" fundamentally breaks from the
structure of most languages.

And so we require a language that allows many mutually exclusive interpretations
of its source code.

```
x * x = 9
//=> x = 3
//=> x = -3

x + 1 = y
//=> x = 3, y = 4
//=> x = -3, y = -2
// These are the only two possible worlds.
x + x = 6
//=> x = 3
```

Okay, so we can start by constructing a function that when given
`fn("x * x = 9")` yields `"x = 3"` and `"x = -3"`.

```mjs
const worldA = make()

worldA("x * x = 9") // this call yields the latest facts
```

```mjs
{
  y: "x * x",
}
```

So, we need a custom language that allows multiple simultaneous key-value pairs.
