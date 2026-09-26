var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc9) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc9 = __getOwnPropDesc(from, key)) || desc9.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// api/index-source.ts
var index_source_exports = {};
__export(index_source_exports, {
  default: () => index_source_default
});
module.exports = __toCommonJS(index_source_exports);

// server/src/server.ts
var import_fastify = __toESM(require("fastify"), 1);
var import_cors = __toESM(require("@fastify/cors"), 1);
var import_cookie = __toESM(require("@fastify/cookie"), 1);
var import_rate_limit = __toESM(require("@fastify/rate-limit"), 1);
var import_dotenv2 = __toESM(require("dotenv"), 1);
var import_path3 = __toESM(require("path"), 1);

// server/src/db/db.ts
var import_libsql = require("drizzle-orm/libsql");
var import_web = require("@libsql/client/web");
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var dbPath = import_path.default.resolve(process.cwd(), "elgammal.db");
if (!import_fs.default.existsSync(dbPath)) {
  const parentDb = import_path.default.resolve(process.cwd(), "../elgammal.db");
  if (import_fs.default.existsSync(parentDb)) {
    dbPath = parentDb;
  }
}
import_dotenv.default.config();
var url = process.env.TURSO_DATABASE_URL || `libsql://dummy-fallback.turso.io`;
var authToken = process.env.TURSO_AUTH_TOKEN;
console.log("Connecting to database:", url.startsWith("libsql") ? "\u2601\uFE0F TURSO CLOUD" : "\u{1F4BB} LOCAL SQLITE");
var client = (0, import_web.createClient)({
  url,
  authToken
});
var db = (0, import_libsql.drizzle)(client, { schema: {} });

// server/src/server.ts
var import_drizzle_orm12 = require("drizzle-orm");

