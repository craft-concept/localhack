import { register } from "../lib/ui.mjs"
import { UiButton } from "../components/ui-button/UiButton.mjs"

console.log("Hello from the renderer thread!")

register(UiButton)
