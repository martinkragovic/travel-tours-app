'use client';

import { AdminProtected } from '../AdminProtected';
import { AdminShell } from '../AdminShell';
import { AdminCountriesManager } from './AdminCountriesManager';

export function AdminCountriesPage() {
  return (
    <AdminProtected>
      {(user) => (
        <AdminShell user={user}>
          <AdminCountriesManager />
        </AdminShell>
      )}
    </AdminProtected>
  );
}