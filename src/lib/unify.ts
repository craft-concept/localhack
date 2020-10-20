import { Shape, LVar } from "./patterns"

// Called an s-map (i.e. state map) in minikanren
export interface Bindings {
  [lvarName: string]: Shape
}

const isLVar = (x: any): x is LVar =>
  x !== null && "__type" in x && x.__type === "LVar"

// Can we unify against two APIs instead of two data-structures?
export const unify = (a: Shape, b: Shape) => {
  if (isLVar(a)) {
    return { [a.name]: b }
  } else if (isLVar(b)) return unify(b, a)
}
