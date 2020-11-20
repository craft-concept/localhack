import { v4 as uuid } from "uuid";
import { current, original, deepAssign, entries } from "./edit.mjs";
/**
 * Makes the previous state available. More of a simple plugin example than a
 * useful thing.
 */
export const previous = input => state => {
    state.previous = Object.assign(Object.assign({}, original(state)), { previous: null });
};
/** Plugin that decorates the input with some additional metadata. */
export const metadata = input => {
    input.id || (input.id = uuid());
    input.ts || (input.ts = new Date().toISOString());
};
/** Plugin that allows aliasing this input as an alias field. */
export const alias = input => {
    if (typeof input.alias === "string")
        state[input.alias] = input;
};
/** Plugin that enables easy configuration. */
export const config = input => {
    if (typeof input.config !== "object")
        return;
    return state => {
        state.config || (state.config = {});
        deepAssign(state.config, input.config);
    };
};
/**
 * Adds input indexes and caches.
 */
export const memory = input => state => {
    state.index || (state.index = {});
    for (const [name, fn] of entries(input.index)) {
        state.index[name] = fn;
    }
    for (const [name, fn] of entries(state.index)) {
        state[name] || (state[name] = {});
        for (const key of iter(fn(input))) {
            state[name][key] || (state[name][key] = {});
            deepAssign(state[name][key], input);
        }
    }
};
/** Plugin that logs the input objects. */
export const trace = input => {
    console.log("input:", current(input));
};
/** The standard set of plugins. */
export const standard = [metadata, config, alias, memory];
/** Set of plugins for debugging. */
export const debugging = [trace, previous];
