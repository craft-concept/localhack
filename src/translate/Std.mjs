import Translate, { T } from "lib/Translate"

Translate.shape("parse", T.Any)
  .shape("int", Number)
  .shape("float", Number)
  .shape("string", String)

Translate.register("string", Number, String)
  .register("int", String, x => parseInt(x, 10))
  .register("float", String, parseFloat)

Translate.register?.test(({ eq }) => {
  eq(Translate.int("042.32").first, 42)
  eq(Translate.float("042.32").first, 42.32)
})
