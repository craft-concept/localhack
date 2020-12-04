/**
 * Note(jeff): I'm playing around with the idea of using Proxy objects to
 * navigate trees and extract data. Maybe it'll be a neat API, or maybe it'll
 * just be confusing.
 */

export type Prop = string | number | symbol
export interface Handler<Ctx, Args extends any[], T> {
  get(ctx: Ctx): (prop: Prop) => Ctx
  invoke(ctx: Ctx): (...args: Args) => T
}

export interface Draft<Args extends any[], T> {
  (...props: Args): T
  [k: string]: Draft<Args, T>
}

export const draft = <Ctx, Args extends any[], T>(
  handler: Handler<Ctx, Args, T>,
) => {
  const makeDraft = (ctx: Ctx): Draft<Args, T> =>
    new Proxy(() => {}, {
      get: (_, prop) => makeDraft(handler.get(ctx)(prop)),
      apply: (_, __, args) => handler.invoke(ctx)(...args),
    }) as any

  return makeDraft
}
