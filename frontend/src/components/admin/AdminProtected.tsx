'use client';

import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { getCurrentAdmin } from '@/lib/api';
import { getAdminToken, removeAdminToken } from '@/lib/auth-token';
import type { AdminUser } from '@/types/api';

type AdminProtectedProps = {
  children: (user: AdminUser) => ReactNode;
};

export function AdminProtected({ children }: AdminProtectedProps) {
  const router = useRouter();

  const [user, setUser] = useState<AdminUser | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const token = getAdminToken();

      if (!token) {
        router.replace('/admin/login');
        return;
      }

      try {
        const currentUser = await getCurrentAdmin(token);

        if (currentUser.role !== 'ADMIN') {
          removeAdminToken();
          router.replace('/admin/login');
          return;
        }

        setUser(currentUser);
      } catch {
        removeAdminToken();
        router.replace('/admin/login');
      } finally {
        setIsChecking(false);
      }
    }

    checkAuth();
  }, [router]);

  if (isChecking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#4f523b] px-6">
        <div className="rounded-2xl bg-[#eeeeec] p-8 text-center shadow-xl">
          <p className="text-xl font-black uppercase tracking-wide">
            Проверяем доступ...
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return children(user);
}