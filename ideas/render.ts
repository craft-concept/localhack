import {
  createContext,
  createElement,
  Fragment,
  ReactNode,
  ReactText,
  useContext,
} from "react"
import { fn, Fn, match, T } from "./patterns"

export type Key = ReactText

/**
 * Use this to construct JSX tags.
 */
export const h = createElement

export const renderArray = fn(
  [T.Any],
  ((items: any) => h(Fragment, {}, items.map(render))) as any,
  T.Any,
)

export interface RenderCtx {
  fns: Fn<any>[]
}

export const RenderContext = createContext<RenderCtx>({ fns: [] })
export const useRenderContext = () => useContext(RenderContext)

export function RenderRoot({
  fns,
  children,
}: {
  fns: Fn<any, any>[]
  children: ReactNode
}) {
  return h(RenderContext.Provider, { children, value: { fns } })
}

export const renderKey = <T>(getKey: (data: T) => Key) => (data: T) =>
  render(data, getKey(data))

export const render = <T>(data: T, key?: Key) => h(Render, { data, key })

export function Render<T>({ data }: { data: T }) {
  const data_ = data as any // workaround ts(2589)
  const { fns } = useRenderContext()

  for (const fn of fns) {
    if (match(fn.input)(data))
      return (h as any)(({ data }) => (fn as any)(data), { data: data_ })
  }

  return "Could not render data."
}
