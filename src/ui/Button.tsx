import { fn, T } from "../lib"

export const Button = {
  primary: Boolean,
  secondary: Boolean,
  tertiary: Boolean,
  content: [T.Any],
}

// export const Button = ui("Button").mod("primary", "secondary", "tertiary")

export default fn(Button, props => {})
