export default class Mime {
  static ext(contentType) {
    switch (contentType) {
      case "text/html":
        return ".html"

      case "application/javascript":
        return ".mjs"
    }
  }

  static withExt(path, contentType) {
    if (/\.\w+$/.test(path)) return path
    let ext = this.ext(contentType)
    return ext ? `${path}${ext}` : path
  }
}
