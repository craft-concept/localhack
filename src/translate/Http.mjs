import { join } from "path"

import Translate from "lib/Translate"
import Resolve from "lib/Resolve"
import Mime from "lib/Mime"
import File from "lib/File"

import "translate/Yaml"

Translate.register("http", {}, (req, res) => {
  const str = Translate.yaml(res).first
  res.write(str)
})

// Translate.register("http", { url: String }, async (req, res) => {
//   let contentType = req.headers["content-type"] ?? "text/html"
//   let path = req.url.replace(/^\//, "") || "index"
//   path = Mime.withExt(path, contentType)

//   console.log(`Finding: '${path}'`)

//   path = await Resolve.real(path)

//   if (!path) return

//   return new Promise((res, rej) => {
//     console.log(`Streaming: '${path}'`)
//     File.at(path).stream().pipe(res).on("end", res).on("error", rej)
//   })
// })

Translate.register("http", { url: String }, async (req, res) => {
  let contentType = req.headers["content-type"] ?? "text/html"
  let { url } = req.url

  let paths = [url, join(url, "index")]
  paths.push(...paths.map(p => Mime.withExt(p, contentType)))

  console.log(`Finding: '${url}'`)

  for (let path of paths) {
    try {
      return new Promise((res, rej) => {
        console.log(`Streaming: '${path}'`)
        Archive.stream(path).pipe(res).on("end", res).on("error", rej)
      })
    } catch (err) {}
  }
})

Translate.register("http", { url: "/status" }, (req, res) => {
  res.write(req.url + "\n")
  return true
})

Translate.register("http", { url: "/echo" }, (req, res) => {
  return new Promise((res, rej) => {
    req.pipe(res).on("end", res).on("error", rej)
  })
})
