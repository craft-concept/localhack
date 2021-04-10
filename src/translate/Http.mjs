import Translate from "lib/Translate"

import "translate/Yaml"

Translate.register("http", {}, (req, res) => {
  const str = Translate.yaml(res).first
  res.write(str)
})

// Translate.register("http", {}, (req, res) => {
//   return true
// })

Translate.register("http", { url: "/status" }, (req, res) => {
  res.write(req.url + "\n")
  return "OK"
})

Translate.register("http", { url: "/echo" }, (req, res) => {
  req.pipe(res)
  return ""
})
