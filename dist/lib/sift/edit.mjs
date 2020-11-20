import { test } from "../testing.mjs";
import { produce, isDraft, current as currentIm, original as originalIm, } from "immer";
export const isNil = x => x == null;
export const exists = x => x != null;
export const isObj = obj => obj != null &&
    typeof obj === "object" &&
    Object.getPrototypeOf(obj) === Object.prototype;
/**
 * Iterate over a collection of objects. Only Arrays and Sets are themselves also iterated.
 */
export function* iter(x) {
    if (x == null)
        return;
    if (Array.isArray(x) || x instanceof Set) {
        for (const xa of x)
            yield* iter(xa);
    }
    else {
        yield x;
    }
}
export function* fns(...x) {
    for (const v of iter(x))
        if (typeof x === "function")
            yield x;
}
/** Iterate over the keys of an object. */
export function* keys(obj) {
    if (isObj(obj))
        for (const k in obj)
            yield k;
}
/** Iterate over the entries of an object. */
export function* entries(obj) {
    if (isObj(obj))
        for (const k in obj)
            yield [k, obj[k]];
}
test(iter, ({ eq }) => {
    eq([...iter()], []);
    eq([...iter(null)], []);
    eq([...iter(undefined)], []);
    eq([...iter(1)], [1]);
    eq([...iter([1])], [1]);
    eq([...iter([1, [2, 3], 4])], [1, 2, 3, 4]);
});
/**
 * `iter` over the inputs, passing each through `fn`.
 */
export const iterMap = fn => function* iterMap(...xs) {
    for (const v of iter(xs))
        yield* iter(fn(v));
};
test(iterMap, ({ eq }) => {
    const inc = x => x + 1;
    const evenOnly = x => (x % 2 === 0 ? x : null);
    const incs = iterMap(inc);
    const evens = iterMap(evenOnly);
    eq([...incs()], []);
    eq([...incs([])], []);
    eq([...incs(null)], []);
    eq([...incs(undefined)], []);
    eq([...incs(1, 2, [3, [4]], 5)], [2, 3, 4, 5, 6]);
    eq([...incs(null, undefined, 1)], [2]);
    eq([...evens(1, 2, [3, [4]], 5)], [2, 4]);
});
/**
 * Returns a function that maps over its inputs, passing each through `fn`.
 */
export const iterate = fn => (...inputs) => {
    const out = [];
    for (const input of iter(inputs))
        out.push(...iter(fn(input)));
    return out;
};
export const DRAFT_STATE = Symbol.for("immer-state");
export const draftState = input => input[DRAFT_STATE];
export const isModified = input => { var _a; return (_a = draftState(input)) === null || _a === void 0 ? void 0 : _a.modified_; };
export const isOriginal = input => !isModified(input);
export const current = input => (isDraft(input) ? currentIm(input) : input);
export const original = input => (isDraft(input) ? originalIm(input) : input);
export function deepAssign(target, ...sources) {
    for (const source of sources)
        for (const k of keys(source))
            if (typeof target[k] === "object" && typeof source[k] === "object") {
                deepAssign(target[k], source[k]);
            }
            else {
                target[k] = source[k];
            }
    return target;
}
test(deepAssign, ({ eq }) => {
    const source = { a: { b: 2 } };
    eq(deepAssign({ a: 1, c: 3 }, source), { a: { b: 2 }, c: 3 });
});
test(isModified, ({ eq }) => {
    produce({ test: { a: 1 } }, obj => {
        eq(isModified(obj), false);
        eq(isModified(obj.test), false);
        obj.test.a = 2;
        eq(isModified(obj), true);
        eq(isModified(obj.test), true);
    });
});
