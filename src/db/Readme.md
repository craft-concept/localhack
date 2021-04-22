# Database Module

```mjs
import Database from "better-sqlite3"

import * as Project from "lib/project"

export let path = Project.local("data.db")

export default Database(path)
```
