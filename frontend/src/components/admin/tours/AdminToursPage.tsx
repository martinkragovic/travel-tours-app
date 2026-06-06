'use client';

import { AdminProtected } from '../AdminProtected';
import { AdminShell } from '../AdminShell';
import { AdminToursManager } from './AdminToursManager';

export function AdminToursPage() {
  return (
    <AdminProtected>
      {(user) => (
        <AdminShell user={user}>
          <AdminToursManager />
        </AdminShell>
      )}
    </AdminProtected>
  );
}