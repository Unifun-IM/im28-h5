export function createEventBus() {
    const handlers = new Map();
    return {
        on(eventName, handler) {
            const eventHandlers = handlers.get(eventName) ?? new Set();
            const normalizedHandler = handler;
            eventHandlers.add(normalizedHandler);
            handlers.set(eventName, eventHandlers);
            return () => {
                eventHandlers.delete(normalizedHandler);
                if (eventHandlers.size === 0) {
                    handlers.delete(eventName);
                }
            };
        },
        emit(eventName, payload) {
            const eventHandlers = handlers.get(eventName);
            if (!eventHandlers) {
                return;
            }
            for (const handler of [...eventHandlers]) {
                handler(payload);
            }
        },
        clear() {
            handlers.clear();
        },
    };
}
//# sourceMappingURL=events.js.map