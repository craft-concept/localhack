import Objects, { RequiredCallError } from "lib/Objects"
import Db from "db"

export let Records = Objects.clone
  .lazy({
    statement() {
      return Db.prepare(this.sql)
    },

    sql() {
      return join([this.selectSql(), this.fromSql()])
    },
  })
  .def({
    execute() {
      this.statement.run(this.sql)
    },

    where(attrs) {
      return this.change(x => x.assignQuery(attrs))
    },

    selectSql() {
      let q = this.query

      if (!q.from) throw new RequiredCallError("from", "Archive")

      return join([
        "SELECT",
        q.distinct ? "DISTINCT" : "",
        q.select ? join(q.select, ", ") : "*",
      ])
    },
  })

export function join(parts, sep = " ") {
  return parts.filter(Boolean).join(sep)
}
