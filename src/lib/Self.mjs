export let target = globalThis

export function apply(target) {}

export default new Proxy(target, {
  apply,
  construct,
})
