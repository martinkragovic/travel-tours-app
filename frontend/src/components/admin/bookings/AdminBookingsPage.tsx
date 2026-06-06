'use client';

import { AdminProtected } from '../AdminProtected';
import { AdminShell } from '../AdminShell';
import { AdminBookingsTable } from './AdminBookingsTable';

export function AdminBookingsPage() {
  return (
    <AdminProtected>
      {(user) => (
        <AdminShell user={user}>
          <AdminBookingsTable />
        </AdminShell>
      )}
    </AdminProtected>
  );
}