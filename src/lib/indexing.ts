/** An Index of records of type T. */
export interface Index<T> {}

export type Indexer<T> = (item: T) => string
export type IndexerMap<T> = {
  [name: string]: Indexer<T>
}

export type IndexDesc<T, M extends IndexerMap<T>> = M & {
  id: keyof M
}

export const index = <T, M extends IndexerMap<T>>(
  desc: IndexDesc<T, M>,
): Index<T> => ({
  desc,
  init() {
    const data = {}
  },
})
