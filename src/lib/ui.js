export { html, render } from "../../node_modules/lit-html/lit-html.js"

export function register(Comp) {
  if (superclass(Comp) === HTMLElement) {
    customElements.define(tagName(Comp), Comp)
  } else {
    customElements.define(tagName(Comp), Comp, { extends: extendsName(Comp) })
  }
}

export function tagName(Comp) {
  return Comp.tag ?? toTagName(Comp.name)
}

export function toTagName(name) {
  return name
    .replace(/^HTML|Element$/g, "")
    .replace(/([a-z])([A-Z]+)/g, "$1-$2")
    .toLowerCase()
}

export function superclass(Class) {
  return Object.getPrototypeOf(Class)
}

export function extendsName(Comp) {
  return tagName(superclass(Comp))
}
