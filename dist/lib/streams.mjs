import { producerStream } from "@funkia/hareactive";
export { Future, Stream, producerStream as produce } from "@funkia/hareactive";
export function eventArgsStream(target, name) {
    return producerStream(push => {
        const onEvent = (...args) => push(args);
        target.on(name, onEvent);
        return () => {
            target.off(name, onEvent);
        };
    });
}
