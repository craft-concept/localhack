# sift

Sift is an experimental data management library with an architecture similar
to Flux.

Keep in mind that sift is just something we're playing around with, and could
be a terrible idea.

The core of Sift is the plugin. A plugin is a function of this shape:
`input => state => void`

The plugins are a bit strange however, in that both `input` and `state` are
immer Draft proxy objects. This means that plugins can freely mutate both
`input` and `state`.

Unlike Flux, the `input` objects are not necessarily actions in the traditional
form (`{ type: "AddTodo", todo: {...}}`). Instead, the `input` object is simply
some data you'd like added to the system. The plugins inspect each input
object to determine if their logic applies. Some plugins might simply decorate
the `input` object with metadata and not touch the `state` at all.
