import Struct from "lib/Struct"
import Db from "db"

import migration from "db/migrate/Message.sql"

migration.run()

export default class Message extends Struct {
  static query = {
    hash: Db.prepare("SELECT * FROM Message WHERE hash = ? LIMIT 1"),
  }

  static byHash(hash) {
    return this.query.hash.get(hash)
  }

  static save(msg) {
    if (msg.messageId) return
  }
}
