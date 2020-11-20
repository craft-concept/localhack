import electron from "electron";
import * as project from "../../project.mjs";
const { app, BrowserWindow } = electron;
export const windows = send => {
    app.on("activate", onActivate);
    app.whenReady().then(onReady);
    function cleanup() {
        app.off("activate", onActivate);
    }
    return input => state => {
        var _a, _b, _c, _d, _e, _f, _g;
        (_a = state.appReady) !== null && _a !== void 0 ? _a : (state.appReady = false);
        (_b = state.windows) !== null && _b !== void 0 ? _b : (state.windows = {});
        const { windows } = state;
        (_c = windows.index) !== null && _c !== void 0 ? _c : (windows.index = new Map());
        (_d = windows.queue) !== null && _d !== void 0 ? _d : (windows.queue = []);
        if (input.appReady)
            state.appReady = true;
        if (input.windowClosedId)
            windows.index.delete(input.windowClosedId);
        if (input.window)
            windows.queue.push(input.window);
        if (!state.appReady)
            return;
        for (const id of (_e = input.closeWindows) !== null && _e !== void 0 ? _e : []) {
            (_f = state.windows.index.get(id)) === null || _f === void 0 ? void 0 : _f.close();
        }
        let req;
        while ((req = windows.queue.pop())) {
            const win = new BrowserWindow(Object.assign(Object.assign({}, req.options), { webPreferences: Object.assign(Object.assign({}, (_g = req.options) === null || _g === void 0 ? void 0 : _g.webPreferences), { preload: project.entry("preload.js"), 
                    // TODO(jeff): After switching to ES6 modules, this should be fixable
                    worldSafeExecuteJavaScript: false, nodeIntegration: true, contextIsolation: false }) }));
            win.loadFile(project.entry(req.src));
            if (req.openDevtools)
                win.webContents.openDevTools();
            const id = String(win.id);
            win.on("closed", () => send({ windowClosedId: id }));
            state.windows.index.set(id, Object.assign({ id }, req));
        }
    };
    function onActivate() {
        send({ appActivated: true });
    }
    function onReady() {
        send({ appReady: true });
    }
};
