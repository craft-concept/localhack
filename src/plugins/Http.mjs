import { createServer } from "http"

export default [HttpServer, BufferResponses, FileResponses]

export function HttpServer(input) {
  if (input != HttpServer) return

  return send => {
    this.server ??= createServer((req, res) => {
      send({ http: { req, res } }).all
    })

    if (!this.server.listening) this.server.listen((this.port ??= 3000))
  }
}

export function BufferResponses({ http }) {
  if (!http) return

  const { req, res } = http

  return async send => {
    const replies = send({
      url: req.url,
      method: req.method,
      headers: req.headers,
      buffer: Buffer,
    })

    for await (const reply of replies) {
      res.end(reply.buffer)
      return
    }
  }
}

export function FileResponses({ url, method, buffer }) {
  if (typeof url != "string") return
  if (buffer != Buffer) return
  // if (method != "GET") return

  return {
    url,
    buffer,
  }
}
