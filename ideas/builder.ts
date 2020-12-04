import { ActionOf, Update } from "./flow.local"

export interface BuilderDesc<S> {
  [name: string]: Update<any, S>
}

export type Builder<S, D> = {
  state: S
} & {
  [K in keyof D]: (input: ActionOf<D[K]>) => Builder<S, D>
}

export const builder = <S, D extends BuilderDesc<S>>(desc: D) =>
  function create(state: S): Builder<S, D> {
    const builder: any = { state }

    for (const k in desc) {
      builder[k] = (x: any) => create(desc[k](x)(state))
    }

    return builder
  }
