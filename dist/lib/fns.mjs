var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
export function makeFn(fn, _a) {
    var { name } = _a, props = __rest(_a, ["name"]);
    const fn2 = copyFn(fn, name);
    return Object.assign(fn2, props);
}
/**
 * Add properties to a function.
 */
export function fnWith(_a, fn) {
    var { name } = _a, props = __rest(_a, ["name"]);
    Object.defineProperty(fn, "name", { value: name });
    return Object.assign(fn, props);
}
/**
 * Duplicates a function, preserving its name and properties.
 */
export function copyFn(fn, name = fn.name) {
    const clone = function cloned(...args) {
        return fn.apply(this, args);
    };
    Object.defineProperty(clone, "name", { value: name });
    return Object.assign(clone, fn);
}
/** Partially apply a function */
export const pre = (fn, ...parts) => (...args) => fn(...parts, ...args);
