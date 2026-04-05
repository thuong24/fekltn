'use client';

import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function TBMLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    } else if (!isLoading && user && user.role !== 'TBM') {
      router.push(`/${user.role.toLowerCase()}/dashboard`);
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) return <div className="flex h-screen items-center justify-center">Đang tải...</div>;

  return (
    <div className="flex min-h-screen bg-[var(--bg-color)]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
