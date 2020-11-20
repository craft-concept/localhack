# Trust

Remember that process in LocalHack is encoded as plugins of the form:
`input => state => send => send(output)`

An `input` can be thought of as an _observation_. Each observation is simply
a collection of properties. The `id` property is special: two observations with
the same `id` are considered to be about the same underlying entity.

For example, we might observe a file's `path`:
`{ id: 123, path: "src/Trust.md" }`

Later on we might observe other properties; we can use the `id` of each
observation to tie them together.

So far, we see _observations_ of three main varieties:

_Internal Observations_ are those from within the current process itself. These
are automatically trusted, and most of the internal functions are powered by
this kind of observation.

_Local Observations_ are those from other processes on the same device. These
should likely be signed and verified but are generally trusted.

_Remote Observations_ are those from others and are not trusted by default.
Our hope is that you can "try out" these observations by applying them to your
local dataset in a revertable way. Recording vector clocks, etc. along with
our remote and local observations should allow us to construct an ad-hoc CRDT
within our dataset.
