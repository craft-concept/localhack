import clipboardy from "clipboardy"

export default class Clipboard {
  static async copy(input) {
    return clipboardy.write(input)
  }

  static async paste() {
    return clipboardy.read(input)
  }
}
