import { makeFn } from "./fns.mjs";
export function spool(desc) {
    function Spool(v) {
        if (!(this instanceof Spool))
            return new Spool(v);
        this.v = v;
    }
    const proto = (Spool.prototype = {
        valueOf() {
            return this.v;
        },
        toString() {
            return String(this.v);
        },
        toJSON() {
            return this.v;
        },
    });
    for (const k in desc)
        proto[k] = makeFn(function fn(...args) {
            return Spool(desc[k](...args)(this.v));
        }, {
            name: k,
        });
    return Spool;
}
export async function tests() {
    const { deepEqual } = await import("./testing.mjs");
    const num = spool({
        add: x => (s) => s + x,
        sub: x => (s) => s - x,
    });
    deepEqual(+num(3).add(4).sub(1), 6);
}
