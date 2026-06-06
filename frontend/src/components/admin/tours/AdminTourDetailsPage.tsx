'use client';

import { AdminProtected } from '../AdminProtected';
import { AdminShell } from '../AdminShell';
import { AdminTourDetailsManager } from './AdminTourDetailsManager';

export function AdminTourDetailsPage() {
  return (
    <AdminProtected>
      {(user) => (
        <AdminShell user={user}>
          <AdminTourDetailsManager />
        </AdminShell>
      )}
    </AdminProtected>
  );
}