export default [ReplCmd]

export function* ReplCmd({ cmd }, { to }) {
  if (to != "console") return
  if (cmd === "repl") yield "> "
}
