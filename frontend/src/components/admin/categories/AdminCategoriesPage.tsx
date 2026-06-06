'use client';

import { AdminProtected } from '../AdminProtected';
import { AdminShell } from '../AdminShell';
import { AdminCategoriesManager } from './AdminCategoriesManager';

export function AdminCategoriesPage() {
  return (
    <AdminProtected>
      {(user) => (
        <AdminShell user={user}>
          <AdminCategoriesManager />
        </AdminShell>
      )}
    </AdminProtected>
  );
}