export function steps(fn) {
  let stack = []
  fn(Stepper(stack))
  return stack
}

export default function Stepper(stack) {
  let handler = new StepHandler(stack)
  let proxy = new Proxy(() => {}, handler)
  handler.proxy = proxy
  return proxy
}

export class StepHandler {
  constructor(stack) {
    this.stack = stack
  }

  get(target, prop, proxy) {
    this.last = [prop]
    this.stack.push(this.last)
    return this.proxy
  }

  apply(target, this_, args, proxy) {
    if (this.last) {
      this.last.push(...args)
    } else {
      this.stack.push(...args)
    }
    return this.proxy
  }
}

steps.test?.(({ eq }) => {
  eq(
    steps(_ => _("start").a.b(1).c.d(2, 3)(4)),
    ["start", ["a"], ["b", 1], ["c"], ["d", 2, 3, 4]]
  )
})
