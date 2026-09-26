export const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  TECHNICIAN: 'TECHNICIAN',
  DATA_ENTRY: 'DATA_ENTRY'
} as const;

export type Role = keyof typeof ROLES;

const PERMISSIONS = {
  [ROLES.ADMIN]: [
    'users.view', 'users.manage', 'roles.view', 'roles.manage',
    'customers.view', 'customers.create', 'customers.update', 'customers.delete', 'customers.import',
    'visits.view', 'visits.create', 'reports.view', 'reports.export', 'settings.update', 'audit.view',
    'employees.view', 'employees.create', 'employees.update', 'employees.delete',
    'inventory.view', 'inventory.create', 'inventory.update', 'inventory.delete',
    'installments.view', 'installments.create', 'installments.update', 'installments.delete',
    'expenses.view', 'expenses.create', 'expenses.update', 'expenses.delete'
  ],
  [ROLES.MANAGER]: [
    'customers.view', 'customers.create', 'customers.update',
    'visits.view', 'visits.create', 'reports.view', 'reports.export',
    'employees.view', 'inventory.view', 'installments.view', 'expenses.view', 'expenses.create'
  ],
  [ROLES.TECHNICIAN]: [
    'customers.view', 'visits.view', 'visits.create', 'inventory.view'
  ],
  [ROLES.DATA_ENTRY]: [
    'customers.view', 'customers.create', 'customers.update',
    'visits.view', 'visits.create', 'installments.view', 'installments.create',
    'expenses.view', 'expenses.create'
  ]
};

export function getRolePermissions(role: string): string[] {
  return PERMISSIONS[role as Role] || [];
}

export function hasPermission(role: string, permission: string): boolean {
  return getRolePermissions(role).includes(permission);
}
