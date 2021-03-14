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

export const Generator = function* () {}.prototype
export const AsyncGenerator = async function* () {}.prototype

export const GeneratorFunction = Generator.constructor
export const AsyncGeneratorFunction = AsyncGenerator.constructor
export const AsyncFunction = async function () {}.constructor

export function isAsyncFunction(fn) {
  return typeof fn == "function" && fn instanceof AsyncFunction
}

export function isGeneratorFunction(fn) {
  return typeof fn == "function" && fn instanceof GeneratorFunction
}

export function isAsyncGeneratorFunction(fn) {
  return typeof fn == "function" && fn instanceof AsyncGeneratorFunction
}

export function isArrowFunction(fn) {
  return typeof fn == "function" && fn.constructor === Function && !fn.prototype
}

export function isPlainFunction(fn) {
  return (
    typeof fn == "function" && fn.constructor === Function && !!fn.prototype
  )
}

isAsyncFunction.test(({ truthy, falsy }) => {
  falsy(isAsyncFunction(function () {}))
  falsy(isAsyncFunction(() => {}))
  truthy(isAsyncFunction(async function () {}))
  truthy(isAsyncFunction(async () => {}))
})
