import { register } from "../lib/ui.js";
import { UiButton } from "../components/ui-button/UiButton.js";
console.log("Hello from the renderer thread!");
register(UiButton);
