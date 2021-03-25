import Promise from "lib/PromisePlus"

export function timeout(ms) {
  return new Promise(res => {
    const id = setTimeout(res, ms)
    return () => clearTimeout(id)
  })
}

timeout.test?.(({ eq, fail }) => {
  const t = timeout(1000)
    .then(() => fail("Timeout should've been cancelled."))
    .catch(() => fail("Timeout should've been cancelled."))

  t.cancel()
  eq(t.cancelled, true)
})
