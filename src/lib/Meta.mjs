export function extract(target, ...classes) {
  for (const klass of classes) {
    Object.defineProperties(target, namedProperties(klass.prototype))
  }

  return target
}

export function entries(obj) {
  return Object.entries(obj)
}

export function namedProperties(klass) {
  const orig = properties(klass.prototype)
  if (!klass.name) return orig

  const props = {}

  for (const [k, desc] of entries(orig)) {
    props[`${klass.name}_${k}`] = desc
  }
  return props
}

export function properties(obj) {
  const props = Object.getOwnPropertyDescriptors(obj)
  delete props.constructor
  return props
}
