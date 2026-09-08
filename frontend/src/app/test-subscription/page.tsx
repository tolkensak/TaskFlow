// frontend/src/app/test-subscription/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSubscription, gql } from '@apollo/client';

const NOTIFICATION_RECEIVED = gql`
  subscription NotificationReceived($userId: String!) {
    notificationReceived(userId: $userId) {
      id
      type
      message
      read
      createdAt
    }
  }
`;

export default function TestSubscriptionPage() {
  const [userId] = useState('976a2dde-02a8-4a50-adb0-b61cbb2f5858');
  const [notifications, setNotifications] = useState<any[]>([]);

  const { data, error, loading } = useSubscription(NOTIFICATION_RECEIVED, {
    variables: { userId },
    onData: ({ data }) => {
      if (data?.data?.notificationReceived) {
        setNotifications(prev => [data.data.notificationReceived, ...prev]);
      }
    },
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Subscriptions</h1>
      <p className="mb-4">User ID: {userId}</p>
      <p className="mb-4">Status: {loading ? 'Connecting...' : 'Connected'}</p>
      {error && <p className="text-red-500">Error: {error.message}</p>}
      <div className="space-y-2">
        {notifications.map((n) => (
          <div key={n.id} className="p-3 border rounded-lg">
            <p className="font-semibold">{n.type}</p>
            <p>{n.message}</p>
            <p className="text-sm text-gray-500">{new Date(n.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
