// .hack/build/entries/NodeLoader.mjs
var ROOT = process.cwd()
function resolve(specifier, { conditions, parentURL }, defaultResolve) {
  return defaultResolve(specifier, { conditions, parentURL }, defaultResolve)
}
export { resolve }
