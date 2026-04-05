'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function TBMDashboard() {
  const router = useRouter();

  useEffect(() => {
    // TBM doesn't have a specific dashboard yet, redirect to Quota
    router.push('/tbm/quota');
  }, [router]);

  return <div className="p-8">Đang chuyển hướng đến quản lý Quota...</div>;
}
