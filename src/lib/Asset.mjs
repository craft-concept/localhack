import { join } from "path"

import Precursor from "lib/Precursor"
import File from "lib/File"

/**
 * Represents the stack of files that exist at a path.
 */
export default Precursor.clone
  .def({
    name: "Asset",

    withRoot(root) {
      return this.clone.assign({ root, path: "" })
    },

    at(path) {
      return this.clone.assign({ path: join(this.path, path) })
    },
  })
  .lazy({
    files() {},
  })
