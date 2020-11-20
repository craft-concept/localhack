var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
import fg from "fast-glob";
import chalk from "chalk";
import * as fs from "fs";
import { copyFile, mkdir, readFile, writeFile, stat } from "fs/promises";
import { dirname } from "path";
import ts from "typescript";
import * as project from "../../project.mjs";
import { current, exists, isNil, iter } from "../edit.mjs";
const { COPYFILE_FICLONE } = fs.constants;
/**
 * Plugin that turns globs into source files.
 */
export const glob = input => state => async (send) => {
    var e_1, _a;
    if (input.src)
        return;
    for (const glob of iter(input.glob))
        try {
            for (var _b = (e_1 = void 0, __asyncValues(fg.stream(project.find(glob), { dot: true }))), _c; _c = await _b.next(), !_c.done;) {
                const src = _c.value;
                send({ glob, src });
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) await _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
};
export const rename = file => {
    if (!file.src)
        return;
    if (file.dst)
        return;
    file.dst = file.src.replace(/\/src\//, "/build/").replace(/\.ts$/, ".mjs");
};
export const modified = file => {
    if (!file.src)
        return;
    if (!file.dst)
        return;
    if ("modified" in file)
        return;
    file = current(file);
    return state => async (send) => {
        const src = await stat(file.src);
        try {
            const dst = await stat(file.dst);
            if (src.mtimeMs < dst.mtimeMs) {
                return send(Object.assign(Object.assign({}, file), { modified: false }));
            }
        }
        catch (e) { }
        console.log(`${chalk.yellow("Change")}: src/${project.file(file.src)}`);
        send(Object.assign(Object.assign({}, file), { modified: true }));
    };
};
/**
 * Plugin that copies source files.
 */
export const copy = file => state => {
    if (file.copied)
        return;
    if (!file.modified)
        return;
    if (!file.src)
        return;
    if (!file.dst)
        return;
    if (!/\.html$/.test(file.src))
        return;
    const { src, dst } = (file = current(file));
    return async (send) => {
        await mkdir(dirname(dst), { recursive: true });
        await copyFile(src, dst, COPYFILE_FICLONE);
        send(Object.assign(Object.assign({}, file), { dst, copied: true }));
    };
};
/**
 * Plugin that reads source files.
 */
export const source = file => state => {
    if (file.reading)
        return;
    if (!file.src)
        return;
    if (!file.modified)
        return;
    if (exists(file.source))
        return;
    file.reading = true;
    file = current(file);
    return async (send) => {
        const source = await readFile(file.src).then(String);
        send(Object.assign(Object.assign({}, file), { source }));
    };
};
/**
 * Plugin that reads source files.
 */
export const output = file => state => {
    if (file.written)
        return;
    if (!file.dst)
        return;
    if (isNil(file.output))
        return;
    const { dst, output } = (file = current(file));
    return async (send) => {
        await mkdir(dirname(dst), { recursive: true });
        await writeFile(dst, output);
        console.log(`${chalk.green("Wrote")}:  ${project.file(dst)}`);
        send(Object.assign(Object.assign({}, file), { written: true }));
    };
};
/**
 * Plugin that compiles typescript files
 */
export const typescript = file => {
    if (exists(file.output))
        return;
    if (isNil(file.source))
        return;
    if (!/\.(mjs|js|ts)$/.test(file.src))
        return;
    const { source } = (file = current(file));
    return state => send => {
        const { outputText } = ts.transpileModule(source, {
            compilerOptions: {
                strictNullChecks: true,
                allowJs: true,
                lib: ["ES2019", "dom", "es2015"],
                target: "es2017",
                module: "es2020",
                moduleResolution: "node",
                jsx: "react",
                jsxFactory: "h",
                plugins: [{ name: "typescript-lit-html-plugin" }],
            },
        });
        send(Object.assign(Object.assign({}, file), { output: outputText }));
    };
};
export const watch = input => {
    if (input !== watch)
        return;
    return state => send => {
        state.watching = true;
        const watcher = fs.watch(project.src(), { recursive: true }, (event, path) => {
            if (event !== "change")
                return;
            const src = project.src(path);
            send({ src, watched: true });
        });
    };
};
export const all = [glob, rename, modified, copy, source, typescript, output];
