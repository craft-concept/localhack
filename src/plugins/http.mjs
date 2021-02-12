import { createServer } from "http"

export function httpServer(input) {
  return send => {
    this.server ??= createServer((req, res) => {
      send({ http: { req, res } })
    })

    if (!this.server.listening) http.server.listen((this.port ??= 3000))
  }
}

export function simpleHttp(input) {
  if (!input.http) return
  const { req, res } = input.http

  return async send => {
    const replies = send({
      request: {
        url: req.url,
        method: req.method,
        headers: req.headers,
      },
    })

    for await (const reply of replies) {
      if (typeof reply.text === "string") {
        res.end(reply.text)
        return
      }
    }
  }
}

export const all = [httpServer, simpleHttp]
