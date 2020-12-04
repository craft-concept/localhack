/**
 * The goal for this module is to provide a federated searching interface.
 * Search queries are described as Patterns. The results are Streams of matches.
 */

import { Data, Pattern } from "./patterns"
import { Stream } from "./streams"

export type Searcher<P extends Pattern, T = Data<P>> = (pattern: P) => Stream<T>

export interface Searchable<P extends Pattern> {
  search: Searcher<P>
}
