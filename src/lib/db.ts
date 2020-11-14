export interface Db<T, Id = string> {
  add(item: T): Id
  get(id: Id): T | null
  id(item: T): Id
}
