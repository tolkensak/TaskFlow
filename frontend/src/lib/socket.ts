// frontend/src/lib/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let currentUserId: string | null = null;
let currentUsername: string | null = null;

/**
 * Get or create a Socket.IO connection
 * Only creates a new connection if userId or username changed
 */
export const getSocket = (userId: string, username: string): Socket => {
    // ✅ If the socket exists and the user is the same, reuse it
    if (socket && currentUserId === userId && currentUsername === username) {
        return socket;
    }

    // ✅ If the socket exists but the user changed, disconnect first
    if (socket) {
        socket.disconnect();
        socket = null;
    }

    // ✅ Store current user info
    currentUserId = userId;
    currentUsername = username;

    // ✅ Create new socket
    socket = io("http://localhost:3001/presence", {
        query: {
            userId,
            username,
        },
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
    });

    return socket;
};

/**
 * Disconnect the socket and clean up
 */
export const disconnectSocket = (): void => {
    if (socket) {
        socket.disconnect();
        socket = null;
        currentUserId = null;
        currentUsername = null;
    }
};
