import { T } from "./patterns.local"

// Called an s-map (i.e. state map) in minikanren
export interface Bindings {
  [lvarName: string]: T.Any
}

const isLVar = (x: any): x is typeof T.Var =>
  x !== null && "__type" in x && x.__type === "LVar"

// Can we unify against two APIs instead of two data-structures?
export const unify = (a: typeof T.Any, b: typeof T.Any) => {
  if (isLVar(a)) {
    return { [a.name]: b }
  } else if (isLVar(b)) return unify(b, a)
}
