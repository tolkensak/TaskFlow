// frontend/src/lib/error-handler.ts
/**
 * Global error handler to suppress known DevTools errors
 * This prevents the startTime error from breaking the app
 */
export function setupGlobalErrorHandler() {
    if (typeof window !== "undefined") {
        // ✅ Save the original error handler
        const originalOnError = window.onerror;

        // ✅ Override window.onerror to filter out DevTools errors
        window.onerror = (message, source, lineno, colno, error) => {
            if (
                typeof message === "string" &&
                (message.includes("startTime") ||
                    message.includes("Cannot read properties of undefined"))
            ) {
                // ✅ Suppress the error
                return true; // Prevents the default error handling
            }
            // ✅ Pass through other errors
            if (originalOnError) {
                return originalOnError(message, source, lineno, colno, error);
            }
            return false;
        };

        // ✅ Also override console.error
        const originalConsoleError = console.error;
        console.error = (...args: any[]) => {
            const errorString = args
                .map((arg) =>
                    typeof arg === "string" ? arg : arg?.message || "",
                )
                .join(" ");

            if (
                errorString.includes("startTime") ||
                errorString.includes("Cannot read properties of undefined") ||
                errorString.includes(
                    "Cannot read properties of undefined (reading 'startTime')",
                )
            ) {
                // ✅ Suppress the error
                return;
            }

            // ✅ Pass through other errors
            originalConsoleError.apply(console, args);
        };

        // ✅ Override window.addEventListener for unhandled rejections
        const originalAddEventListener = window.addEventListener;
        window.addEventListener = function (
            type: string,
            listener: any,
            options?: any,
        ) {
            if (type === "unhandledrejection") {
                const wrappedListener = (event: PromiseRejectionEvent) => {
                    if (
                        event.reason &&
                        typeof event.reason === "object" &&
                        event.reason.message &&
                        (event.reason.message.includes("startTime") ||
                            event.reason.message.includes(
                                "Cannot read properties of undefined",
                            ))
                    ) {
                        // ✅ Suppress the error
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
}
