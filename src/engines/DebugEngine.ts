export type Action<A> = {} | A

export interface State<A> {
  recentActions: A[]
}
