export default class Mailbox {
  static get inbox() {
    return (this._inbox ??= this.select({ to: "@me" }))
  }

  static get outbox() {
    return (this._outbox ??= this.select({ from: "@me" }))
  }

  static send({ to }, ...body) {}
  static select(pattern) {}
}
