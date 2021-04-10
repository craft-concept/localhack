export function* namedExports(mod) {
  for (const k in mod) {
    if (k != "default") yield [k, mod[k]]
  }
}

export async function fromString(source) {
  return import(asDataUri(source))
}

export function asDataUri(source) {
  const prefix = "data:text/javascript;charset=utf-8,"
  return prefix + encodeURIComponent(source)
}
