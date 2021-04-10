import { Sleeve } from "lib/Sleeve"

export let root = {}
root.root = root

export default new Entity(root, new Handler())

class Entity extends Proxy {
  constructor(self) {
    super(self, new Handler())
  }
}

class Handler {
  get(self, prop, proxy) {
    return new Entity(self[prop] ?? root[self.id][prop])
  }

  has(self, prop) {
    return prop in self || prop in root[self.id]
  }

  set(self, prop, value) {
    switch (prop) {
      case "id":
        throw new Error("id property is immutable and cannot be assigned.")

      default:
        if (self.id) root[self.id][prop] = value
        else self[prop] = value
    }
  }
}
