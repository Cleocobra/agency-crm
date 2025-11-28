'use client';

import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { AddContractModal } from '@/components/AddContractModal';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();

    const handleLogout = () => {
        // In a real app, call logout API/action here
        // For now, just redirect
        router.push('/login');
    };

    return (
        <>
            <Layout
                onOpenNewContract={() => setIsModalOpen(true)}
                onLogout={handleLogout}
            >
                {children}
            </Layout>

            <AddContractModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    // Refresh data? 
                    // Since we don't have a global mutate here, the pages might need to re-fetch.
                    // We can use router.refresh() to re-run server components or trigger re-renders.
                    router.refresh();
                }}
            />
        </>
    );
}