// server/src/db/schema.ts
var import_sqlite_core = require("drizzle-orm/sqlite-core");
var governorates = (0, import_sqlite_core.sqliteTable)("governorates", {
  id: (0, import_sqlite_core.text)("id").primaryKey(),
  name: (0, import_sqlite_core.text)("name").notNull().unique(),
  isActive: (0, import_sqlite_core.integer)("is_active", { mode: "boolean" }).default(true).notNull()
});
var cities = (0, import_sqlite_core.sqliteTable)("cities", {
  id: (0, import_sqlite_core.text)("id").primaryKey(),
  governorateId: (0, import_sqlite_core.text)("governorate_id").notNull().references(() => governorates.id, { onDelete: "cascade" }),
  name: (0, import_sqlite_core.text)("name").notNull(),
  isActive: (0, import_sqlite_core.integer)("is_active", { mode: "boolean" }).default(true).notNull()
});
var filterTypes = (0, import_sqlite_core.sqliteTable)("filter_types", {
  id: (0, import_sqlite_core.text)("id").primaryKey(),
  name: (0, import_sqlite_core.text)("name").notNull().unique(),
  isActive: (0, import_sqlite_core.integer)("is_active", { mode: "boolean" }).default(true).notNull()
});
var maintenanceIntervals = (0, import_sqlite_core.sqliteTable)("maintenance_intervals", {
  id: (0, import_sqlite_core.text)("id").primaryKey(),
  months: (0, import_sqlite_core.integer)("months").notNull().unique(),
  isActive: (0, import_sqlite_core.integer)("is_active", { mode: "boolean" }).default(true).notNull()
});
var users = (0, import_sqlite_core.sqliteTable)("users", {
  id: (0, import_sqlite_core.text)("id").primaryKey(),
  username: (0, import_sqlite_core.text)("username").notNull().unique(),
  passwordHash: (0, import_sqlite_core.text)("password_hash").notNull(),
  isActive: (0, import_sqlite_core.integer)("is_active", { mode: "boolean" }).default(true).notNull(),
  role: (0, import_sqlite_core.text)("role").notNull(),
  createdAt: (0, import_sqlite_core.integer)("created_at", { mode: "timestamp" }).notNull(),
  version: (0, import_sqlite_core.integer)("version").default(1).notNull()
});
var sessions = (0, import_sqlite_core.sqliteTable)("sessions", {
  id: (0, import_sqlite_core.text)("id").primaryKey(),
  userId: (0, import_sqlite_core.text)("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: (0, import_sqlite_core.integer)("expires_at", { mode: "timestamp" }).notNull(),
  idleExpiresAt: (0, import_sqlite_core.integer)("idle_expires_at", { mode: "timestamp" }).notNull()
});
var customers = (0, import_sqlite_core.sqliteTable)("customers", {
  id: (0, import_sqlite_core.text)("id").primaryKey(),
  customerCode: (0, import_sqlite_core.integer)("customer_code").notNull().unique(),
  name: (0, import_sqlite_core.text)("name").notNull(),
  phone1: (0, import_sqlite_core.text)("phone_1").notNull(),
  phone2: (0, import_sqlite_core.text)("phone_2"),
  landline: (0, import_sqlite_core.text)("landline"),
  governorateId: (0, import_sqlite_core.text)("governorate_id").notNull().references(() => governorates.id),
  cityId: (0, import_sqlite_core.text)("city_id").notNull().references(() => cities.id),
  village: (0, import_sqlite_core.text)("village"),
  addressDetails: (0, import_sqlite_core.text)("address_details"),
  filterTypeId: (0, import_sqlite_core.text)("filter_type_id").references(() => filterTypes.id),
  maintenanceIntervalId: (0, import_sqlite_core.text)("maintenance_interval_id").notNull().references(() => maintenanceIntervals.id),
  lastMaintenanceDate: (0, import_sqlite_core.text)("last_maintenance_date"),
  nextMaintenanceDate: (0, import_sqlite_core.text)("next_maintenance_date"),
  notes: (0, import_sqlite_core.text)("notes"),
  isDeleted: (0, import_sqlite_core.integer)("is_deleted", { mode: "boolean" }).default(false).notNull(),
  createdAt: (0, import_sqlite_core.integer)("created_at", { mode: "timestamp" }).notNull(),
  version: (0, import_sqlite_core.integer)("version").default(1).notNull()
});
var employees = (0, import_sqlite_core.sqliteTable)("employees", {
  id: (0, import_sqlite_core.text)("id").primaryKey(),
  name: (0, import_sqlite_core.text)("name").notNull(),
  isTechnician: (0, import_sqlite_core.integer)("is_technician", { mode: "boolean" }).default(true).notNull(),
  isActive: (0, import_sqlite_core.integer)("is_active", { mode: "boolean" }).default(true).notNull(),
  userId: (0, import_sqlite_core.text)("user_id").references(() => users.id, { onDelete: "set null" })
});
var visits = (0, import_sqlite_core.sqliteTable)("visits", {
  id: (0, import_sqlite_core.text)("id").primaryKey(),
  customerId: (0, import_sqlite_core.text)("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  employeeId: (0, import_sqlite_core.text)("employee_id").references(() => employees.id, { onDelete: "restrict" }),
  visitDate: (0, import_sqlite_core.text)("visit_date").notNull(),
  workflowStatus: (0, import_sqlite_core.text)("workflow_status").notNull(),
  isBaseline: (0, import_sqlite_core.integer)("is_baseline", { mode: "boolean" }).default(false).notNull(),
  item1: (0, import_sqlite_core.integer)("item_1", { mode: "boolean" }).default(false).notNull(),
  item2: (0, import_sqlite_core.integer)("item_2", { mode: "boolean" }).default(false).notNull(),
  item3: (0, import_sqlite_core.integer)("item_3", { mode: "boolean" }).default(false).notNull(),
  itemPost: (0, import_sqlite_core.integer)("item_post", { mode: "boolean" }).default(false).notNull(),
  itemCalcium: (0, import_sqlite_core.integer)("item_calcium", { mode: "boolean" }).default(false).notNull(),
  itemInfrared: (0, import_sqlite_core.integer)("item_infrared", { mode: "boolean" }).default(false).notNull(),
  itemSalts: (0, import_sqlite_core.integer)("item_salts", { mode: "boolean" }).default(false).notNull(),
  notes: (0, import_sqlite_core.text)("notes"),
  isDeleted: (0, import_sqlite_core.integer)("is_deleted", { mode: "boolean" }).default(false).notNull(),
  createdAt: (0, import_sqlite_core.integer)("created_at", { mode: "timestamp" }).notNull(),
  version: (0, import_sqlite_core.integer)("version").default(1).notNull()
});
var installments = (0, import_sqlite_core.sqliteTable)("installments", {
  id: (0, import_sqlite_core.text)("id").primaryKey(),
  customerId: (0, import_sqlite_core.text)("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  amount: (0, import_sqlite_core.real)("amount").notNull(),
  dueDate: (0, import_sqlite_core.text)("due_date").notNull(),
  isPaid: (0, import_sqlite_core.integer)("is_paid", { mode: "boolean" }).default(false).notNull(),
  paidDate: (0, import_sqlite_core.text)("paid_date"),
  notes: (0, import_sqlite_core.text)("notes"),
  createdAt: (0, import_sqlite_core.integer)("created_at", { mode: "timestamp" }).notNull()
});
var expenses = (0, import_sqlite_core.sqliteTable)("expenses", {
  id: (0, import_sqlite_core.text)("id").primaryKey(),
  amount: (0, import_sqlite_core.real)("amount").notNull(),
  category: (0, import_sqlite_core.text)("category").notNull(),
  // e.g. رواتب, بنزين, إيجار
  description: (0, import_sqlite_core.text)("description").notNull(),
  expenseDate: (0, import_sqlite_core.text)("expense_date").notNull(),
  createdAt: (0, import_sqlite_core.integer)("created_at", { mode: "timestamp" }).notNull()
});
var inventory = (0, import_sqlite_core.sqliteTable)("inventory", {
  id: (0, import_sqlite_core.text)("id").primaryKey(),
  itemName: (0, import_sqlite_core.text)("item_name").notNull().unique(),
  category: (0, import_sqlite_core.text)("category").default("spare"),
  quantity: (0, import_sqlite_core.integer)("quantity").notNull().default(0),
  unitPrice: (0, import_sqlite_core.real)("unit_price").notNull().default(0)
});
var auditLogs = (0, import_sqlite_core.sqliteTable)("audit_logs", {
  id: (0, import_sqlite_core.text)("id").primaryKey(),
  userId: (0, import_sqlite_core.text)("user_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  entityName: (0, import_sqlite_core.text)("entity_name").notNull(),
  entityId: (0, import_sqlite_core.text)("entity_id").notNull(),
  action: (0, import_sqlite_core.text)("action").notNull(),
  oldValues: (0, import_sqlite_core.text)("old_values", { mode: "json" }),
  newValues: (0, import_sqlite_core.text)("new_values", { mode: "json" }),
  createdAt: (0, import_sqlite_core.integer)("created_at", { mode: "timestamp" }).notNull()
});
var systemSettings = (0, import_sqlite_core.sqliteTable)("system_settings", {
  key: (0, import_sqlite_core.text)("key").primaryKey(),
  value: (0, import_sqlite_core.text)("value", { mode: "json" }).notNull(),
  updatedAt: (0, import_sqlite_core.integer)("updated_at", { mode: "timestamp" }).notNull()
});

// server/src/routes/auth.ts
var import_drizzle_orm2 = require("drizzle-orm");

// server/src/utils/auth.ts
var import_crypto = __toESM(require("crypto"), 1);
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
var import_drizzle_orm = require("drizzle-orm");
async function hashPassword(password) {
  return import_bcryptjs.default.hash(password, 10);
}
async function verifyPassword(password, hash) {
  return import_bcryptjs.default.compare(password, hash);
}
function generateSessionToken() {
  return import_crypto.default.randomBytes(32).toString("hex");
}
function hashSessionToken(token) {
  return import_crypto.default.createHash("sha256").update(token).digest("hex");
}
async function createSession(userId) {
  const token = generateSessionToken();
  const tokenHash = hashSessionToken(token);
  const maxAge = 7 * 24 * 60 * 60 * 1e3;
  const idleMaxAge = 1 * 24 * 60 * 60 * 1e3;
  await db.insert(sessions).values({
    id: tokenHash,
    userId,
    expiresAt: new Date(Date.now() + maxAge),
    idleExpiresAt: new Date(Date.now() + idleMaxAge)
  });
  return { token, maxAge };
}
async function invalidateSession(token) {
  const tokenHash = hashSessionToken(token);
  await db.delete(sessions).where((0, import_drizzle_orm.eq)(sessions.id, tokenHash));
}
async function verifyAuth(request, reply) {
  const sessionId = request.cookies.sessionId;
  if (!sessionId) {
    return reply.status(401).send({ error: "\u063A\u064A\u0631 \u0645\u0635\u0631\u062D" });
  }
  const tokenHash = hashSessionToken(sessionId);
  const sessionList = await db.select().from(sessions).where((0, import_drizzle_orm.eq)(sessions.id, tokenHash));
  const session = sessionList[0];
  if (!session || new Date(session.expiresAt) < /* @__PURE__ */ new Date()) {
    reply.clearCookie("sessionId", { path: "/" });
    return reply.status(401).send({ error: "\u0627\u0646\u062A\u0647\u062A \u0627\u0644\u062C\u0644\u0633\u0629" });
  }
  const userList = await db.select().from(users).where((0, import_drizzle_orm.eq)(users.id, session.userId));
  const user = userList[0];
  if (!user || !user.isActive) {
    reply.clearCookie("sessionId", { path: "/" });
    return reply.status(401).send({ error: "\u062D\u0633\u0627\u0628\u0643 \u0645\u0639\u0637\u0644 \u0623\u0648 \u0645\u062D\u0630\u0648\u0641" });
  }
  request.user = user;
}

// server/src/utils/rbac.ts
var ROLES = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  TECHNICIAN: "TECHNICIAN",
  DATA_ENTRY: "DATA_ENTRY"
};
var PERMISSIONS = {
  [ROLES.ADMIN]: [
    "users.view",
    "users.manage",
    "roles.view",
    "roles.manage",
    "customers.view",
    "customers.create",
    "customers.update",
    "customers.delete",
    "customers.import",
    "visits.view",
    "visits.create",
    "reports.view",
    "reports.export",
    "settings.update",
    "audit.view",
    "employees.view",
    "employees.create",
    "employees.update",
    "employees.delete",
    "inventory.view",
    "inventory.create",
    "inventory.update",
    "inventory.delete",
    "installments.view",
    "installments.create",
    "installments.update",
    "installments.delete",
    "expenses.view",
    "expenses.create",
    "expenses.update",
    "expenses.delete"
  ],
  [ROLES.MANAGER]: [
    "customers.view",
    "customers.create",
    "customers.update",
    "visits.view",
    "visits.create",
    "reports.view",
    "reports.export",
    "employees.view",
    "inventory.view",
    "installments.view",
    "expenses.view",
    "expenses.create"
  ],
  [ROLES.TECHNICIAN]: [
    "customers.view",
    "visits.view",
    "visits.create",
    "inventory.view"
  ],
  [ROLES.DATA_ENTRY]: [
    "customers.view",
    "customers.create",
    "customers.update",
    "visits.view",
    "visits.create",
    "installments.view",
    "installments.create",
    "expenses.view",
    "expenses.create"
  ]
};
function getRolePermissions(role) {
  return PERMISSIONS[role] || [];
}
function hasPermission(role, permission) {
  return getRolePermissions(role).includes(permission);
}

// server/src/routes/auth.ts
var import_zod = __toESM(require("zod"), 1);
var loginSchema = import_zod.default.object({
  username: import_zod.default.string().min(1),
  password: import_zod.default.string().min(1)
});
async function authRoutes(fastify2) {
  fastify2.post("/login", {
    config: {
      rateLimit: {
        max: 50,
        // Increased for development
        timeWindow: "1 minute"
      }
    }
  }, async (request, reply) => {
    try {
      const { username, password } = loginSchema.parse(request.body);
      const userList = await db.select().from(users).where((0, import_drizzle_orm2.eq)(users.username, username));
      const user = userList[0];
      if (!user || !user.isActive) {
        return reply.status(401).send({ error: "\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062F\u062E\u0648\u0644 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629 \u0623\u0648 \u0627\u0644\u062D\u0633\u0627\u0628 \u0645\u0639\u0637\u0644" });
      }
      const isValid = await verifyPassword(password, user.passwordHash);
      if (!isValid) {
        return reply.status(401).send({ error: "\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062F\u062E\u0648\u0644 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629" });
      }
      const { token, maxAge } = await createSession(user.id);
      reply.setCookie("sessionId", token, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: maxAge / 1e3
      });
      return { success: true, role: user.role };
    } catch (e) {
      console.error("Login error:", e);
      return reply.status(400).send({ error: "\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u0629" });
    }
  });
  fastify2.post("/logout", async (request, reply) => {
    const sessionId = request.cookies.sessionId;
    if (sessionId) {
      await invalidateSession(sessionId);
    }
    reply.clearCookie("sessionId", { path: "/" });
    return { success: true };
  });
  fastify2.get("/me", async (request, reply) => {
    const sessionId = request.cookies.sessionId;
    if (!sessionId) {
      return reply.status(401).send({ error: "\u063A\u064A\u0631 \u0645\u0635\u0631\u062D" });
    }
    const tokenHash = hashSessionToken(sessionId);
    const sessionList = await db.select().from(sessions).where((0, import_drizzle_orm2.eq)(sessions.id, tokenHash));
    const session = sessionList[0];
    if (!session || new Date(session.expiresAt) < /* @__PURE__ */ new Date()) {
      reply.clearCookie("sessionId", { path: "/" });
      return reply.status(401).send({ error: "\u0627\u0646\u062A\u0647\u062A \u0627\u0644\u062C\u0644\u0633\u0629" });
    }
    const userList = await db.select().from(users).where((0, import_drizzle_orm2.eq)(users.id, session.userId));
    const user = userList[0];
    if (!user || !user.isActive) {
      return reply.status(401).send({ error: "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F \u0623\u0648 \u0645\u0639\u0637\u0644" });
    }
    return {
      user: { id: user.id, username: user.username, role: user.role },
      permissions: getRolePermissions(user.role)
    };
  });
}

// server/src/routes/customers.ts
var import_drizzle_orm3 = require("drizzle-orm");
var import_zod2 = __toESM(require("zod"), 1);
var import_crypto2 = __toESM(require("crypto"), 1);

// server/src/utils/textUtils.ts
function normalizeArabic(text2) {
  if (!text2) return "";
  return text2.toString().trim().toLowerCase().replace(/[\u064B-\u065F\u0670]/g, "").replace(/[أإآٱ]/g, "\u0627").replace(/ة/g, "\u0647").replace(/ى/g, "\u064A");
}
function matchesSearch(target, query) {
  if (!query || !query.trim()) return true;
  if (target === null || target === void 0) return false;
  return normalizeArabic(String(target)).includes(normalizeArabic(query));
}
function matchesAnyField(targets, query) {
  if (!query || !query.trim()) return true;
  return targets.some((target) => matchesSearch(target, query));
}
function getArabicSearchVariants(query) {
  const q = query.trim();
  if (!q) return [];
  const variants = /* @__PURE__ */ new Set();
  variants.add(q);
  const bareAlef = q.replace(/[أإآٱ]/g, "\u0627");
  variants.add(bareAlef);
  variants.add(q.replace(/[ا]/g, "\u0623"));
  variants.add(q.replace(/[ا]/g, "\u0625"));
  variants.add(q.replace(/ة/g, "\u0647"));
  variants.add(q.replace(/ه/g, "\u0629"));
  variants.add(q.replace(/ي/g, "\u0649"));
  variants.add(q.replace(/ى/g, "\u064A"));
  return Array.from(variants);
}

// server/src/routes/customers.ts
var customerSchema = import_zod2.default.object({
  name: import_zod2.default.string().min(2),
  phone1: import_zod2.default.string().min(5),
  phone2: import_zod2.default.string().optional().nullable(),
  landline: import_zod2.default.string().optional().nullable(),
  governorateId: import_zod2.default.string().min(1),
  cityId: import_zod2.default.string().min(1),
  village: import_zod2.default.string().optional().nullable(),
  addressDetails: import_zod2.default.string().optional().nullable(),
  filterTypeId: import_zod2.default.string().optional().nullable(),
  maintenanceIntervalId: import_zod2.default.string().min(1),
  lastMaintenanceDate: import_zod2.default.string().optional().nullable(),
  notes: import_zod2.default.string().optional().nullable()
});
function uuidv4() {
  return import_crypto2.default.randomUUID();
}
function calculateNextMaintenance(lastDateStr, intervalMonths) {
  if (!lastDateStr) return null;
  const date = new Date(lastDateStr);
  if (isNaN(date.getTime())) return null;
  date.setMonth(date.getMonth() + intervalMonths);
  return date.toISOString().split("T")[0];
}
async function customerRoutes(fastify2) {
  fastify2.addHook("preHandler", verifyAuth);
  const requirePermission = (permission) => async (request, reply) => {
    if (!hasPermission(request.user.role, permission)) {
      return reply.status(403).send({ error: "\u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0644\u0625\u062C\u0631\u0627\u0621 \u0647\u0630\u0647 \u0627\u0644\u0639\u0645\u0644\u064A\u0629" });
    }
  };
  fastify2.get("/", {
    preHandler: [requirePermission("customers.view")]
  }, async (request, reply) => {
    const query = request.query.q || "";
    const govId = request.query.govId || "";
    const cityId = request.query.cityId || "";
    const filterTypeId = request.query.filterTypeId || "";
    const status = request.query.status || "";
    const fromDate = request.query.from || "";
    const toDate = request.query.to || "";
    const dateType = request.query.dateType || "nextMaintenance";
    const isArchived = request.query.isArchived === "true";
    const page = parseInt(request.query.page) || 1;
    const limit = 500;
    const offset = (page - 1) * limit;
    let conditions = isArchived ? [(0, import_drizzle_orm3.eq)(customers.isDeleted, true)] : [(0, import_drizzle_orm3.or)((0, import_drizzle_orm3.eq)(customers.isDeleted, false), import_drizzle_orm3.sql`${customers.isDeleted} IS NULL`)];
    if (query) {
      const isNumber = !isNaN(Number(query));
      const variants = getArabicSearchVariants(query);
      const orClauses = [];
      for (const v of variants) {
        orClauses.push((0, import_drizzle_orm3.like)(customers.name, `%${v}%`));
        orClauses.push((0, import_drizzle_orm3.like)(customers.phone1, `%${v}%`));
        orClauses.push((0, import_drizzle_orm3.like)(customers.phone2, `%${v}%`));
        orClauses.push((0, import_drizzle_orm3.like)(customers.village, `%${v}%`));
        orClauses.push((0, import_drizzle_orm3.like)(customers.notes, `%${v}%`));
      }
      if (isNumber) {
        orClauses.push((0, import_drizzle_orm3.eq)(customers.customerCode, Number(query)));
      }
      conditions.push((0, import_drizzle_orm3.or)(...orClauses));
    }
    if (govId) conditions.push((0, import_drizzle_orm3.eq)(customers.governorateId, govId));
    if (cityId) conditions.push((0, import_drizzle_orm3.eq)(customers.cityId, cityId));
    if (filterTypeId) conditions.push((0, import_drizzle_orm3.eq)(customers.filterTypeId, filterTypeId));
    if (status === "overdue") {
      conditions.push(import_drizzle_orm3.sql`${customers.nextMaintenanceDate} < date('now', 'localtime')`);
    } else if (status === "today") {
      conditions.push(import_drizzle_orm3.sql`${customers.nextMaintenanceDate} = date('now', 'localtime')`);
    } else if (status === "upcoming") {
      conditions.push(import_drizzle_orm3.sql`${customers.nextMaintenanceDate} > date('now', 'localtime') AND ${customers.nextMaintenanceDate} <= date('now', '+7 days', 'localtime')`);
    } else if (status === "valid") {
      conditions.push(import_drizzle_orm3.sql`${customers.nextMaintenanceDate} > date('now', '+7 days', 'localtime')`);
    }
    if (fromDate) {
      if (dateType === "created") {
        conditions.push(import_drizzle_orm3.sql`date(${customers.createdAt} / 1000, 'unixepoch', 'localtime') >= ${fromDate}`);
      } else if (dateType === "lastMaintenance") {
        conditions.push(import_drizzle_orm3.sql`${customers.lastMaintenanceDate} >= ${fromDate}`);
      } else {
        conditions.push(import_drizzle_orm3.sql`${customers.nextMaintenanceDate} >= ${fromDate}`);
      }
    }
    if (toDate) {
      if (dateType === "created") {
        conditions.push(import_drizzle_orm3.sql`date(${customers.createdAt} / 1000, 'unixepoch', 'localtime') <= ${toDate}`);
      } else if (dateType === "lastMaintenance") {
        conditions.push(import_drizzle_orm3.sql`${customers.lastMaintenanceDate} <= ${toDate}`);
      } else {
        conditions.push(import_drizzle_orm3.sql`${customers.nextMaintenanceDate} <= ${toDate}`);
      }
    }
    const results = await db.select().from(customers).where((0, import_drizzle_orm3.and)(...conditions)).limit(limit).offset(offset).orderBy((0, import_drizzle_orm3.desc)(customers.createdAt));
    const activeCountRes = await db.select({ count: import_drizzle_orm3.sql`COUNT(*)` }).from(customers).where((0, import_drizzle_orm3.eq)(customers.isDeleted, false));
    const archivedCountRes = await db.select({ count: import_drizzle_orm3.sql`COUNT(*)` }).from(customers).where((0, import_drizzle_orm3.eq)(customers.isDeleted, true));
    return {
      data: results,
      stats: {
        active: Number(activeCountRes[0]?.count || 0),
        archived: Number(archivedCountRes[0]?.count || 0)
      }
    };
  });
  fastify2.post("/", {
    preHandler: [requirePermission("customers.create")]
  }, async (request, reply) => {
    try {
      const data = customerSchema.parse(request.body);
      const intervalRow = await db.select().from(maintenanceIntervals).where((0, import_drizzle_orm3.eq)(maintenanceIntervals.id, data.maintenanceIntervalId));
      if (!intervalRow[0]) throw new Error("\u0641\u062A\u0631\u0629 \u0627\u0644\u0635\u064A\u0627\u0646\u0629 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u0629");
      const nextDate = data.lastMaintenanceDate ? calculateNextMaintenance(data.lastMaintenanceDate, intervalRow[0].months) : null;
      const maxCodeResult = await db.select({ maxCode: import_drizzle_orm3.sql`MAX(customer_code)` }).from(customers);
      const nextCode = (maxCodeResult[0]?.maxCode || 0) + 1;
      const customerId = uuidv4();
      await db.insert(customers).values({
        id: customerId,
        customerCode: nextCode,
        name: data.name,
        phone1: data.phone1,
        phone2: data.phone2,
        landline: data.landline,
        governorateId: data.governorateId,
        cityId: data.cityId,
        village: data.village,
        addressDetails: data.addressDetails,
        filterTypeId: data.filterTypeId,
        maintenanceIntervalId: data.maintenanceIntervalId,
        lastMaintenanceDate: data.lastMaintenanceDate,
        nextMaintenanceDate: nextDate,
        notes: data.notes,
        createdAt: /* @__PURE__ */ new Date()
      });
      return { success: true, id: customerId, customerCode: nextCode };
    } catch (err) {
      return reply.status(400).send({ error: err.message || "\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u0629" });
    }
  });
  fastify2.put("/:id", {
    preHandler: [requirePermission("customers.update")]
  }, async (request, reply) => {
    const { id } = request.params;
    try {
      const data = customerSchema.parse(request.body);
      const intervalRow = await db.select().from(maintenanceIntervals).where((0, import_drizzle_orm3.eq)(maintenanceIntervals.id, data.maintenanceIntervalId));
      if (!intervalRow[0]) throw new Error("\u0641\u062A\u0631\u0629 \u0627\u0644\u0635\u064A\u0627\u0646\u0629 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u0629");
      const nextDate = data.lastMaintenanceDate ? calculateNextMaintenance(data.lastMaintenanceDate, intervalRow[0].months) : null;
      await db.update(customers).set({
        name: data.name,
        phone1: data.phone1,
        phone2: data.phone2,
        landline: data.landline,
        governorateId: data.governorateId,
        cityId: data.cityId,
        village: data.village,
        addressDetails: data.addressDetails,
        filterTypeId: data.filterTypeId,
        maintenanceIntervalId: data.maintenanceIntervalId,
        lastMaintenanceDate: data.lastMaintenanceDate,
        nextMaintenanceDate: nextDate,
        notes: data.notes,
        version: import_drizzle_orm3.sql`version + 1`
      }).where((0, import_drizzle_orm3.eq)(customers.id, id));
      return { success: true };
    } catch (err) {
      return reply.status(400).send({ error: err.message || "\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u0629" });
    }
  });
  fastify2.get("/:id", {
    preHandler: [requirePermission("customers.view")]
  }, async (request, reply) => {
    const { id } = request.params;
    const custRes = await db.select().from(customers).where((0, import_drizzle_orm3.eq)(customers.id, id));
    if (!custRes[0]) return reply.status(404).send({ error: "\u0627\u0644\u0639\u0645\u064A\u0644 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
    const customer = custRes[0];
    const govs = await db.select().from(governorates).where((0, import_drizzle_orm3.eq)(governorates.id, customer.governorateId));
    const cits = await db.select().from(cities).where((0, import_drizzle_orm3.eq)(cities.id, customer.cityId));
    const filters = customer.filterTypeId ? await db.select().from(filterTypes).where((0, import_drizzle_orm3.eq)(filterTypes.id, customer.filterTypeId)) : [];
    const intervals = await db.select().from(maintenanceIntervals).where((0, import_drizzle_orm3.eq)(maintenanceIntervals.id, customer.maintenanceIntervalId));
    const visitsList = await db.select({
      id: visits.id,
      employeeId: visits.employeeId,
      visitDate: visits.visitDate,
      employeeName: employees.name,
      item1: visits.item1,
      item2: visits.item2,
      item3: visits.item3,
      itemPost: visits.itemPost,
      itemCalcium: visits.itemCalcium,
      itemInfrared: visits.itemInfrared,
      itemSalts: visits.itemSalts,
      notes: visits.notes
    }).from(visits).leftJoin(employees, (0, import_drizzle_orm3.eq)(visits.employeeId, employees.id)).where((0, import_drizzle_orm3.eq)(visits.customerId, id)).orderBy((0, import_drizzle_orm3.desc)(visits.visitDate));
    return {
      data: {
        ...customer,
        governorateName: govs[0]?.name || "",
        cityName: cits[0]?.name || "",
        filterTypeName: filters[0]?.name || "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F",
        maintenanceIntervalMonths: intervals[0]?.months || 0,
        visits: visitsList
      }
    };
  });
  fastify2.put("/:id/archive", {
    preHandler: [requirePermission("customers.delete")]
  }, async (request, reply) => {
    const { id } = request.params;
    await db.update(customers).set({ isDeleted: true }).where((0, import_drizzle_orm3.eq)(customers.id, id));
    return { success: true };
  });
  fastify2.put("/:id/restore", {
    preHandler: [requirePermission("customers.delete")]
  }, async (request, reply) => {
    const { id } = request.params;
    await db.update(customers).set({ isDeleted: false }).where((0, import_drizzle_orm3.eq)(customers.id, id));
    return { success: true };
  });
  fastify2.delete("/:id", {
    preHandler: [requirePermission("customers.delete")]
  }, async (request, reply) => {
    const { id } = request.params;
    await db.delete(customers).where((0, import_drizzle_orm3.eq)(customers.id, id));
    return { success: true };
  });
}

// server/src/routes/lookups.ts
async function lookupRoutes(fastify2) {
  fastify2.addHook("preHandler", verifyAuth);
  fastify2.get("/", async (request, reply) => {
    let govs = await db.select().from(governorates);
    let cits = await db.select().from(cities);
    const filters = await db.select().from(filterTypes);
    const intervals = await db.select().from(maintenanceIntervals);
    govs = govs.sort((a, b) => {
      if (a.name === "\u0627\u0644\u063A\u0631\u0628\u064A\u0629") return -1;
      if (b.name === "\u0627\u0644\u063A\u0631\u0628\u064A\u0629") return 1;
      if (a.name === "\u0627\u0644\u062F\u0642\u0647\u0644\u064A\u0629") return -1;
      if (b.name === "\u0627\u0644\u062F\u0642\u0647\u0644\u064A\u0629") return 1;
      return a.name.localeCompare(b.name, "ar");
    });
    cits = cits.sort((a, b) => {
      if (a.name === "\u0633\u0645\u0646\u0648\u062F") return -1;
      if (b.name === "\u0633\u0645\u0646\u0648\u062F") return 1;
      if (a.name === "\u0627\u0644\u0645\u0646\u0635\u0648\u0631\u0629") return -1;
      if (b.name === "\u0627\u0644\u0645\u0646\u0635\u0648\u0631\u0629") return 1;
      return a.name.localeCompare(b.name, "ar");
    });
    return {
      governorates: govs,
      cities: cits,
      filterTypes: filters,
      maintenanceIntervals: intervals
    };
  });
}

// server/src/server.ts
var import_helmet = __toESM(require("@fastify/helmet"), 1);

// server/src/routes/maintenance.ts
var import_drizzle_orm4 = require("drizzle-orm");
var import_crypto3 = __toESM(require("crypto"), 1);
async function maintenanceRoutes(fastify2) {
  fastify2.addHook("preHandler", verifyAuth);
  const requirePermission = (permission) => async (request, reply) => {
    if (!hasPermission(request.user.role, permission)) {
      return reply.status(403).send({ error: "\u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0644\u0625\u062C\u0631\u0627\u0621 \u0647\u0630\u0647 \u0627\u0644\u0639\u0645\u0644\u064A\u0629" });
    }
  };
  fastify2.get("/", {
    preHandler: [requirePermission("visits.view")]
  }, async (request, reply) => {
    const type = request.query.type || "today";
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    let condition;
    if (type === "today") {
      condition = (0, import_drizzle_orm4.eq)(customers.nextMaintenanceDate, today);
    } else if (type === "overdue") {
      condition = (0, import_drizzle_orm4.and)((0, import_drizzle_orm4.isNotNull)(customers.nextMaintenanceDate), (0, import_drizzle_orm4.lte)(customers.nextMaintenanceDate, today));
    }
    const allCustomers = await db.select().from(customers).where(
      (0, import_drizzle_orm4.and)((0, import_drizzle_orm4.isNotNull)(customers.nextMaintenanceDate), (0, import_drizzle_orm4.eq)(customers.isDeleted, false))
    );
    const in3DaysDate = /* @__PURE__ */ new Date();
    in3DaysDate.setDate(in3DaysDate.getDate() + 3);
    const in3Days = in3DaysDate.toISOString().split("T")[0];
    const todayTasks = allCustomers.filter((c) => c.nextMaintenanceDate === today);
    const overdueTasks = allCustomers.filter((c) => c.nextMaintenanceDate < today);
    const upcomingTasks = allCustomers.filter((c) => c.nextMaintenanceDate > today && c.nextMaintenanceDate <= in3Days).sort((a, b) => a.nextMaintenanceDate.localeCompare(b.nextMaintenanceDate));
    const historyRes = await db.select({ count: import_drizzle_orm4.sql`COUNT(*)` }).from(visits);
    const historyCount = Number(historyRes[0]?.count || 0);
    const stats = {
      today: todayTasks.length,
      overdue: overdueTasks.length,
      upcoming: upcomingTasks.length,
      history: historyCount
    };
    let dataToReturn = [];
    if (type === "today") dataToReturn = todayTasks;
    else if (type === "overdue") dataToReturn = overdueTasks;
    else if (type === "upcoming") dataToReturn = upcomingTasks;
    if (type === "history") {
      const allVisits = await db.select({
        id: visits.id,
        customerId: customers.id,
        customerCode: customers.customerCode,
        name: customers.name,
        phone1: customers.phone1,
        visitDate: visits.visitDate,
        notes: visits.notes,
        isBaseline: visits.isBaseline
      }).from(visits).leftJoin(customers, (0, import_drizzle_orm4.eq)(visits.customerId, customers.id)).orderBy((0, import_drizzle_orm4.desc)(visits.visitDate)).limit(100);
      dataToReturn = allVisits;
    }
    return { data: dataToReturn, stats };
  });
  fastify2.put("/:customerId/done", {
    preHandler: [requirePermission("visits.create")]
  }, async (request, reply) => {
    const { customerId } = request.params;
    const custRes = await db.select().from(customers).where((0, import_drizzle_orm4.eq)(customers.id, customerId));
    const cust = custRes[0];
    if (!cust) throw new Error("\u0627\u0644\u0639\u0645\u064A\u0644 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F");
    const intervalRes = await db.select().from(maintenanceIntervals).where((0, import_drizzle_orm4.eq)(maintenanceIntervals.id, cust.maintenanceIntervalId));
    const interval = intervalRes[0];
    if (!interval) throw new Error("\u0641\u062A\u0631\u0629 \u0627\u0644\u0635\u064A\u0627\u0646\u0629 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u0629");
    const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const dateObj = new Date(todayStr);
    dateObj.setMonth(dateObj.getMonth() + interval.months);
    const nextDateStr = dateObj.toISOString().split("T")[0];
    await db.update(customers).set({
      lastMaintenanceDate: todayStr,
      nextMaintenanceDate: nextDateStr
    }).where((0, import_drizzle_orm4.eq)(customers.id, customerId));
    return { success: true, nextMaintenanceDate: nextDateStr };
  });
  fastify2.post("/", {
    preHandler: [requirePermission("visits.create")]
  }, async (request, reply) => {
    const data = request.body;
    let finalEmployeeId = data.employeeId;
    if (!finalEmployeeId) {
      const defaultEmp = await db.select().from(employees).where((0, import_drizzle_orm4.eq)(employees.name, "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F"));
      if (defaultEmp[0]) {
        finalEmployeeId = defaultEmp[0].id;
      } else {
        finalEmployeeId = import_crypto3.default.randomUUID();
        await db.insert(employees).values({
          id: finalEmployeeId,
          name: "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F",
          isTechnician: true
        });
      }
    }
    const visitId = import_crypto3.default.randomUUID();
    await db.insert(visits).values({
      id: visitId,
      customerId: data.customerId,
      employeeId: finalEmployeeId,
      visitDate: data.visitDate,
      workflowStatus: "COMPLETED",
      isBaseline: false,
      item1: data.item1 || false,
      item2: data.item2 || false,
      item3: data.item3 || false,
      itemPost: data.itemPost || false,
      itemCalcium: data.itemCalcium || false,
      itemInfrared: data.itemInfrared || false,
      itemSalts: data.itemSalts || false,
      notes: data.notes || "",
      createdAt: /* @__PURE__ */ new Date()
    });
    try {
      const allInv = await db.select().from(inventory);
      const candleKeywords = {
        item1: ["\u0645\u0631\u062D\u0644\u0629 1", "\u0645\u0631\u062D\u0644\u0629 \u0623\u0648\u0644\u0649", "\u0623\u0648\u0644\u0649"],
        item2: ["\u0645\u0631\u062D\u0644\u0629 2", "\u0645\u0631\u062D\u0644\u0629 \u062B\u0627\u0646\u064A\u0629", "\u062B\u0627\u0646\u064A\u0629"],
        item3: ["\u0645\u0631\u062D\u0644\u0629 3", "\u0645\u0631\u062D\u0644\u0629 \u062B\u0627\u0644\u062B\u0629", "\u062B\u0627\u0644\u062B\u0629"],
        itemSalts: ["\u0645\u0631\u062D\u0644\u0629 4", "\u0645\u0645\u0628\u0631\u064A\u0646", "\u0623\u0645\u0644\u0627\u062D"],
        itemPost: ["\u0645\u0631\u062D\u0644\u0629 5", "\u0628\u0648\u0633\u062A \u0643\u0631\u0628\u0648\u0646", "\u0628\u0648\u0633\u062A"],
        itemCalcium: ["\u0645\u0631\u062D\u0644\u0629 6", "\u0643\u0627\u0644\u0633\u064A\u062A", "\u0643\u0627\u0644\u0633\u064A\u0648\u0645"],
        itemInfrared: ["\u0645\u0631\u062D\u0644\u0629 7", "\u0625\u0646\u0641\u0631\u0627\u0631\u064A\u062F", "\u0627\u0646\u0641\u0631\u0627\u0631\u064A\u062F"]
      };
      for (const [key, keywords] of Object.entries(candleKeywords)) {
        if (data[key]) {
          const matched = allInv.find(
            (inv) => (inv.category === "candle" || !inv.category) && keywords.some((kw) => inv.itemName.includes(kw))
          );
          if (matched) {
            console.log(`[INVENTORY DEDUCTION] Candle ${key} matched '${matched.itemName}'. Deducting 1 from stock.`);
            await db.update(inventory).set({
              quantity: import_drizzle_orm4.sql`MAX(0, quantity - 1)`
            }).where((0, import_drizzle_orm4.eq)(inventory.id, matched.id));
          }
        }
      }
      if (Array.isArray(data.spareParts)) {
        for (const sp of data.spareParts) {
          const partId = sp.id || sp.inventoryId;
          const qty = Number(sp.quantity) || 1;
          if (partId && qty > 0) {
            const matchedPart = allInv.find((inv) => inv.id === partId);
            if (matchedPart) {
              console.log(`[INVENTORY DEDUCTION] Spare part '${matchedPart.itemName}' used. Deducting ${qty} from stock.`);
              await db.update(inventory).set({
                quantity: import_drizzle_orm4.sql`MAX(0, quantity - ${qty})`
              }).where((0, import_drizzle_orm4.eq)(inventory.id, matchedPart.id));
            }
          }
        }
      }
    } catch (invErr) {
      console.error("Error auto-deducting inventory for visit:", invErr);
    }
    const custRes = await db.select().from(customers).where((0, import_drizzle_orm4.eq)(customers.id, data.customerId));
    const cust = custRes[0];
    if (!cust) throw new Error("\u0627\u0644\u0639\u0645\u064A\u0644 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F");
    const intervalRes = await db.select().from(maintenanceIntervals).where((0, import_drizzle_orm4.eq)(maintenanceIntervals.id, cust.maintenanceIntervalId));
    const interval = intervalRes[0];
    if (interval) {
      const dateObj = new Date(data.visitDate);
      dateObj.setMonth(dateObj.getMonth() + interval.months);
      const nextDateStr = dateObj.toISOString().split("T")[0];
      await db.update(customers).set({
        lastMaintenanceDate: data.visitDate,
        nextMaintenanceDate: nextDateStr
      }).where((0, import_drizzle_orm4.eq)(customers.id, data.customerId));
    }
    return { success: true, visitId };
  });
  fastify2.put("/:id", {
    preHandler: [requirePermission("visits.create")]
  }, async (request, reply) => {
    const { id } = request.params;
    const data = request.body;
    const visitRes = await db.select().from(visits).where((0, import_drizzle_orm4.eq)(visits.id, id));
    const visit = visitRes[0];
    if (!visit) {
      return reply.status(404).send({ error: "\u0627\u0644\u0632\u064A\u0627\u0631\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629" });
    }
    const updateFields = {};
    if (data.visitDate !== void 0) updateFields.visitDate = data.visitDate;
    if (data.employeeId !== void 0) updateFields.employeeId = data.employeeId || null;
    if (data.item1 !== void 0) updateFields.item1 = Boolean(data.item1);
    if (data.item2 !== void 0) updateFields.item2 = Boolean(data.item2);
    if (data.item3 !== void 0) updateFields.item3 = Boolean(data.item3);
    if (data.itemPost !== void 0) updateFields.itemPost = Boolean(data.itemPost);
    if (data.itemCalcium !== void 0) updateFields.itemCalcium = Boolean(data.itemCalcium);
    if (data.itemInfrared !== void 0) updateFields.itemInfrared = Boolean(data.itemInfrared);
    if (data.itemSalts !== void 0) updateFields.itemSalts = Boolean(data.itemSalts);
    if (data.notes !== void 0) updateFields.notes = data.notes;
    await db.update(visits).set(updateFields).where((0, import_drizzle_orm4.eq)(visits.id, id));
    const customerId = visit.customerId;
    if (customerId) {
      const allVisits = await db.select().from(visits).where((0, import_drizzle_orm4.eq)(visits.customerId, customerId)).orderBy((0, import_drizzle_orm4.desc)(visits.visitDate));
      const custRes = await db.select().from(customers).where((0, import_drizzle_orm4.eq)(customers.id, customerId));
      const cust = custRes[0];
      if (cust && allVisits.length > 0) {
        const intervalRes = await db.select().from(maintenanceIntervals).where((0, import_drizzle_orm4.eq)(maintenanceIntervals.id, cust.maintenanceIntervalId));
        const interval = intervalRes[0];
        const months = interval?.months || 3;
        const latestVisitDate = allVisits[0].visitDate;
        const dateObj = new Date(latestVisitDate);
        dateObj.setMonth(dateObj.getMonth() + months);
        const nextDateStr = dateObj.toISOString().split("T")[0];
        await db.update(customers).set({
          lastMaintenanceDate: latestVisitDate,
          nextMaintenanceDate: nextDateStr
        }).where((0, import_drizzle_orm4.eq)(customers.id, customerId));
      }
    }
    return { success: true, message: "\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0632\u064A\u0627\u0631\u0629 \u0628\u0646\u062C\u0627\u062D" };
  });
  fastify2.delete("/:id", {
    preHandler: [requirePermission("visits.create")]
  }, async (request, reply) => {
    const { id } = request.params;
    const visitRes = await db.select().from(visits).where((0, import_drizzle_orm4.eq)(visits.id, id));
    const visit = visitRes[0];
    if (!visit) {
      return reply.status(404).send({ error: "\u0627\u0644\u0632\u064A\u0627\u0631\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629" });
    }
    const customerId = visit.customerId;
    await db.delete(visits).where((0, import_drizzle_orm4.eq)(visits.id, id));
    if (customerId) {
      const remainingVisits = await db.select().from(visits).where((0, import_drizzle_orm4.eq)(visits.customerId, customerId)).orderBy((0, import_drizzle_orm4.desc)(visits.visitDate));
      const custRes = await db.select().from(customers).where((0, import_drizzle_orm4.eq)(customers.id, customerId));
      const cust = custRes[0];
      if (cust) {
        const intervalRes = await db.select().from(maintenanceIntervals).where((0, import_drizzle_orm4.eq)(maintenanceIntervals.id, cust.maintenanceIntervalId));
        const interval = intervalRes[0];
        const months = interval?.months || 3;
        if (remainingVisits.length > 0) {
          const latestVisitDate = remainingVisits[0].visitDate;
          const dateObj = new Date(latestVisitDate);
          dateObj.setMonth(dateObj.getMonth() + months);
          const nextDateStr = dateObj.toISOString().split("T")[0];
          await db.update(customers).set({
            lastMaintenanceDate: latestVisitDate,
            nextMaintenanceDate: nextDateStr
          }).where((0, import_drizzle_orm4.eq)(customers.id, customerId));
        } else {
          await db.update(customers).set({
            lastMaintenanceDate: null,
            nextMaintenanceDate: null
          }).where((0, import_drizzle_orm4.eq)(customers.id, customerId));
        }
      }
    }
    return { success: true, message: "\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0632\u064A\u0627\u0631\u0629 \u0628\u0646\u062C\u0627\u062D" };
  });
}

// server/src/routes/installments.ts
var import_drizzle_orm5 = require("drizzle-orm");
var import_zod3 = __toESM(require("zod"), 1);
var import_crypto4 = __toESM(require("crypto"), 1);
var installmentSchema = import_zod3.default.object({
  customerId: import_zod3.default.string().min(1),
  amount: import_zod3.default.number().positive(),
  dueDate: import_zod3.default.string(),
  notes: import_zod3.default.string().optional().nullable()
});
function uuidv42() {
  return import_crypto4.default.randomUUID();
}
async function installmentsRoutes(fastify2) {
  fastify2.addHook("preHandler", verifyAuth);
  const requirePermission = (permission) => async (request, reply) => {
    if (!hasPermission(request.user.role, permission)) {
      return reply.status(403).send({ error: "\u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629" });
    }
  };
  fastify2.get("/", {
    preHandler: [requirePermission("installments.view")]
  }, async (request, reply) => {
    const status = request.query.status || "pending";
    const allInstallments = await db.select({
      id: installments.id,
      amount: installments.amount,
      dueDate: installments.dueDate,
      isPaid: installments.isPaid,
      paidDate: installments.paidDate,
      customerName: customers.name,
      customerPhone: customers.phone1,
      customerCode: customers.customerCode
    }).from(installments).leftJoin(customers, (0, import_drizzle_orm5.eq)(installments.customerId, customers.id)).where((0, import_drizzle_orm5.eq)(installments.isPaid, status === "paid")).orderBy((0, import_drizzle_orm5.desc)(installments.dueDate));
    return { data: allInstallments };
  });
  fastify2.post("/", {
    preHandler: [requirePermission("installments.create")]
  }, async (request, reply) => {
    const data = installmentSchema.parse(request.body);
    const id = uuidv42();
    await db.insert(installments).values({
      id,
      customerId: data.customerId,
      amount: data.amount,
      dueDate: data.dueDate,
      notes: data.notes,
      createdAt: /* @__PURE__ */ new Date()
    });
    return { success: true, id };
  });
  fastify2.put("/:id/pay", {
    preHandler: [requirePermission("installments.update")]
  }, async (request, reply) => {
    const { id } = request.params;
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    await db.update(installments).set({
      isPaid: true,
      paidDate: today
    }).where((0, import_drizzle_orm5.eq)(installments.id, id));
    return { success: true };
  });
}

// server/src/routes/expenses.ts
var import_drizzle_orm6 = require("drizzle-orm");
var import_zod4 = __toESM(require("zod"), 1);
var import_crypto5 = __toESM(require("crypto"), 1);
var expenseSchema = import_zod4.default.object({
  amount: import_zod4.default.number().positive(),
  category: import_zod4.default.string().min(1),
  description: import_zod4.default.string().min(1),
  expenseDate: import_zod4.default.string()
});
function uuidv43() {
  return import_crypto5.default.randomUUID();
}
async function expensesRoutes(fastify2) {
  fastify2.addHook("preHandler", verifyAuth);
  const requirePermission = (permission) => async (request, reply) => {
    if (!hasPermission(request.user.role, permission)) {
      return reply.status(403).send({ error: "\u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629" });
    }
  };
  fastify2.get("/", {
    preHandler: [requirePermission("expenses.view")]
  }, async (request, reply) => {
    const allExpenses = await db.select().from(expenses).orderBy((0, import_drizzle_orm6.desc)(expenses.expenseDate));
    return { data: allExpenses };
  });
  fastify2.post("/", {
    preHandler: [requirePermission("expenses.create")]
  }, async (request, reply) => {
    const data = expenseSchema.parse(request.body);
    const id = uuidv43();
    await db.insert(expenses).values({
      id,
      amount: data.amount,
      category: data.category,
      description: data.description,
      expenseDate: data.expenseDate,
      createdAt: /* @__PURE__ */ new Date()
    });
    return { success: true, id };
  });
}

// server/src/routes/inventory.ts
var import_drizzle_orm7 = require("drizzle-orm");
var import_zod5 = __toESM(require("zod"), 1);
var import_crypto6 = __toESM(require("crypto"), 1);
var inventorySchema = import_zod5.default.object({
  itemName: import_zod5.default.string().min(1),
  category: import_zod5.default.string().optional().default("spare"),
  quantity: import_zod5.default.number().int().min(0),
  unitPrice: import_zod5.default.number().min(0)
});
function uuidv44() {
  return import_crypto6.default.randomUUID();
}
async function inventoryRoutes(fastify2) {
  fastify2.addHook("preHandler", verifyAuth);
  const requirePermission = (permission) => async (request, reply) => {
    if (!hasPermission(request.user.role, permission)) {
      return reply.status(403).send({ error: "\u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629" });
    }
  };
  fastify2.get("/", {
    preHandler: [requirePermission("inventory.view")]
  }, async (request, reply) => {
    const allItems = await db.select().from(inventory);
    const totalItems = allItems.length;
    const totalQuantity = allItems.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
    const totalValue = allItems.reduce((acc, curr) => acc + (curr.quantity || 0) * (curr.unitPrice || 0), 0);
    const lowStockCount = allItems.filter((i) => (i.quantity || 0) <= 5).length;
    const totalCandles = allItems.filter((i) => i.category === "candle").reduce((acc, curr) => acc + (curr.quantity || 0), 0);
    const totalSpares = allItems.filter((i) => i.category === "spare").reduce((acc, curr) => acc + (curr.quantity || 0), 0);
    return {
      data: allItems,
      stats: {
        totalItems,
        totalQuantity,
        totalValue: Math.round(totalValue * 100) / 100,
        lowStockCount,
        totalCandles,
        totalSpares
      }
    };
  });
  fastify2.post("/", {
    preHandler: [requirePermission("inventory.create")]
  }, async (request, reply) => {
    try {
      const data = inventorySchema.parse(request.body);
      const existing = await db.select().from(inventory).where((0, import_drizzle_orm7.eq)(inventory.itemName, data.itemName));
      if (existing[0]) {
        const newQty = existing[0].quantity + data.quantity;
        const newPrice = data.unitPrice > 0 ? data.unitPrice : existing[0].unitPrice;
        await db.update(inventory).set({
          quantity: newQty,
          unitPrice: newPrice,
          category: data.category || existing[0].category
        }).where((0, import_drizzle_orm7.eq)(inventory.id, existing[0].id));
        return {
          success: true,
          id: existing[0].id,
          merged: true,
          message: `\u062A\u0645 \u0625\u0636\u0627\u0641\u0629 ${data.quantity} \u0642\u0637\u0639\u0629 \u0625\u0644\u0649 \u0631\u0635\u064A\u062F \u0627\u0644\u0635\u0646\u0641 \u0644\u064A\u0635\u0628\u062D ${newQty} \u0642\u0637\u0639\u0629`
        };
      }
      const id = uuidv44();
      await db.insert(inventory).values({
        id,
        itemName: data.itemName,
        category: data.category || "spare",
        quantity: data.quantity,
        unitPrice: data.unitPrice
      });
      return { success: true, id };
    } catch (err) {
      return reply.status(400).send({ error: err.message || "\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062D\u0641\u0638 \u0627\u0644\u0635\u0646\u0641" });
    }
  });
  fastify2.put("/:id", {
    preHandler: [requirePermission("inventory.update")]
  }, async (request, reply) => {
    const { id } = request.params;
    const body = request.body;
    const itemRes = await db.select().from(inventory).where((0, import_drizzle_orm7.eq)(inventory.id, id));
    if (!itemRes[0]) return reply.status(404).send({ error: "\u0627\u0644\u0645\u0646\u062A\u062C \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
    const updateData = {};
    if (typeof body.itemName === "string") updateData.itemName = body.itemName;
    if (typeof body.unitPrice === "number") updateData.unitPrice = body.unitPrice;
    if (typeof body.quantity === "number") {
      updateData.quantity = body.quantity;
    } else if (typeof body.adjustment === "number") {
      updateData.quantity = Math.max(0, itemRes[0].quantity + body.adjustment);
    }
    await db.update(inventory).set(updateData).where((0, import_drizzle_orm7.eq)(inventory.id, id));
    return { success: true };
  });
  fastify2.delete("/:id", {
    preHandler: [requirePermission("inventory.delete")]
  }, async (request, reply) => {
    const { id } = request.params;
    await db.delete(inventory).where((0, import_drizzle_orm7.eq)(inventory.id, id));
    return { success: true };
  });
}

// server/src/routes/employees.ts
var import_zod6 = __toESM(require("zod"), 1);
var import_crypto7 = __toESM(require("crypto"), 1);
var employeeSchema = import_zod6.default.object({
  name: import_zod6.default.string().min(1),
  isTechnician: import_zod6.default.boolean()
});
function uuidv45() {
  return import_crypto7.default.randomUUID();
}
async function employeesRoutes(fastify2) {
  fastify2.addHook("preHandler", verifyAuth);
  const requirePermission = (permission) => async (request, reply) => {
    if (!hasPermission(request.user.role, permission)) {
      return reply.status(403).send({ error: "\u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629" });
    }
  };
  fastify2.get("/", {
    preHandler: [requirePermission("employees.view")]
  }, async (request, reply) => {
    const allEmployees = await db.select().from(employees);
    return { data: allEmployees };
  });
  fastify2.post("/", {
    preHandler: [requirePermission("employees.create")]
  }, async (request, reply) => {
    const data = employeeSchema.parse(request.body);
    const id = uuidv45();
    await db.insert(employees).values({
      id,
      name: data.name,
      isTechnician: data.isTechnician
    });
    return { success: true, id };
  });
}

// server/src/routes/reports.ts
var import_drizzle_orm8 = require("drizzle-orm");
async function reportsRoutes(fastify2) {
  fastify2.addHook("preHandler", verifyAuth);
  fastify2.get("/", {
    preHandler: async (request, reply) => {
      if (!hasPermission(request.user.role, "reports.view")) {
        return reply.status(403).send({ error: "\u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0644\u0639\u0631\u0636 \u0627\u0644\u062A\u0642\u0627\u0631\u064A\u0631" });
      }
    }
  }, async (request, reply) => {
    const query = request.query || {};
    const { from, to, period, search, technicianId, governorateId, filterTypeId } = query;
    const allCustomers = await db.select().from(customers);
    const allVisits = await db.select().from(visits).orderBy((0, import_drizzle_orm8.desc)(visits.visitDate));
    const allEmployees = await db.select().from(employees);
    const allInventory = await db.select().from(inventory);
    const allGovs = await db.select().from(governorates);
    const allCities = await db.select().from(cities);
    const allFilterTypes = await db.select().from(filterTypes);
    const govMap = new Map(allGovs.map((g) => [g.id, g.name]));
    const cityMap = new Map(allCities.map((c) => [c.id, c.name]));
    const filterTypeMap = new Map(allFilterTypes.map((f) => [f.id, f.name]));
    const employeeMap = new Map(allEmployees.map((e) => [e.id, e.name]));
    const customerMap = new Map(allCustomers.map((c) => [c.id, c]));
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    let startDate = from || "";
    let endDate = to || "";
    if (period && !from && !to) {
      const now = /* @__PURE__ */ new Date();
      if (period === "today") {
        startDate = today;
        endDate = today;
      } else if (period === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 864e5);
        startDate = weekAgo.toISOString().split("T")[0];
        endDate = today;
      } else if (period === "month") {
        const monthAgo = new Date(now.getTime() - 30 * 864e5);
        startDate = monthAgo.toISOString().split("T")[0];
        endDate = today;
      } else if (period === "quarter") {
        const quarterAgo = new Date(now.getTime() - 90 * 864e5);
        startDate = quarterAgo.toISOString().split("T")[0];
        endDate = today;
      } else if (period === "year") {
        const yearAgo = new Date(now.getTime() - 365 * 864e5);
        startDate = yearAgo.toISOString().split("T")[0];
        endDate = today;
      }
    }
    const filteredVisits = allVisits.filter((v) => {
      if (startDate && v.visitDate < startDate) return false;
      if (endDate && v.visitDate > endDate) return false;
      if (technicianId && v.employeeId !== technicianId) return false;
      const cust = customerMap.get(v.customerId);
      if (!cust) return false;
      if (governorateId && cust.governorateId !== governorateId) return false;
      if (filterTypeId && cust.filterTypeId !== filterTypeId) return false;
      if (search) {
        if (!matchesAnyField([cust.name, cust.phone1, cust.phone2, cust.customerCode, cust.village], search)) {
          return false;
        }
      }
      return true;
    });
    const filteredCustomers = allCustomers.filter((c) => {
      if (governorateId && c.governorateId !== governorateId) return false;
      if (filterTypeId && c.filterTypeId !== filterTypeId) return false;
      if (search) {
        if (!matchesAnyField([c.name, c.phone1, c.phone2, c.customerCode, c.village], search)) {
          return false;
        }
      }
      return true;
    });
    const getInventoryPrice = (keyword, fallback) => {
      const found = allInventory.find((i) => i.itemName.includes(keyword));
      return found ? found.unitPrice : fallback;
    };
    const stagesConfig = [
      { key: "item1", name: "\u0634\u0645\u0639\u0629 \u0623\u0648\u0644\u0649", fallbackPrice: 45, interval: "3 \u0623\u0634\u0647\u0631", stageNum: 1 },
      { key: "item2", name: "\u0634\u0645\u0639\u0629 \u062B\u0627\u0646\u064A\u0629", fallbackPrice: 55, interval: "6 \u0623\u0634\u0647\u0631", stageNum: 2 },
      { key: "item3", name: "\u0634\u0645\u0639\u0629 \u062B\u0627\u0644\u062B\u0629", fallbackPrice: 55, interval: "6 \u0623\u0634\u0647\u0631", stageNum: 3 },
      { key: "itemSalts", name: "\u0623\u0645\u0644\u0627\u062D (\u0645\u0645\u0628\u0631\u064A\u0646)", fallbackPrice: 350, interval: "12 - 24 \u0634\u0647\u0631", stageNum: 4 },
      { key: "itemPost", name: "\u0628\u0648\u0633\u062A \u0643\u0631\u0628\u0648\u0646", fallbackPrice: 75, interval: "12 \u0634\u0647\u0631", stageNum: 5 },
      { key: "itemCalcium", name: "\u0643\u0627\u0644\u0633\u064A\u0648\u0645 (\u0643\u0627\u0644\u0633\u064A\u062A)", fallbackPrice: 75, interval: "12 \u0634\u0647\u0631", stageNum: 6 },
      { key: "itemInfrared", name: "\u0627\u0646\u0641\u0631\u0627\u0631\u064A\u062F", fallbackPrice: 95, interval: "12 - 24 \u0634\u0647\u0631", stageNum: 7 }
    ];
    let totalCandlesConsumed = 0;
    let totalCandlesCost = 0;
    const candleStats = stagesConfig.map((cfg) => {
      let count = 0;
      filteredVisits.forEach((v) => {
        if (v[cfg.key]) count += 1;
      });
      const unitPrice = getInventoryPrice(cfg.name.split("(")[0].trim(), cfg.fallbackPrice);
      const totalCost = count * unitPrice;
      totalCandlesConsumed += count;
      totalCandlesCost += totalCost;
      return {
        stageNum: cfg.stageNum,
        name: cfg.name,
        interval: cfg.interval,
        count,
        unitPrice,
        totalCost,
        percentage: filteredVisits.length > 0 ? Math.round(count / filteredVisits.length * 100) : 0
      };
    });
    const overdueCount = allCustomers.filter((c) => c.nextMaintenanceDate && c.nextMaintenanceDate < today).length;
    const todayCount = allCustomers.filter((c) => c.nextMaintenanceDate === today).length;
    const upcomingCount = allCustomers.filter((c) => c.nextMaintenanceDate && c.nextMaintenanceDate > today).length;
    const onTimeRate = allCustomers.length > 0 ? Math.round((allCustomers.length - overdueCount) / allCustomers.length * 100) : 100;
    const maintenanceByFilterType = allFilterTypes.map((ft) => {
      const custCount = allCustomers.filter((c) => c.filterTypeId === ft.id).length;
      const visitsCount = filteredVisits.filter((v) => {
        const cust = customerMap.get(v.customerId);
        return cust && cust.filterTypeId === ft.id;
      }).length;
      return {
        id: ft.id,
        name: ft.name,
        customerCount: custCount,
        visitsCount
      };
    });
    const technicianStats = allEmployees.filter((e) => e.isTechnician).map((tech) => {
      const techVisits = filteredVisits.filter((v) => v.employeeId === tech.id);
      let candlesInstalled = 0;
      techVisits.forEach((v) => {
        if (v.item1) candlesInstalled++;
        if (v.item2) candlesInstalled++;
        if (v.item3) candlesInstalled++;
        if (v.itemSalts) candlesInstalled++;
        if (v.itemPost) candlesInstalled++;
        if (v.itemCalcium) candlesInstalled++;
        if (v.itemInfrared) candlesInstalled++;
      });
      const lastVisit = techVisits.length > 0 ? techVisits[0].visitDate : "-";
      const score = techVisits.length >= 6 ? "\u0645\u0645\u062A\u0627\u0632" : techVisits.length >= 3 ? "\u062C\u064A\u062F \u062C\u062F\u0627\u064B" : "\u0646\u0634\u0637";
      return {
        id: tech.id,
        name: tech.name,
        visitsCount: techVisits.length,
        candlesInstalled,
        lastVisitDate: lastVisit,
        score,
        isActive: tech.isActive
      };
    }).sort((a, b) => b.visitsCount - a.visitsCount);
    const all27GovernoratesStats = allGovs.map((g) => {
      const custs = filteredCustomers.filter((c) => c.governorateId === g.id);
      const visitsInGov = filteredVisits.filter((v) => {
        const cust = customerMap.get(v.customerId);
        return cust && cust.governorateId === g.id;
      });
      return {
        id: g.id,
        name: g.name,
        customerCount: custs.length,
        visitsCount: visitsInGov.length,
        percentage: filteredCustomers.length > 0 ? Math.round(custs.length / filteredCustomers.length * 100) : 0,
        coverageStatus: custs.length > 0 ? "\u0645\u063A\u0637\u0627\u0629 \u0628\u0646\u0634\u0627\u0637 \u0645\u064A\u062F\u0627\u0646\u064A" : "\u062C\u0627\u0647\u0632\u0629 \u0644\u0644\u062A\u0634\u063A\u064A\u0644 \u0648\u0627\u0644\u062A\u0648\u0633\u0639"
      };
    }).sort((a, b) => b.customerCount - a.customerCount);
    const governorateStats = all27GovernoratesStats.filter((g) => g.customerCount > 0 || g.visitsCount > 0);
    const cityStats = allCities.map((ct) => {
      const custs = filteredCustomers.filter((c) => c.cityId === ct.id);
      const visitsInCity = filteredVisits.filter((v) => {
        const cust = customerMap.get(v.customerId);
        return cust && cust.cityId === ct.id;
      });
      return {
        id: ct.id,
        name: ct.name,
        governorateName: govMap.get(ct.governorateId) || "",
        customerCount: custs.length,
        visitsCount: visitsInCity.length
      };
    }).filter((ct) => ct.customerCount > 0).sort((a, b) => b.customerCount - a.customerCount);
    const totalInventoryValue = allInventory.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const totalInventoryUnits = allInventory.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const categorizeItem = (name, cat) => {
      const n = name.toLowerCase();
      if (cat === "candle" || n.includes("\u0634\u0645\u0639") || n.includes("\u0645\u0645\u0628\u0631\u064A\u0646")) return "\u0634\u0645\u0639 \u0648\u0645\u0645\u0628\u0631\u064A\u0646 \u0627\u0644\u0641\u0644\u0627\u062A\u0631";
      if (n.includes("\u0645\u0648\u062A\u0648\u0631") || n.includes("\u0645\u0636\u062E\u0629") || n.includes("\u0645\u062D\u0648\u0644") || n.includes("\u062A\u0631\u0627\u0646\u0633")) return "\u0645\u0648\u0627\u062A\u064A\u0631 \u0648\u0645\u062D\u0648\u0644\u0627\u062A \u0643\u0647\u0631\u0628\u0627\u0626\u064A\u0629";
      if (n.includes("\u0645\u062D\u0628\u0633") || n.includes("\u062E\u0631\u0637\u0648\u0645") || n.includes("\u0643\u0648\u0639") || n.includes("\u0648\u0635\u0644\u0629")) return "\u0645\u062D\u0627\u0628\u0633 \u0648\u062E\u0631\u0627\u0637\u064A\u0645 \u0648\u0633\u0628\u0627\u0643\u0629";
      if (n.includes("\u062E\u0632\u0627\u0646") || n.includes("\u0635\u0646\u0628\u0648\u0631") || n.includes("\u062D\u0646\u0642\u064A\u0629") || n.includes("\u0647\u0627\u0648\u0633\u0646\u062C")) return "\u0642\u0637\u0639 \u063A\u064A\u0627\u0631 \u0648\u0647\u064A\u0627\u0643\u0644 \u0627\u0644\u062A\u0634\u063A\u064A\u0644";
      if (n.includes("\u0637\u0642\u0645") || n.includes("\u0645\u062D\u0637\u0629") || n.includes("\u0641\u0644\u062A\u0631 \u0643\u0627\u0645\u0644")) return "\u0623\u0637\u0642\u0645 \u0648\u0641\u0644\u0627\u062A\u0631 \u0645\u062A\u0643\u0627\u0645\u0644\u0629";
      return "\u0645\u0633\u062A\u0644\u0632\u0645\u0627\u062A \u0639\u0627\u0645\u0629";
    };
    const categoriesMap = {};
    allInventory.forEach((item) => {
      const cat = categorizeItem(item.itemName, item.category);
      if (!categoriesMap[cat]) {
        categoriesMap[cat] = { name: cat, count: 0, units: 0, value: 0 };
      }
      categoriesMap[cat].count += 1;
      categoriesMap[cat].units += item.quantity;
      categoriesMap[cat].value += item.quantity * item.unitPrice;
    });
    const categoryBreakdown = Object.values(categoriesMap).map((c) => ({
      ...c,
      value: Math.round(c.value),
      percentage: totalInventoryValue > 0 ? Math.round(c.value / totalInventoryValue * 100) : 0
    })).sort((a, b) => b.value - a.value);
    const itemConsumptionMap = {};
    filteredVisits.forEach((v) => {
      if (v.item1) itemConsumptionMap["\u0634\u0645\u0639\u0629 \u0645\u0631\u062D\u0644\u0629 1"] = (itemConsumptionMap["\u0634\u0645\u0639\u0629 \u0645\u0631\u062D\u0644\u0629 1"] || 0) + 1;
      if (v.item2) itemConsumptionMap["\u0634\u0645\u0639\u0629 \u0645\u0631\u062D\u0644\u0629 2"] = (itemConsumptionMap["\u0634\u0645\u0639\u0629 \u0645\u0631\u062D\u0644\u0629 2"] || 0) + 1;
      if (v.item3) itemConsumptionMap["\u0634\u0645\u0639\u0629 \u0645\u0631\u062D\u0644\u0629 3"] = (itemConsumptionMap["\u0634\u0645\u0639\u0629 \u0645\u0631\u062D\u0644\u0629 3"] || 0) + 1;
      if (v.itemSalts) itemConsumptionMap["\u0634\u0645\u0639\u0629 \u0645\u0631\u062D\u0644\u0629 4"] = (itemConsumptionMap["\u0634\u0645\u0639\u0629 \u0645\u0631\u062D\u0644\u0629 4"] || 0) + 1;
      if (v.itemPost) itemConsumptionMap["\u0634\u0645\u0639\u0629 \u0645\u0631\u062D\u0644\u0629 5"] = (itemConsumptionMap["\u0634\u0645\u0639\u0629 \u0645\u0631\u062D\u0644\u0629 5"] || 0) + 1;
      if (v.itemCalcium) itemConsumptionMap["\u0634\u0645\u0639\u0629 \u0645\u0631\u062D\u0644\u0629 6"] = (itemConsumptionMap["\u0634\u0645\u0639\u0629 \u0645\u0631\u062D\u0644\u0629 6"] || 0) + 1;
      if (v.itemInfrared) itemConsumptionMap["\u0634\u0645\u0639\u0629 \u0645\u0631\u062D\u0644\u0629 7"] = (itemConsumptionMap["\u0634\u0645\u0639\u0629 \u0645\u0631\u062D\u0644\u0629 7"] || 0) + 1;
    });
    const detailedInventoryTable = allInventory.map((item) => {
      let consumed = 0;
      for (const [k, v] of Object.entries(itemConsumptionMap)) {
        if (item.itemName.includes(k) || k.includes(item.itemName.substring(0, 10))) {
          consumed = v;
          break;
        }
      }
      let status = "\u0622\u0645\u0646 \u0648\u0645\u062A\u0648\u0641\u0631";
      let statusColor = "emerald";
      if (item.quantity === 0) {
        status = "\u0646\u0641\u062F \u0628\u0627\u0644\u0643\u0627\u0645\u0644";
        statusColor = "red";
      } else if (item.quantity <= 5) {
        status = "\u062D\u0631\u062C - \u064A\u0644\u0632\u0645 \u0627\u0644\u062A\u0648\u0631\u064A\u062F";
        statusColor = "amber";
      } else if (item.quantity <= 15) {
        status = "\u0645\u062A\u0648\u0633\u0637";
        statusColor = "sky";
      }
      const monthlyRunRate = Math.max(0.5, consumed / (filteredVisits.length > 0 ? 3 : 1));
      const coverageMonths = (item.quantity / monthlyRunRate).toFixed(1);
      return {
        id: item.id,
        name: item.itemName,
        category: categorizeItem(item.itemName, item.category),
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        retailPrice: Math.round(item.unitPrice * 1.35),
        totalCostValue: Math.round(item.quantity * item.unitPrice),
        totalRetailValue: Math.round(item.quantity * item.unitPrice * 1.35),
        consumedInVisits: consumed,
        coverageMonths: Number(coverageMonths),
        status,
        statusColor
      };
    }).sort((a, b) => b.totalCostValue - a.totalCostValue);
    const lowStockItems = detailedInventoryTable.filter((i) => i.quantity <= 5);
    const fastMovingItems = [...detailedInventoryTable].sort((a, b) => b.consumedInVisits - a.consumedInVisits).slice(0, 5);
    const slowMovingItems = detailedInventoryTable.filter((i) => i.consumedInVisits === 0).slice(0, 5);
    const warehouseReport = {
      summary: {
        totalItemTypes: allInventory.length,
        totalUnitsInStock: totalInventoryUnits,
        totalCapitalCost: Math.round(totalInventoryValue),
        totalEstimatedRetailValue: Math.round(totalInventoryValue * 1.35),
        expectedGrossProfit: Math.round(totalInventoryValue * 0.35),
        lowStockCount: lowStockItems.length,
        outOfStockCount: detailedInventoryTable.filter((i) => i.quantity === 0).length,
        healthyStockCount: detailedInventoryTable.filter((i) => i.quantity > 5).length,
        totalCandlesConsumedInVisits: totalCandlesConsumed,
        totalCandlesCostInVisits: totalCandlesCost
      },
      categoryBreakdown,
      fastMovingItems,
      slowMovingItems,
      lowStockItems,
      detailedItems: detailedInventoryTable
    };
    const detailedVisits = filteredVisits.slice(0, 100).map((v) => {
      const cust = customerMap.get(v.customerId);
      const changedCandles = [];
      if (v.item1) changedCandles.push("\u0634\u0645\u0639\u0629 \u0623\u0648\u0644\u0649");
      if (v.item2) changedCandles.push("\u0634\u0645\u0639\u0629 \u062B\u0627\u0646\u064A\u0629");
      if (v.item3) changedCandles.push("\u0634\u0645\u0639\u0629 \u062B\u0627\u0644\u062B\u0629");
      if (v.itemPost) changedCandles.push("\u0628\u0648\u0633\u062A \u0643\u0631\u0628\u0648\u0646");
      if (v.itemCalcium) changedCandles.push("\u0643\u0627\u0644\u0633\u064A\u0648\u0645 (\u0643\u0627\u0644\u0633\u064A\u062A)");
      if (v.itemInfrared) changedCandles.push("\u0627\u0646\u0641\u0631\u0627\u0631\u064A\u062F");
      if (v.itemSalts) changedCandles.push("\u0623\u0645\u0644\u0627\u062D (\u0645\u0645\u0628\u0631\u064A\u0646)");
      return {
        id: v.id,
        visitDate: v.visitDate,
        customerName: cust ? cust.name : "\u0639\u0645\u064A\u0644 \u063A\u064A\u0631 \u0645\u0633\u062C\u0644",
        customerCode: cust ? cust.customerCode : "-",
        phone: cust ? cust.phone1 : "-",
        technicianName: v.employeeId ? employeeMap.get(v.employeeId) || "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F" : "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F",
        governorateName: cust ? govMap.get(cust.governorateId) || "" : "",
        cityName: cust ? cityMap.get(cust.cityId) || "" : "",
        filterTypeName: cust ? filterTypeMap.get(cust.filterTypeId || "") || "\u0641\u0644\u062A\u0631 \u0645\u0646\u0632\u0644\u064A" : "",
        candlesSummary: changedCandles.join(" + ") || "\u0641\u062D\u0635 \u0648\u0635\u064A\u0627\u0646\u0629 \u0639\u0627\u0645\u0629",
        candlesCount: changedCandles.length,
        notes: v.notes || ""
      };
    });
    return {
      data: {
        filtersApplied: {
          from: startDate,
          to: endDate,
          period: period || "all",
          search: search || "",
          technicianId: technicianId || "",
          governorateId: governorateId || "",
          filterTypeId: filterTypeId || ""
        },
        overview: {
          totalCustomers: allCustomers.length,
          filteredCustomersCount: filteredCustomers.length,
          totalVisits: filteredVisits.length,
          onTimeRate,
          overdueCount,
          todayCount,
          upcomingCount,
          totalCandlesConsumed,
          totalCandlesCost,
          totalInventoryValue: Math.round(totalInventoryValue),
          totalInventoryUnits,
          totalEstimatedRetailValue: Math.round(totalInventoryValue * 1.35),
          lowStockCount: lowStockItems.length,
          activeTechniciansCount: technicianStats.length,
          totalGovernoratesCount: allGovs.length,
          activeGovernoratesCount: governorateStats.length
        },
        candleStats,
        maintenanceByFilterType,
        technicianStats,
        governorateStats,
        all27GovernoratesStats,
        cityStats,
        warehouseReport,
        lowStockItems: lowStockItems.map((i) => ({
          id: i.id,
          name: i.name,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          category: i.category
        })),
        detailedVisits,
        lookups: {
          technicians: allEmployees.filter((e) => e.isTechnician).map((e) => ({ id: e.id, name: e.name })),
          governorates: allGovs.map((g) => ({ id: g.id, name: g.name })),
          filterTypes: allFilterTypes.map((f) => ({ id: f.id, name: f.name }))
        }
      }
    };
  });
}

// server/src/routes/dashboard.ts
var import_drizzle_orm9 = require("drizzle-orm");
async function dashboardRoutes(fastify2) {
  fastify2.addHook("preHandler", verifyAuth);
  fastify2.get("/", async (request, reply) => {
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 864e5).toISOString().split("T")[0];
    const totalCustomersRes = await db.select({ count: import_drizzle_orm9.sql`COUNT(*)` }).from(customers);
    const totalCustomers = Number(totalCustomersRes[0]?.count || 0);
    const todayCountRes = await db.select({ count: import_drizzle_orm9.sql`COUNT(*)` }).from(customers).where((0, import_drizzle_orm9.eq)(customers.nextMaintenanceDate, today));
    const todayCount = Number(todayCountRes[0]?.count || 0);
    const overdueCountRes = await db.select({ count: import_drizzle_orm9.sql`COUNT(*)` }).from(customers).where(import_drizzle_orm9.sql`${customers.nextMaintenanceDate} < ${today}`);
    const overdueCount = Number(overdueCountRes[0]?.count || 0);
    const upcomingCountRes = await db.select({ count: import_drizzle_orm9.sql`COUNT(*)` }).from(customers).where(import_drizzle_orm9.sql`${customers.nextMaintenanceDate} > ${today}`);
    const upcomingCount = Number(upcomingCountRes[0]?.count || 0);
    const filterStatsRes = await db.select({
      id: filterTypes.id,
      name: filterTypes.name,
      count: import_drizzle_orm9.sql`COUNT(${customers.id})`
    }).from(filterTypes).leftJoin(customers, (0, import_drizzle_orm9.eq)(filterTypes.id, customers.filterTypeId)).groupBy(filterTypes.id, filterTypes.name);
    const govStatsRes = await db.select({
      name: governorates.name,
      value: import_drizzle_orm9.sql`COUNT(${customers.id})`
    }).from(governorates).innerJoin(customers, (0, import_drizzle_orm9.eq)(governorates.id, customers.governorateId)).groupBy(governorates.name).orderBy((0, import_drizzle_orm9.desc)(import_drizzle_orm9.sql`COUNT(${customers.id})`));
    const totalVisitsRes = await db.select({ count: import_drizzle_orm9.sql`COUNT(*)` }).from(visits);
    const totalVisits = Number(totalVisitsRes[0]?.count || 0);
    const monthlyVisitsRes = await db.select({ count: import_drizzle_orm9.sql`COUNT(*)` }).from(visits).where(import_drizzle_orm9.sql`${visits.visitDate} >= ${thirtyDaysAgo}`);
    const monthlyVisits = Number(monthlyVisitsRes[0]?.count || 0);
    const candleStatsRes = await db.select({
      item1: import_drizzle_orm9.sql`SUM(CASE WHEN ${visits.item1} = 1 THEN 1 ELSE 0 END)`,
      item2: import_drizzle_orm9.sql`SUM(CASE WHEN ${visits.item2} = 1 THEN 1 ELSE 0 END)`,
      item3: import_drizzle_orm9.sql`SUM(CASE WHEN ${visits.item3} = 1 THEN 1 ELSE 0 END)`,
      itemPost: import_drizzle_orm9.sql`SUM(CASE WHEN ${visits.itemPost} = 1 THEN 1 ELSE 0 END)`,
      itemCalcium: import_drizzle_orm9.sql`SUM(CASE WHEN ${visits.itemCalcium} = 1 THEN 1 ELSE 0 END)`,
      itemInfrared: import_drizzle_orm9.sql`SUM(CASE WHEN ${visits.itemInfrared} = 1 THEN 1 ELSE 0 END)`,
      itemSalts: import_drizzle_orm9.sql`SUM(CASE WHEN ${visits.itemSalts} = 1 THEN 1 ELSE 0 END)`
    }).from(visits);
    const stats = candleStatsRes[0] || {};
    const item1 = Number(stats.item1 || 0);
    const item2 = Number(stats.item2 || 0);
    const item3 = Number(stats.item3 || 0);
    const itemPost = Number(stats.itemPost || 0);
    const itemCalcium = Number(stats.itemCalcium || 0);
    const itemInfrared = Number(stats.itemInfrared || 0);
    const itemSalts = Number(stats.itemSalts || 0);
    const consumedCandles = item1 + item2 + item3 + itemPost + itemCalcium + itemInfrared + itemSalts;
    const filterConsumptionData = [
      { name: "\u0634\u0645\u0639\u0629 \u0623\u0648\u0644\u0649", value: item1 },
      { name: "\u0634\u0645\u0639\u0629 \u062B\u0627\u0646\u064A\u0629", value: item2 },
      { name: "\u0634\u0645\u0639\u0629 \u062B\u0627\u0644\u062B\u0629", value: item3 },
      { name: "\u0623\u0645\u0644\u0627\u062D (\u0645\u0645\u0628\u0631\u064A\u0646)", value: itemSalts },
      { name: "\u0628\u0648\u0633\u062A \u0643\u0631\u0628\u0648\u0646", value: itemPost },
      { name: "\u0643\u0627\u0644\u0633\u064A\u0648\u0645 (\u0643\u0627\u0644\u0633\u064A\u062A)", value: itemCalcium },
      { name: "\u0627\u0646\u0641\u0631\u0627\u0631\u064A\u062F", value: itemInfrared }
    ];
    const invAggRes = await db.select({
      totalItems: import_drizzle_orm9.sql`COUNT(*)`,
      totalUnits: import_drizzle_orm9.sql`SUM(${inventory.quantity})`,
      totalCapital: import_drizzle_orm9.sql`SUM(${inventory.quantity} * ${inventory.unitPrice})`,
      lowStockCount: import_drizzle_orm9.sql`SUM(CASE WHEN ${inventory.quantity} <= 5 THEN 1 ELSE 0 END)`
    }).from(inventory);
    const invAgg = invAggRes[0] || {};
    const recentLogs = await db.select().from(auditLogs).orderBy((0, import_drizzle_orm9.desc)(auditLogs.createdAt)).limit(5);
    const todaysList = await db.select().from(customers).where((0, import_drizzle_orm9.eq)(customers.nextMaintenanceDate, today)).limit(10);
    return {
      data: {
        totalCustomers,
        maintenance: {
          today: todayCount,
          overdue: overdueCount,
          upcoming: upcomingCount
        },
        monthlyVisits,
        totalVisits,
        consumedFilters: consumedCandles,
        filterStats: filterStatsRes.map((f) => ({ ...f, count: Number(f.count) })),
        govStats: govStatsRes.map((g) => ({ ...g, value: Number(g.value) })),
        filterConsumptionData,
        inventorySummary: {
          totalItems: Number(invAgg.totalItems || 0),
          totalUnits: Number(invAgg.totalUnits || 0),
          totalCapital: Math.round(Number(invAgg.totalCapital || 0)),
          lowStockCount: Number(invAgg.lowStockCount || 0)
        },
        recentLogs,
        todaysList
      }
    };
  });
}

// server/src/routes/users.ts
var import_drizzle_orm10 = require("drizzle-orm");
var import_crypto8 = require("crypto");
var import_zod7 = __toESM(require("zod"), 1);
var createUserSchema = import_zod7.default.object({
  username: import_zod7.default.string().min(3, "\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u064A\u062C\u0628 \u0623\u0644\u0627 \u064A\u0642\u0644 \u0639\u0646 3 \u0623\u062D\u0631\u0641"),
  password: import_zod7.default.string().min(4, "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u064A\u062C\u0628 \u0623\u0644\u0627 \u062A\u0642\u0644 \u0639\u0646 4 \u0623\u062D\u0631\u0641"),
  role: import_zod7.default.enum(["ADMIN", "MANAGER", "TECHNICIAN", "DATA_ENTRY"]),
  employeeId: import_zod7.default.string().optional().nullable()
});
var updateUserSchema = import_zod7.default.object({
  role: import_zod7.default.enum(["ADMIN", "MANAGER", "TECHNICIAN", "DATA_ENTRY"]).optional(),
  isActive: import_zod7.default.boolean().optional(),
  password: import_zod7.default.string().min(4).optional().or(import_zod7.default.literal("")),
  employeeId: import_zod7.default.string().optional().nullable()
});
async function usersRoutes(fastify2) {
  fastify2.addHook("preHandler", verifyAuth);
  fastify2.get("/", async (request, reply) => {
    try {
      const allUsers = await db.select({
        id: users.id,
        username: users.username,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
        version: users.version
      }).from(users).orderBy((0, import_drizzle_orm10.desc)(users.createdAt));
      const allEmployees = await db.select({
        id: employees.id,
        name: employees.name,
        userId: employees.userId,
        isTechnician: employees.isTechnician
      }).from(employees);
      const enrichedUsers = allUsers.map((u) => {
        const linkedEmp = allEmployees.find((e) => e.userId === u.id);
        return {
          ...u,
          employeeId: linkedEmp ? linkedEmp.id : null,
          employeeName: linkedEmp ? linkedEmp.name : null
        };
      });
      return {
        data: enrichedUsers,
        availableEmployees: allEmployees.filter((e) => !e.userId)
      };
    } catch (e) {
      request.log.error(e);
      return reply.status(500).send({ error: "\u0641\u0634\u0644 \u0641\u064A \u0627\u0633\u062A\u0631\u062C\u0627\u0639 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u064A\u0646" });
    }
  });
  fastify2.get("/roles-matrix", async (request, reply) => {
    const rolesList = Object.keys(ROLES).map((r) => ({
      key: r,
      name: r === "ADMIN" ? "\u0645\u062F\u064A\u0631 \u0627\u0644\u0646\u0638\u0627\u0645 (\u0643\u0627\u0645\u0644 \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0627\u062A)" : r === "MANAGER" ? "\u0645\u0634\u0631\u0641 \u0639\u0627\u0645 / \u0645\u062F\u064A\u0631 \u0641\u0631\u0639" : r === "TECHNICIAN" ? "\u0641\u0646\u064A \u0635\u064A\u0627\u0646\u0629 \u0645\u064A\u062F\u0627\u0646\u064A" : "\u0645\u062F\u062E\u0644 \u0628\u064A\u0627\u0646\u0627\u062A \u0648\u062D\u0633\u0627\u0628\u0627\u062A",
      description: r === "ADMIN" ? "\u062A\u062D\u0643\u0645 \u0643\u0627\u0645\u0644 \u0648\u0645\u0637\u0644\u0642 \u0641\u064A \u0643\u0627\u0641\u0629 \u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A \u0648\u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0648\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u064A\u0646" : r === "MANAGER" ? "\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0648\u0627\u0644\u0645\u062E\u0632\u0648\u0646 \u0648\u0627\u0644\u062A\u0642\u0627\u0631\u064A\u0631 \u0628\u062F\u0648\u0646 \u062D\u0630\u0641 \u062C\u0630\u0631\u064A" : r === "TECHNICIAN" ? "\u0627\u0633\u062A\u0639\u0631\u0627\u0636 \u0639\u0645\u0644\u0627\u0621 \u0627\u0644\u0635\u064A\u0627\u0646\u0629 \u0648\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u0632\u064A\u0627\u0631\u0627\u062A \u0648\u0627\u0633\u062A\u0647\u0644\u0627\u0643 \u0627\u0644\u0634\u0645\u0639 \u0641\u0642\u0637" : "\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0648\u0627\u0644\u0623\u0642\u0633\u0627\u0637 \u0648\u0627\u0644\u0645\u0635\u0631\u0648\u0641\u0627\u062A \u0627\u0644\u064A\u0648\u0645\u064A\u0629",
      permissions: getRolePermissions(r)
    }));
    return { roles: rolesList };
  });
  fastify2.post("/", async (request, reply) => {
    const currentUser = request.user;
    if (currentUser.role !== "ADMIN") {
      return reply.status(403).send({ error: "\u0639\u0641\u0648\u0627\u064B\u060C \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u064A\u0646 \u062A\u062A\u0637\u0644\u0628 \u0635\u0644\u0627\u062D\u064A\u0629 \u0645\u062F\u064A\u0631 \u0627\u0644\u0646\u0638\u0627\u0645" });
    }
    try {
      const parsed = createUserSchema.parse(request.body);
      const existing = await db.select().from(users).where((0, import_drizzle_orm10.eq)(users.username, parsed.username));
      if (existing.length > 0) {
        return reply.status(400).send({ error: "\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0645\u0633\u062C\u0644 \u0645\u0633\u0628\u0642\u0627\u064B\u060C \u064A\u0631\u062C\u0649 \u0627\u062E\u062A\u064A\u0627\u0631 \u0627\u0633\u0645 \u0622\u062E\u0631" });
      }
      const newId = (0, import_crypto8.randomUUID)();
      const pwdHash = await hashPassword(parsed.password);
      await db.insert(users).values({
        id: newId,
        username: parsed.username,
        passwordHash: pwdHash,
        role: parsed.role,
        isActive: true,
        createdAt: /* @__PURE__ */ new Date(),
        version: 1
      });
      if (parsed.employeeId) {
        await db.update(employees).set({ userId: newId }).where((0, import_drizzle_orm10.eq)(employees.id, parsed.employeeId));
      }
      await db.insert(auditLogs).values({
        id: (0, import_crypto8.randomUUID)(),
        userId: currentUser.id,
        entityName: "users",
        entityId: newId,
        action: "CREATE_USER",
        newValues: { username: parsed.username, role: parsed.role },
        createdAt: /* @__PURE__ */ new Date()
      });
      return { success: true, message: "\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0628\u0646\u062C\u0627\u062D", id: newId };
    } catch (e) {
      request.log.error(e);
      return reply.status(400).send({ error: e.errors ? e.errors[0].message : "\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629" });
    }
  });
  fastify2.put("/:id", async (request, reply) => {
    const currentUser = request.user;
    const { id } = request.params;
    if (currentUser.role !== "ADMIN" && currentUser.id !== id) {
      return reply.status(403).send({ error: "\u063A\u064A\u0631 \u0645\u0635\u0631\u062D \u0644\u0643 \u0628\u062A\u0639\u062F\u064A\u0644 \u0628\u064A\u0627\u0646\u0627\u062A \u0647\u0630\u0627 \u0627\u0644\u062D\u0633\u0627\u0628" });
    }
    try {
      const parsed = updateUserSchema.parse(request.body);
      const userList = await db.select().from(users).where((0, import_drizzle_orm10.eq)(users.id, id));
      if (userList.length === 0) {
        return reply.status(404).send({ error: "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
      }
      if (currentUser.id === id && parsed.isActive === false) {
        return reply.status(400).send({ error: "\u0644\u0627 \u064A\u0645\u0643\u0646\u0643 \u062A\u0639\u0637\u064A\u0644 \u062D\u0633\u0627\u0628\u0643 \u0627\u0644\u0634\u062E\u0635\u064A \u0627\u0644\u062D\u0627\u0644\u064A" });
      }
      const updates = {};
      if (parsed.role && currentUser.role === "ADMIN") updates.role = parsed.role;
      if (parsed.isActive !== void 0 && currentUser.role === "ADMIN") updates.isActive = parsed.isActive;
      if (parsed.password && parsed.password.trim().length >= 4) {
        updates.passwordHash = await hashPassword(parsed.password.trim());
      }
      if (Object.keys(updates).length > 0) {
        await db.update(users).set(updates).where((0, import_drizzle_orm10.eq)(users.id, id));
      }
      if (currentUser.role === "ADMIN" && parsed.employeeId !== void 0) {
        await db.update(employees).set({ userId: null }).where((0, import_drizzle_orm10.eq)(employees.userId, id));
        if (parsed.employeeId) {
          await db.update(employees).set({ userId: id }).where((0, import_drizzle_orm10.eq)(employees.id, parsed.employeeId));
        }
      }
      await db.insert(auditLogs).values({
        id: (0, import_crypto8.randomUUID)(),
        userId: currentUser.id,
        entityName: "users",
        entityId: id,
        action: "UPDATE_USER",
        newValues: updates,
        createdAt: /* @__PURE__ */ new Date()
      });
      return { success: true, message: "\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0628\u0646\u062C\u0627\u062D" };
    } catch (e) {
      request.log.error(e);
      return reply.status(400).send({ error: e.errors ? e.errors[0].message : "\u0641\u0634\u0644 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A" });
    }
  });
  fastify2.delete("/:id", async (request, reply) => {
    const currentUser = request.user;
    const { id } = request.params;
    if (currentUser.role !== "ADMIN") {
      return reply.status(403).send({ error: "\u062D\u0630\u0641 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u064A\u0646 \u064A\u062A\u0637\u0644\u0628 \u0635\u0644\u0627\u062D\u064A\u0629 \u0645\u062F\u064A\u0631 \u0627\u0644\u0646\u0638\u0627\u0645" });
    }
    if (currentUser.id === id) {
      return reply.status(400).send({ error: "\u0644\u0627 \u064A\u0645\u0643\u0646\u0643 \u062D\u0630\u0641 \u0627\u0644\u062D\u0633\u0627\u0628 \u0627\u0644\u062E\u0627\u0635 \u0628\u0643 \u0623\u062B\u0646\u0627\u0621 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0645\u0646\u0647" });
    }
    try {
      await db.update(employees).set({ userId: null }).where((0, import_drizzle_orm10.eq)(employees.userId, id));
      await db.delete(sessions).where((0, import_drizzle_orm10.eq)(sessions.userId, id));
      await db.delete(users).where((0, import_drizzle_orm10.eq)(users.id, id));
      await db.insert(auditLogs).values({
        id: (0, import_crypto8.randomUUID)(),
        userId: currentUser.id,
        entityName: "users",
        entityId: id,
        action: "DELETE_USER",
        createdAt: /* @__PURE__ */ new Date()
      });
      return { success: true, message: "\u062A\u0645 \u062D\u0630\u0641 \u062D\u0633\u0627\u0628 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0628\u0646\u062C\u0627\u062D" };
    } catch (e) {
      request.log.error(e);
      return reply.status(500).send({ error: "\u0641\u0634\u0644 \u0641\u064A \u062D\u0630\u0641 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645" });
    }
  });
}

// server/src/routes/settings.ts
var import_drizzle_orm11 = require("drizzle-orm");
var import_crypto9 = require("crypto");
var import_fs2 = __toESM(require("fs"), 1);
var import_path2 = __toESM(require("path"), 1);
var DEFAULT_COMPANY_PROFILE = {
  companyName: "\u0645\u0624\u0633\u0633\u0629 \u0641\u0644\u0627\u062A\u0631 \u0627\u0644\u062C\u0645\u0627\u0644 \u0644\u0623\u0646\u0638\u0645\u0629 \u0645\u0639\u0627\u0644\u062C\u0629 \u0648\u062A\u062D\u0644\u064A\u0629 \u0627\u0644\u0645\u064A\u0627\u0647",
  slogan: "\u0635\u064A\u0627\u0646\u0629 \u0641\u0648\u0631\u064A\u0629 \u0648\u062A\u0648\u0631\u064A\u062F \u0634\u0645\u0639\u0627\u062A \u0648\u0645\u062D\u0637\u0627\u062A \u062A\u062D\u0644\u064A\u0629 \u0645\u0639\u062A\u0645\u062F\u0629 \u0628\u0623\u0639\u0644\u0649 \u0645\u0639\u0627\u064A\u064A\u0631 \u0627\u0644\u0646\u0642\u0627\u0621",
  phone1: "01012345678",
  phone2: "01123456789",
  hotline: "19000",
  whatsapp: "01012345678",
  email: "info@elgammal-filters.com",
  address: "\u0627\u0644\u062C\u0645\u0647\u0648\u0631\u064A\u0629 \u0627\u0644\u0645\u0635\u0631\u064A\u0629 - \u0645\u0631\u0643\u0632 \u0633\u0645\u0646\u0648\u062F / \u0627\u0644\u0645\u0646\u0635\u0648\u0631\u0629",
  commercialRegister: "104523/\u063A\u0631\u0628\u064A\u0629",
  taxNumber: "482-901-332",
  warrantyNotice: "\u0627\u0644\u0636\u0645\u0627\u0646 \u0633\u0627\u0631\u064D \u0628\u0634\u0631\u0637 \u0627\u0644\u0627\u0644\u062A\u0632\u0627\u0645 \u0628\u062A\u063A\u064A\u064A\u0631 \u0627\u0644\u0634\u0645\u0639\u0627\u062A \u0648\u0627\u0644\u0645\u0631\u0627\u062D\u0644 \u0641\u064A \u0645\u0648\u0627\u0639\u064A\u062F\u0647\u0627 \u0627\u0644\u062F\u0648\u0631\u064A\u0629 \u0627\u0644\u0645\u062D\u062F\u062F\u0629 \u0645\u0646 \u0642\u0650\u0628\u0644 \u0641\u0646\u064A \u0627\u0644\u0645\u0624\u0633\u0633\u0629 \u0627\u0644\u0645\u0639\u062A\u0645\u062F."
};
var DEFAULT_ALERT_PREFERENCES = {
  alertDaysBefore: 7,
  overdueThresholdDays: 1,
  defaultWarrantyMonths: 12,
  standardTdsLimit: 150,
  enableSmsReminders: true
};
async function settingsRoutes(fastify2) {
  try {
    await db.run(import_drizzle_orm11.sql`CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    )`);
  } catch (e) {
  }
  fastify2.addHook("preHandler", verifyAuth);
  fastify2.get("/", async (request, reply) => {
    try {
      const allSettings = await db.select().from(systemSettings);
      const settingsMap = {};
      allSettings.forEach((s) => {
        settingsMap[s.key] = s.value;
      });
      return {
        companyProfile: settingsMap["companyProfile"] || DEFAULT_COMPANY_PROFILE,
        alertPreferences: settingsMap["alertPreferences"] || DEFAULT_ALERT_PREFERENCES
      };
    } catch (e) {
      request.log.error(e);
      return reply.status(500).send({ error: "\u0641\u0634\u0644 \u0627\u0633\u062A\u0631\u062C\u0627\u0639 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A" });
    }
  });
  fastify2.put("/", async (request, reply) => {
    const currentUser = request.user;
    if (currentUser.role !== "ADMIN" && currentUser.role !== "MANAGER") {
      return reply.status(403).send({ error: "\u062A\u0639\u062F\u064A\u0644 \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0645\u0624\u0633\u0633\u0629 \u064A\u062A\u0637\u0644\u0628 \u0635\u0644\u0627\u062D\u064A\u0629 \u0625\u062F\u0627\u0631\u064A\u0629" });
    }
    try {
      const body = request.body;
      const now = /* @__PURE__ */ new Date();
      if (body.companyProfile) {
        const merged = { ...DEFAULT_COMPANY_PROFILE, ...body.companyProfile };
        await db.run(import_drizzle_orm11.sql`INSERT INTO system_settings (key, value, updated_at) 
          VALUES ('companyProfile', ${JSON.stringify(merged)}, ${now.getTime()})
          ON CONFLICT(key) DO UPDATE SET value = ${JSON.stringify(merged)}, updated_at = ${now.getTime()}`);
      }
      if (body.alertPreferences) {
        const merged = { ...DEFAULT_ALERT_PREFERENCES, ...body.alertPreferences };
        await db.run(import_drizzle_orm11.sql`INSERT INTO system_settings (key, value, updated_at) 
          VALUES ('alertPreferences', ${JSON.stringify(merged)}, ${now.getTime()})
          ON CONFLICT(key) DO UPDATE SET value = ${JSON.stringify(merged)}, updated_at = ${now.getTime()}`);
      }
      await db.insert(auditLogs).values({
        id: (0, import_crypto9.randomUUID)(),
        userId: currentUser.id,
        entityName: "system_settings",
        entityId: "global",
        action: "UPDATE_SETTINGS",
        newValues: body,
        createdAt: now
      });
      return { success: true, message: "\u062A\u0645 \u062D\u0641\u0638 \u0648\u062A\u0637\u0628\u064A\u0642 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0628\u0646\u062C\u0627\u062D" };
    } catch (e) {
      request.log.error(e);
      return reply.status(500).send({ error: "\u0641\u0634\u0644 \u062D\u0641\u0638 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A" });
    }
  });
  fastify2.get("/backup", async (request, reply) => {
    const currentUser = request.user;
    if (currentUser.role !== "ADMIN") {
      return reply.status(403).send({ error: "\u062A\u0646\u0632\u064A\u0644 \u0627\u0644\u0646\u0633\u062E\u0629 \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0637\u064A\u0629 \u0645\u0642\u062A\u0635\u0631 \u0639\u0644\u0649 \u0645\u062F\u064A\u0631 \u0627\u0644\u0646\u0638\u0627\u0645" });
    }
    try {
      const [
        allCustomers,
        allVisits,
        allInventory,
        allEmployees,
        allInstallments,
        allExpenses,
        allGovs,
        allCities,
        allFilters,
        allIntervals,
        allUsers,
        allSettings
      ] = await Promise.all([
        db.select().from(customers),
        db.select().from(visits),
        db.select().from(inventory),
        db.select().from(employees),
        db.select().from(installments),
        db.select().from(expenses),
        db.select().from(governorates),
        db.select().from(cities),
        db.select().from(filterTypes),
        db.select().from(maintenanceIntervals),
        db.select({ id: users.id, username: users.username, role: users.role, isActive: users.isActive, createdAt: users.createdAt }).from(users),
        db.select().from(systemSettings)
      ]);
      const backupData = {
        system: "\u0645\u0646\u0638\u0648\u0645\u0629 \u0641\u0644\u0627\u062A\u0631 \u0627\u0644\u062C\u0645\u0627\u0644 \u0644\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0648\u0627\u0644\u0635\u064A\u0627\u0646\u0629",
        version: "2.0.0",
        exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
        exportedBy: currentUser.username,
        stats: {
          totalCustomers: allCustomers.length,
          totalVisits: allVisits.length,
          totalInventoryItems: allInventory.length,
          totalEmployees: allEmployees.length,
          totalInstallments: allInstallments.length,
          totalExpenses: allExpenses.length
        },
        data: {
          customers: allCustomers,
          visits: allVisits,
          inventory: allInventory,
          employees: allEmployees,
          installments: allInstallments,
          expenses: allExpenses,
          governorates: allGovs,
          cities: allCities,
          filterTypes: allFilters,
          maintenanceIntervals: allIntervals,
          users: allUsers,
          settings: allSettings
        }
      };
      const filename = `elgammal_backup_${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-")}.json`;
      reply.header("Content-Type", "application/json; charset=utf-8");
      reply.header("Content-Disposition", `attachment; filename="${filename}"`);
      return backupData;
    } catch (e) {
      request.log.error(e);
      return reply.status(500).send({ error: "\u0641\u0634\u0644 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0646\u0633\u062E\u0629 \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0637\u064A\u0629" });
    }
  });
  fastify2.post("/restore", async (request, reply) => {
    const currentUser = request.user;
    if (currentUser.role !== "ADMIN") {
      return reply.status(403).send({ error: "\u0627\u0633\u062A\u0639\u0627\u062F\u0629 \u0627\u0644\u0646\u0633\u062E\u0629 \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0637\u064A\u0629 \u0645\u0642\u062A\u0635\u0631\u0629 \u062D\u0635\u0631\u064A\u0627\u064B \u0639\u0644\u0649 \u0645\u062F\u064A\u0631 \u0627\u0644\u0646\u0638\u0627\u0645" });
    }
    try {
      const payload = request.body;
      if (!payload || !payload.data) {
        return reply.status(400).send({ error: "\u0645\u0644\u0641 \u0627\u0644\u0646\u0633\u062E\u0629 \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0637\u064A\u0629 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D \u0623\u0648 \u062A\u0627\u0644\u0641" });
      }
      const { data } = payload;
      let restoredCounts = {
        customers: 0,
        visits: 0,
        inventory: 0,
        employees: 0,
        installments: 0,
        expenses: 0
      };
      if (data.settings && Array.isArray(data.settings)) {
        for (const s of data.settings) {
          const val = typeof s.value === "string" ? s.value : JSON.stringify(s.value);
          await db.run(import_drizzle_orm11.sql`INSERT INTO system_settings (key, value, updated_at) 
            VALUES (${s.key}, ${val}, ${Date.now()})
            ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`);
        }
      }
      if (data.customers && Array.isArray(data.customers)) {
        for (const c of data.customers) {
          const exists = await db.select().from(customers).where((0, import_drizzle_orm11.eq)(customers.id, c.id));
          if (exists.length === 0) {
            await db.insert(customers).values(c);
            restoredCounts.customers++;
          }
        }
      }
      if (data.visits && Array.isArray(data.visits)) {
        for (const v of data.visits) {
          const exists = await db.select().from(visits).where((0, import_drizzle_orm11.eq)(visits.id, v.id));
          if (exists.length === 0) {
            await db.insert(visits).values(v);
            restoredCounts.visits++;
          }
        }
      }
      if (data.inventory && Array.isArray(data.inventory)) {
        for (const i of data.inventory) {
          const exists = await db.select().from(inventory).where((0, import_drizzle_orm11.eq)(inventory.id, i.id));
          if (exists.length === 0) {
            await db.insert(inventory).values(i);
            restoredCounts.inventory++;
          }
        }
      }
      if (data.employees && Array.isArray(data.employees)) {
        for (const e of data.employees) {
          const exists = await db.select().from(employees).where((0, import_drizzle_orm11.eq)(employees.id, e.id));
          if (exists.length === 0) {
            await db.insert(employees).values(e);
            restoredCounts.employees++;
          }
        }
      }
      if (data.installments && Array.isArray(data.installments)) {
        for (const inst of data.installments) {
          const exists = await db.select().from(installments).where((0, import_drizzle_orm11.eq)(installments.id, inst.id));
          if (exists.length === 0) {
            await db.insert(installments).values(inst);
            restoredCounts.installments++;
          }
        }
      }
      if (data.expenses && Array.isArray(data.expenses)) {
        for (const exp of data.expenses) {
          const exists = await db.select().from(expenses).where((0, import_drizzle_orm11.eq)(expenses.id, exp.id));
          if (exists.length === 0) {
            await db.insert(expenses).values(exp);
            restoredCounts.expenses++;
          }
        }
      }
      await db.insert(auditLogs).values({
        id: (0, import_crypto9.randomUUID)(),
        userId: currentUser.id,
        entityName: "database",
        entityId: "backup_restore",
        action: "RESTORE_BACKUP",
        newValues: restoredCounts,
        createdAt: /* @__PURE__ */ new Date()
      });
      return {
        success: true,
        message: "\u062A\u0645\u062A \u0645\u0631\u0627\u062C\u0639\u0629 \u0648\u0627\u0633\u062A\u0639\u0627\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0628\u0646\u062C\u0627\u062D \u0645\u0646 \u0627\u0644\u0646\u0633\u062E\u0629 \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0637\u064A\u0629!",
        restoredCounts
      };
    } catch (e) {
      request.log.error(e);
      return reply.status(500).send({ error: "\u0641\u0634\u0644 \u0627\u0633\u062A\u0639\u0627\u062F\u0629 \u0627\u0644\u0646\u0633\u062E\u0629 \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0637\u064A\u0629: " + (e.message || "") });
    }
  });
  fastify2.get("/system-stats", async (request, reply) => {
    try {
      let dbSizeMb = 0;
      let dbPath2 = import_path2.default.resolve(process.cwd(), "elgammal.db");
      if (!import_fs2.default.existsSync(dbPath2)) {
        dbPath2 = import_path2.default.resolve(process.cwd(), "../elgammal.db");
      }
      if (import_fs2.default.existsSync(dbPath2)) {
        const stats = import_fs2.default.statSync(dbPath2);
        dbSizeMb = Math.round(stats.size / (1024 * 1024) * 100) / 100;
      }
      const [cCount, vCount, iCount, eCount, uCount] = await Promise.all([
        db.select({ count: import_drizzle_orm11.sql`count(*)` }).from(customers),
        db.select({ count: import_drizzle_orm11.sql`count(*)` }).from(visits),
        db.select({ count: import_drizzle_orm11.sql`count(*)` }).from(inventory),
        db.select({ count: import_drizzle_orm11.sql`count(*)` }).from(employees),
        db.select({ count: import_drizzle_orm11.sql`count(*)` }).from(users)
      ]);
      return {
        dbSizeMb,
        totalCustomers: Number(cCount[0]?.count || 0),
        totalVisits: Number(vCount[0]?.count || 0),
        totalInventoryItems: Number(iCount[0]?.count || 0),
        totalEmployees: Number(eCount[0]?.count || 0),
        totalUsers: Number(uCount[0]?.count || 0),
        serverUptimeHours: Math.round(process.uptime() / 3600 * 10) / 10,
        nodeVersion: process.version,
        databaseStatus: "\u0645\u062A\u0635\u0644 \u0648\u0645\u062D\u0645\u064A (Healthy)"
      };
    } catch (e) {
      request.log.error(e);
      return reply.status(500).send({ error: "\u0641\u0634\u0644 \u0627\u0633\u062A\u0631\u062C\u0627\u0639 \u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A \u0627\u0644\u0646\u0638\u0627\u0645" });
    }
  });
  fastify2.get("/audit-logs", async (request, reply) => {
    try {
      const logs = await db.select({
        id: auditLogs.id,
        userId: auditLogs.userId,
        entityName: auditLogs.entityName,
        entityId: auditLogs.entityId,
        action: auditLogs.action,
        newValues: auditLogs.newValues,
        createdAt: auditLogs.createdAt,
        username: users.username,
        role: users.role
      }).from(auditLogs).leftJoin(users, (0, import_drizzle_orm11.eq)(auditLogs.userId, users.id)).orderBy((0, import_drizzle_orm11.desc)(auditLogs.createdAt)).limit(50);
      return { data: logs };
    } catch (e) {
      request.log.error(e);
      return reply.status(500).send({ error: "\u0641\u0634\u0644 \u0627\u0633\u062A\u0631\u062C\u0627\u0639 \u0633\u062C\u0644 \u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A" });
    }
  });
}

// server/src/server.ts
import_dotenv2.default.config({ path: import_path3.default.resolve(process.cwd(), "../.env") });
var fastify = (0, import_fastify.default)({
  logger: true,
  bodyLimit: 50 * 1024 * 1024
});
fastify.register(import_helmet.default, { global: true });
fastify.register(import_cors.default, {
  origin: true,
  credentials: true
});
fastify.register(import_cookie.default);
fastify.register(import_rate_limit.default, {
  max: 100,
  timeWindow: "1 minute"
});
fastify.setErrorHandler(function(error, request, reply) {
  this.log.error(error);
  if (error.validation) {
    return reply.status(400).send({ error: "\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629", details: error.validation });
  }
  if (error.statusCode === 429) {
    return reply.status(429).send({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u062A\u0645 \u062A\u062C\u0627\u0648\u0632 \u0627\u0644\u062D\u062F \u0627\u0644\u0645\u0633\u0645\u0648\u062D \u0645\u0646 \u0627\u0644\u0637\u0644\u0628\u0627\u062A\u060C \u064A\u0631\u062C\u0649 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0644\u0627\u062D\u0642\u0627\u064B" });
  }
  if (error.statusCode && error.statusCode < 500) {
    return reply.status(error.statusCode).send({ error: error.message });
  }
  reply.status(500).send({ error: "\u062D\u062F\u062B \u062E\u0637\u0623 \u062F\u0627\u062E\u0644\u064A \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645\u060C \u064A\u0631\u062C\u0649 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0644\u0627\u062D\u0642\u0627\u064B" });
});
fastify.register(authRoutes, { prefix: "/api/v1/auth" });
fastify.register(customerRoutes, { prefix: "/api/v1/customers" });
fastify.register(lookupRoutes, { prefix: "/api/v1/lookups" });
fastify.register(maintenanceRoutes, { prefix: "/api/v1/maintenance" });
fastify.register(installmentsRoutes, { prefix: "/api/v1/installments" });
fastify.register(expensesRoutes, { prefix: "/api/v1/expenses" });
fastify.register(inventoryRoutes, { prefix: "/api/v1/inventory" });
fastify.register(employeesRoutes, { prefix: "/api/v1/employees" });
fastify.register(reportsRoutes, { prefix: "/api/v1/reports" });
fastify.register(dashboardRoutes, { prefix: "/api/v1/dashboard" });
fastify.register(usersRoutes, { prefix: "/api/v1/users" });
fastify.register(settingsRoutes, { prefix: "/api/v1/settings" });
fastify.get("/api/v1/healthz", async (request, reply) => {
  return { status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() };
});
fastify.get("/api/v1/readyz", async (request, reply) => {
  try {
    const res = await db.get(import_drizzle_orm12.sql`SELECT 1`);
    if (res) {
      return { status: "ready", db: "connected", timestamp: (/* @__PURE__ */ new Date()).toISOString() };
    }
    reply.status(503).send({ status: "error", message: "DB not ready" });
  } catch (error) {
    reply.status(503).send({ status: "error", message: "DB connection failed" });
  }
});

// api/index-source.ts
async function index_source_default(req, res) {
  try {
    await fastify.ready();
    fastify.server.emit("request", req, res);
  } catch (err) {
    res.status(500).send(`Server Error: ${err.message}
Stack: ${err.stack}`);
  }
}
module.exports = index_source_default; 
