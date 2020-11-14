import { render, html } from "../../lib/ui.js"

export class UiButton extends HTMLElement {
  static template = html`
    <button @click=${() => console.log("hi")}><slot /></button>
  `

  constructor() {
    super()
    this.attachShadow({ mode: "open" })
    render(this.constructor.template, this.shadowRoot)
  }
}
