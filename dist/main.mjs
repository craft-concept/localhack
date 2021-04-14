// .hack/build/src/entries/main.mjs
import {make} from "../lib/Sift.mjs";
import {current} from "../lib/edit.mjs";
import {standard, debugging} from "../plugins/std.mjs";
import {windows as windows2} from "../plugins/windows.mjs";
var send = make();
send(standard, debugging, windows2(send));
send({
  window: {
    src: "index.html",
    openDevtools: true,
    options: {}
  }
});
