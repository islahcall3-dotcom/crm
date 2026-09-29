import {
  sqliteTable,
  text,
  integer,
  real
} from 'drizzle-orm/sqlite-core';

// Reference Tables
export const governorates = sqliteTable('governorates', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
});

export const cities = sqliteTable('cities', {
  id: text('id').primaryKey(),
  governorateId: text('governorate_id').notNull().references(() => governorates.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
});

export const filterTypes = sqliteTable('filter_types', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
});

export const maintenanceIntervals = sqliteTable('maintenance_intervals', {
  id: text('id').primaryKey(),
  months: integer('months').notNull().unique(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
});

// 1. Users
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  plainPassword: text('plain_password'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  role: text('role').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  version: integer('version').default(1).notNull()
});

// 2. Sessions
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  idleExpiresAt: integer('idle_expires_at', { mode: 'timestamp' }).notNull(),
});

// 3. Customers
export const customers = sqliteTable('customers', {
  id: text('id').primaryKey(),
  customerCode: integer('customer_code').notNull().unique(),
  name: text('name').notNull(),
  phone1: text('phone_1').notNull(),
  phone2: text('phone_2'),
  landline: text('landline'),
  governorateId: text('governorate_id').notNull().references(() => governorates.id),
  cityId: text('city_id').notNull().references(() => cities.id),
  village: text('village'),
  addressDetails: text('address_details'),
  filterTypeId: text('filter_type_id').references(() => filterTypes.id),
  maintenanceIntervalId: text('maintenance_interval_id').notNull().references(() => maintenanceIntervals.id),
  lastMaintenanceDate: text('last_maintenance_date'),
  nextMaintenanceDate: text('next_maintenance_date'),
  notes: text('notes'),
  isDeleted: integer('is_deleted', { mode: 'boolean' }).default(false).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  version: integer('version').default(1).notNull()
});

// 4. Employees
export const employees = sqliteTable('employees', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  isTechnician: integer('is_technician', { mode: 'boolean' }).default(true).notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
});

// 5. Visits
export const visits = sqliteTable('visits', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  employeeId: text('employee_id').references(() => employees.id, { onDelete: 'restrict' }),
  visitDate: text('visit_date').notNull(),
  workflowStatus: text('workflow_status').notNull(),
  isBaseline: integer('is_baseline', { mode: 'boolean' }).default(false).notNull(),
  item1: integer('item_1', { mode: 'boolean' }).default(false).notNull(),
  item2: integer('item_2', { mode: 'boolean' }).default(false).notNull(),
  item3: integer('item_3', { mode: 'boolean' }).default(false).notNull(),
  itemPost: integer('item_post', { mode: 'boolean' }).default(false).notNull(),
  itemCalcium: integer('item_calcium', { mode: 'boolean' }).default(false).notNull(),
  itemInfrared: integer('item_infrared', { mode: 'boolean' }).default(false).notNull(),
  itemSalts: integer('item_salts', { mode: 'boolean' }).default(false).notNull(),
  notes: text('notes'),
  isDeleted: integer('is_deleted', { mode: 'boolean' }).default(false).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  version: integer('version').default(1).notNull()
});

// 6. Installments (الأقساط)
export const installments = sqliteTable('installments', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  amount: real('amount').notNull(),
  dueDate: text('due_date').notNull(),
  isPaid: integer('is_paid', { mode: 'boolean' }).default(false).notNull(),
  paidDate: text('paid_date'),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// 7. Expenses (المصروفات)
export const expenses = sqliteTable('expenses', {
  id: text('id').primaryKey(),
  amount: real('amount').notNull(),
  category: text('category').notNull(), // e.g. رواتب, بنزين, إيجار
  description: text('description').notNull(),
  expenseDate: text('expense_date').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// 8. Inventory (المخزون)
export const inventory = sqliteTable('inventory', {
  id: text('id').primaryKey(),
  itemName: text('item_name').notNull(),
  category: text('category').default('spare'),
  quantity: integer('quantity').notNull().default(0),
  unitPrice: real('unit_price').notNull().default(0),
});

// 9. Audit Logs
export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  entityName: text('entity_name').notNull(),
  entityId: text('entity_id').notNull(),
  action: text('action').notNull(),
  oldValues: text('old_values', { mode: 'json' }),
  newValues: text('new_values', { mode: 'json' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// 10. System Settings (Store key-value configuration such as company profile, print headers, alerts)
export const systemSettings = sqliteTable('system_settings', {
  key: text('key').primaryKey(),
  value: text('value', { mode: 'json' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});
