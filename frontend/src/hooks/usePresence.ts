// frontend/src/hooks/usePresence.ts
"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { io, Socket } from "socket.io-client";

interface PresenceData {
    userId: string;
    username: string;
    projectId?: string;
    lastSeen: string;
    status: "online" | "away" | "offline";
}

// ✅ Singleton socket instance
let socket: Socket | null = null;

export function usePresence(userId: string, username: string) {
    const [onlineUsers, setOnlineUsers] = useState<PresenceData[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const isMounted = useRef(true);
    const userIdRef = useRef(userId);
    const usernameRef = useRef(username);

    // ✅ Update refs when props change
    userIdRef.current = userId;
    usernameRef.current = username;

    // ✅ Memoize the socket initialization
    const initializeSocket = useCallback(() => {
        // ✅ Only connect if we have valid userId and username
        if (
            !userIdRef.current ||
            !usernameRef.current ||
            userIdRef.current === "undefined"
        ) {
            return null;
        }

        // ✅ If socket doesn't exist or user changed, create a new one
        if (!socket || (socket as any).userId !== userIdRef.current) {
            if (socket) {
                socket.disconnect();
                socket = null;
            }

            socket = io("http://localhost:3001/presence", {
                query: {
                    userId: userIdRef.current,
                    username: usernameRef.current,
                },
                transports: ["websocket"],
                reconnection: true,
                reconnectionAttempts: 3,
                reconnectionDelay: 2000,
            });
            (socket as any).userId = userIdRef.current;
        }

        return socket;
    }, []);

    // ✅ Set up socket connection
    useEffect(() => {
        const socketInstance = initializeSocket();
        if (!socketInstance) return;

        const onConnect = () => {
            console.log("🔌 Presence socket connected");
            setIsConnected(true);
        };

        const onDisconnect = () => {
            console.log("🔌 Presence socket disconnected");
            setIsConnected(false);
        };

        const onOnlineUsers = (users: PresenceData[]) => {
            if (isMounted.current) {
                setOnlineUsers(users);
            }
        };

        const onUserOnline = ({
            userId: uid,
            username: uname,
        }: {
            userId: string;
            username: string;
        }) => {
            if (isMounted.current) {
                setOnlineUsers((prev) => {
                    if (prev.some((u) => u.userId === uid)) return prev;
                    return [
                        ...prev,
                        {
                            userId: uid,
                            username: uname,
                            status: "online",
                        } as PresenceData,
                    ];
                });
            }
        };

        const onUserOffline = ({ userId: uid }: { userId: string }) => {
            if (isMounted.current) {
                setOnlineUsers((prev) => prev.filter((u) => u.userId !== uid));
            }
        };

        // ✅ Register listeners
        socketInstance.on("connect", onConnect);
        socketInstance.on("disconnect", onDisconnect);
        socketInstance.on("onlineUsers", onOnlineUsers);
        socketInstance.on("userOnline", onUserOnline);
        socketInstance.on("userOffline", onUserOffline);

        // ✅ If socket is already connected, trigger connect event
        if (socketInstance.connected) {
            onConnect();
        }

        // ✅ Heartbeat - send a ping every 30 seconds
        const heartbeatInterval = setInterval(() => {
            if (socketInstance && socketInstance.connected) {
                socketInstance.emit("heartbeat");
            }
        }, 30000);

        // ✅ Cleanup
        return () => {
            clearInterval(heartbeatInterval);
            socketInstance.off("connect", onConnect);
            socketInstance.off("disconnect", onDisconnect);
            socketInstance.off("onlineUsers", onOnlineUsers);
            socketInstance.off("userOnline", onUserOnline);
            socketInstance.off("userOffline", onUserOffline);
        };
    }, [initializeSocket]);

    // ✅ Join project function
    const joinProject = useCallback((projectId: string) => {
        if (socket && socket.connected) {
            socket.emit("joinProject", projectId);
        }
    }, []);

    // ✅ Memoize the return value to prevent unnecessary re-renders
    return useMemo(
        () => ({
            onlineUsers,
            isConnected,
            joinProject,
        }),
        [onlineUsers, isConnected, joinProject],
    );
}
