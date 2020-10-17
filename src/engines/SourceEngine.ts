/**
 * The goal of this Engine is to track a local repository of source code.
 * It'll handle things like live-reload and syncing UI changes to source files.
 */
import { Index, index } from "../lib"

export type Action = {}

export interface SourceFile {
  path: string
}

// export interface State {
//   files: typeof Files
// }

// export const init = (): State => ({
//   files: Files.init(),
// })

// const Files = index<SourceFile>({
//   byPath: file => file.path,
// })
