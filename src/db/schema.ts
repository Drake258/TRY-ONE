import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["admin", "staff"] }).notNull().default("staff"),
  status: text("status", { enum: ["active", "suspended"] }).notNull().default("active"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  createdBy: integer("created_by"),
  lastLogin: integer("last_login", { mode: "timestamp" }),
  mustChangePassword: integer("must_change_password", { mode: "boolean" }).notNull().default(false),
});

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  category: text("category", { enum: ["laptop", "desktop", "accessory", "part", "service"] }).notNull(),
  description: text("description"),
  price: real("price").notNull(),
  imageUrl: text("image_url"),
  processor: text("processor"),
  ram: text("ram"),
  storage: text("storage"),
  graphics: text("graphics"),
  operatingSystem: text("operating_system"),
  inStock: integer("in_stock", { mode: "boolean" }).notNull().default(true),
  stockQuantity: integer("stock_quantity").notNull().default(0), // Current stock count
  lowStockThreshold: integer("low_stock_threshold").notNull().default(5), // Alert when stock falls below this
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  createdBy: integer("created_by"),
});

export const activityLogs = sqliteTable("activity_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id"),
  username: text("username"),
  action: text("action").notNull(),
  resource: text("resource").notNull(),
  resourceId: text("resource_id"),
  details: text("details"),
  ipAddress: text("ip_address"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const systemSettings = sqliteTable("system_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedBy: integer("updated_by"),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: integer("user_id").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const services = sqliteTable("services", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  category: text("category", { enum: ["repair", "installation", "maintenance", "consultation", "other"] }).notNull().default("repair"),
  description: text("description"),
  price: real("price").notNull(),
  duration: text("duration"), // e.g., "1 hour", "2 days"
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  createdBy: integer("created_by"),
});

export const applications = sqliteTable("applications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  fullName: text("full_name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  email: text("email").notNull(),
  cvPath: text("cv_path"),
  status: text("status", { enum: ["pending", "reviewed", "accepted", "rejected"] }).notNull().default("pending"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// AI Assistant Chat Sessions
export const chatSessions = sqliteTable("chat_sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: text("session_id").notNull().unique(),
  customerName: text("customer_name"),
  customerEmail: text("customer_email"),
  customerPhone: text("customer_phone"),
  orderNumber: text("order_number"),
  status: text("status", { enum: ["active", "closed", "escalated"] }).notNull().default("active"),
  isAiMode: integer("is_ai_mode", { mode: "boolean" }).notNull().default(true),
  assignedTo: integer("assigned_to"), // admin/staff user ID
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// AI Assistant Chat Messages
export const chatMessages = sqliteTable("chat_messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: text("session_id").notNull(),
  message: text("message").notNull(),
  sender: text("sender", { enum: ["customer", "ai", "admin"] }).notNull(),
  senderName: text("sender_name"),
  messageType: text("message_type", { enum: ["text", "order_query", "product_recommendation", "escalation"] }).notNull().default("text"),
  metadata: text("metadata"), // JSON for additional data like product IDs, order info
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// AI Response Templates (Editable by Admin)
export const aiResponses = sqliteTable("ai_responses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  trigger: text("trigger").notNull(), // Keywords that trigger this response
  category: text("category", { enum: ["greeting", "faq", "pricing", "shipping", "returns", "payment", "product", "order", "support", "general"] }).notNull(),
  response: text("response").notNull(),
  keywords: text("keywords"), // Comma-separated keywords for matching
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  priority: integer("priority").notNull().default(0), // Higher priority responses are checked first
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// AI Assistant Settings
export const aiSettings = sqliteTable("ai_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Orders table
export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderNumber: text("order_number").notNull().unique(),
  trackingNumber: text("tracking_number").notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email"),
  shippingAddress: text("shipping_address"),
  billingAddress: text("billing_address"),
  city: text("city"),
  region: text("region"),
  items: text("items").notNull(),
  totalAmount: real("total_amount").notNull(),
  discount: real("discount"),
  promoCode: text("promo_code"),
  status: text("status", { enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"] }).notNull().default("pending"),
  paymentStatus: text("payment_status", { enum: ["pending", "paid", "failed", "refunded"] }).notNull().default("pending"),
  paymentMethod: text("payment_method"),
  paymentReference: text("payment_reference"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Stock History - tracks all stock changes
export const stockHistory = sqliteTable("stock_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id").notNull(),
  changeType: text("change_type", { enum: ["sale", "restock", "adjustment", "return", "damage"] }).notNull(),
  quantity: integer("quantity").notNull(),
  previousStock: integer("previous_stock").notNull(),
  newStock: integer("new_stock").notNull(),
  reason: text("reason"),
  orderId: integer("order_id"),
  performedBy: integer("performed_by"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Stock Alerts - notifications for low stock
export const stockAlerts = sqliteTable("stock_alerts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id").notNull(),
  alertType: text("alert_type", { enum: ["low_stock", "out_of_stock", "restock_needed"] }).notNull(),
  message: text("message").notNull(),
  isRead: integer("is_read", { mode: "boolean" }).notNull().default(false),
  isResolved: integer("is_resolved", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  resolvedAt: integer("resolved_at", { mode: "timestamp" }),
});

// Coupon/Discount Codes
export const coupons = sqliteTable("coupons", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
  description: text("description"),
  discountType: text("discount_type", { enum: ["percentage", "fixed"] }).notNull(),
  discountValue: real("discount_value").notNull(),
  minOrderAmount: real("min_order_amount"),
  maxUses: integer("max_uses"),
  usedCount: integer("used_count").notNull().default(0),
  maxUsesPerUser: integer("max_uses_per_user"),
  validFrom: integer("valid_from", { mode: "timestamp" }),
  validUntil: integer("valid_until", { mode: "timestamp" }),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Customer Wishlist
export const wishlist = sqliteTable("wishlist", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: text("session_id").notNull(),
  productId: integer("product_id").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
