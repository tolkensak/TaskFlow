// frontend/src/hooks/useNotifications.ts

"use client";

import { useEffect, useState } from "react";
import { useSubscription, gql } from "@apollo/client";

const NOTIFICATION_RECEIVED = gql`
    subscription NotificationReceived {
        notificationReceived {
            id
            type
            message
            read
            createdAt
            data
        }
    }
`;

export function useNotifications() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const { data, error } = useSubscription(NOTIFICATION_RECEIVED);

    useEffect(() => {
        if (data?.notificationReceived) {
            setNotifications((prev) => [data.notificationReceived, ...prev]);
            setUnreadCount((prev) => prev + 1);
        }
    }, [data]);

    const markAsRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
    };

    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    return {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
    };
}
