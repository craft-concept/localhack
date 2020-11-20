export function make(plugin) {
    var _a;
    let state = plugin.init();
    const store = {
        plugin,
        dispatching: false,
        get state() {
            if (store.dispatching)
                throw new Error("Cannot access state during dispatch");
            return state;
        },
        dispatch,
    };
    const listener = makeListener((_a = plugin.engine) === null || _a === void 0 ? void 0 : _a.call(plugin, store.dispatch));
    function dispatch(action) {
        var _a, _b;
        if (store.dispatching)
            throw new Error(`Already dispatching. Dispatching ${JSON.stringify(action)}`);
        if (action != null) {
            store.dispatching = true;
            state = (_b = (_a = plugin.update(action)) === null || _a === void 0 ? void 0 : _a(state)) !== null && _b !== void 0 ? _b : state;
            store.dispatching = false;
        }
        listener(state);
        return state;
    }
    return store;
}
export function makeListener(listener) {
    if (typeof listener === "function")
        return listener;
    let prevState = undefined;
    let onState = (state) => {
        prevState = state;
    };
    listener.then(cb => {
        onState = cb;
        prevState !== undefined && onState(prevState);
    });
    return state => onState(state);
}
