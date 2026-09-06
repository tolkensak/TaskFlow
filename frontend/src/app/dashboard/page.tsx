// frontend/src/app/dashboard/page.tsx

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
// ✅ Import from the correct path for Apollo Client v3.8
import { useQuery } from '@apollo/client';
import { GET_ME } from '@/graphql/queries/user';

export default function DashboardPage() {
    const router = useRouter();
    const { loading, error, data } = useQuery(GET_ME, {
        fetchPolicy: "network-only",
    });

    useEffect(() => {
        if (error) {
            router.push("/login");
        }
    }, [error, router]);

    // ... rest of the component
}
