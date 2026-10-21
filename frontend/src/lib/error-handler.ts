// frontend/src/lib/error-handler.ts
/**
 * Global error handler to suppress known DevTools errors
 * This prevents the startTime error from breaking the app
 */
export function setupGlobalErrorHandler() {
    if (typeof window === "undefined") return;

    // ✅ Save the original error handler
    const originalOnError = window.onerror;

    // ✅ Override window.onerror to filter out DevTools errors
    window.onerror = (message, source, lineno, colno, error) => {
        if (
            typeof message === "string" &&
            (message.includes("startTime") ||
                message.includes("Cannot read properties of undefined"))
        ) {
            return true; // suppress
        }
        if (originalOnError) {
            return originalOnError(message, source, lineno, colno, error);
        }
        return false;
    };

    // ✅ Override console.error
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
        const errorString = args
            .map((arg) => (typeof arg === "string" ? arg : arg?.message || ""))
            .join(" ");

        if (
            errorString.includes("startTime") ||
            errorString.includes("Cannot read properties of undefined")
        ) {
            return; // suppress
        }
        originalConsoleError.apply(console, args);
    };

    // ✅ Override window.addEventListener for unhandled rejections
    //    NOTE: parameter is `Event`, then we narrow inside
    const originalAddEventListener = window.addEventListener;
    window.addEventListener = function (
        type: string,
        listener: any,
        options?: any,
    ) {
        if (type === "unhandledrejection") {
            const wrappedListener = (event: Event) => {
                const reason = (event as PromiseRejectionEvent).reason as
                    | { message?: string }
                    | undefined;

                if (
                    reason &&
                    typeof reason === "object" &&
                    reason.message &&
                    (reason.message.includes("startTime") ||
                        reason.message.includes(
                            "Cannot read properties of undefined",
                        ))
                ) {
                    event.preventDefault();
                    return;
                }
                return listener(event);
            };
            return originalAddEventListener.call(
                this,
                type,
                wrappedListener,
                options,
            );
        }
        return originalAddEventListener.call(this, type, listener, options);
    };
}
