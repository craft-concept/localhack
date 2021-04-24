import chokidar from "chokidar"

import Stream from "lib/Stream"
import Precursor from "lib/Precursor"
import * as Project from "lib/Project"

export default Precursor.clone.def({
  all(...roots) {
    return Stream.make(em => {
      let fullRoots = roots.map(r => Project.root(r))

      let watcher = chokidar
        .watch(fullRoots)
        .on("error", em.error)
        .on("change", em.value)
        .on("ready", () => {
          let watched = Object.values(watcher.getWatched()).flatMap(x => x)

          console.log(`Watching ${watched.length} files in:`)
          for (let root of roots) console.log(`- ${root}`)
          console.log()
        })

      return () => {
        return watcher.close()
      }
    }).map(Project.file)
  },
})
