# Sleeve

_Sleeves_ are similar to immer drafts: proxy objects that allow immutable
changes via a mutable api. The purpose is to better fit with [Sift](Sift.md) and
to eventually support `Automerge.change()`.

```mjs
export function draft(handler) {
  return function makeDraft(ctx) {
    return new Proxy(() => {}, {
      get: (_, prop) => makeDraft(handler.get(ctx)(prop)),
      apply: (_, __, args) => handler.invoke(ctx)(...args),
    })
  }
}

export class Sleeve extends Proxy {
  constructor(original, replace) {
    super(original, new SleeveHandler(replace))
  }
}

export class SleeveHandler {
  constructor(replace) {
    this.replace = replace
  }

  get(self, prop, proxy) {
    switch (prop) {
      case "Sleeve.original":
        return self
      default:
        return new Sleeve(self[prop], replacement => {
          proxy[prop] = replacement
        })
    }
    return original[prop]
  }
  get(self, prop, proxy) {
    return original[prop]
  }
}

export class Draft {
  constructor(original) {
    this.original = original
    this.self = Object.create(original)
  }

  get(prop) {
    return this.original[prop]
  }

  set(prop, value) {
    this.self[prop] = value
  }

  delete(prop) {
    delete this.self[prop]
  }
}
```
