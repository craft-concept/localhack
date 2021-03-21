export function* namedExports(mod) {
  for (const k in mod) {
    if (k != "default") yield [k, mod[k]]
  }
}
