'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect page: /notifications → /{role}/notifications
export default function NotificationsRedirect() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace('/login');
      } else if (user.role === 'Student') {
        router.replace('/student/notifications');
      } else {
        router.replace('/lecturer/notifications');
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-spin h-8 w-8 border-b-2 border-indigo-500 rounded-full"></div>
    </div>
  );
}
