/**
 * The goal of this Engine is to track a local repository of source code.
 * It'll handle things like live-reload and syncing UI changes to source files.
 */
import { always, index } from "../lib"

export type Action = {}

export interface SourceFile {
  path: string
}

const Files = index((file: SourceFile) => file.path)

export interface State {
  files: typeof Files.Index
}

export const init = (): State => ({
  files: Files.init(),
})
