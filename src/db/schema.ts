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
  // Product ratings and popularity
  rating: real("rating"), // Average rating (0-5)
  reviewCount: integer("review_count").notNull().default(0),
  popularity: integer("popularity").notNull().default(0), // Calculated based on sales/views
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
  // Detailed order tracking status
  orderStatus: text("order_status", { enum: ["pending", "received", "confirmed", "processing", "packed", "shipped", "out_for_delivery", "delivered", "cancelled"] }).notNull().default("pending"),
  // Legacy status field for compatibility
  status: text("status", { enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"] }).notNull().default("pending"),
  paymentStatus: text("payment_status", { enum: ["pending", "paid", "failed", "refunded"] }).notNull().default("pending"),
  paymentMethod: text("payment_method"),
  paymentReference: text("payment_reference"),
  estimatedDelivery: integer("estimated_delivery", { mode: "timestamp" }),
  shippedAt: integer("shipped_at", { mode: "timestamp" }),
  deliveredAt: integer("delivered_at", { mode: "timestamp" }),
  notes: text("notes"),
  // Loyalty points earned from this order
  loyaltyPointsEarned: integer("loyalty_points_earned"),
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

// Recently Viewed Products
export const recentlyViewed = sqliteTable("recently_viewed", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: text("session_id").notNull(),
  productId: integer("product_id").notNull(),
  viewedAt: integer("viewed_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Product Recommendations (for "also bought", "recommended for you")
export const productRecommendations = sqliteTable("product_recommendations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sourceProductId: integer("source_product_id").notNull(),
  recommendedProductId: integer("recommended_product_id").notNull(),
  recommendationType: text("recommendation_type", { enum: ["also_bought", "recommended", "similar"] }).notNull(),
  score: real("score").notNull().default(1.0),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Abandoned Carts
export const abandonedCarts = sqliteTable("abandoned_carts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: text("session_id").notNull(),
  customerEmail: text("customer_email"),
  customerPhone: text("customer_phone"),
  customerName: text("customer_name"),
  items: text("items").notNull(), // JSON string of cart items
  totalAmount: real("total_amount").notNull(),
  recoveryEmailSent: integer("recovery_email_sent", { mode: "boolean" }).notNull().default(false),
  recoveryEmailSentAt: integer("recovery_email_sent_at", { mode: "timestamp" }),
  recoveredAt: integer("recovered_at", { mode: "timestamp" }),
  discountCode: text("discount_code"), // Discount code sent to encourage checkout
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Customer Accounts (for loyalty points and order history)
export const customers = sqliteTable("customers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  name: text("name").notNull(),
  passwordHash: text("password_hash"),
  loyaltyPoints: integer("loyalty_points").notNull().default(0),
  totalSpent: real("total_spent").notNull().default(0),
  totalOrders: integer("total_orders").notNull().default(0),
  isVerified: integer("is_verified", { mode: "boolean" }).notNull().default(false),
  verificationToken: text("verification_token"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Loyalty Points Transactions
export const loyaltyPointsTransactions = sqliteTable("loyalty_points_transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerId: integer("customer_id").notNull(),
  orderId: integer("order_id"),
  points: integer("points").notNull(), // Positive for earned, negative for redeemed
  type: text("type", { enum: ["earned", "redeemed", "expired", "bonus"] }).notNull(),
  description: text("description").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Loyalty Program Settings
export const loyaltySettings = sqliteTable("loyalty_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  pointsPerCedi: real("points_per_cedi").notNull().default(1.0), // Points earned per ₵1 spent
  pointsRedemptionRate: real("points_redemption_rate").notNull().default(0.01), // ₵1 per X points
  minPointsToRedeem: integer("min_points_to_redeem").notNull().default(100),
  expiryDays: integer("expiry_days").notNull().default(365),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Invoices
export const invoices = sqliteTable("invoices", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  invoiceNumber: text("invoice_number").notNull().unique(),
  orderId: integer("order_id").notNull(),
  orderNumber: text("order_number").notNull(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email"),
  customerPhone: text("customer_phone"),
  billingAddress: text("billing_address"),
  items: text("items").notNull(), // JSON string
  subtotal: real("subtotal").notNull(),
  discount: real("discount"),
  tax: real("tax"),
  total: real("total").notNull(),
  paymentMethod: text("payment_method"),
  paymentReference: text("payment_reference"),
  status: text("status", { enum: ["draft", "issued", "paid", "cancelled"] }).notNull().default("draft"),
  issuedAt: integer("issued_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  paidAt: integer("paid_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
