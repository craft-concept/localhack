import { T, match, compare } from "lib/patterns"

export class Pattern {
  constructor(shape) {
    this.shape = shape
  }

  test(data) {
    return !!match(this.shape)(data)
  }

  match(data) {
    return match(this.shape)(data)
  }

  cmp(other) {
    return compare(this.shape, other.shape)
  }
}
