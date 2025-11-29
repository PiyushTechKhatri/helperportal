import { sql, relations } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  decimal,
  jsonb,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum("user_role", ["user", "client", "worker", "agent", "admin"]);
export const subscriptionTierEnum = pgEnum("subscription_tier", ["free", "basic", "premium", "business"]);
export const verificationLevelEnum = pgEnum("verification_level", ["none", "basic", "police", "premium"]);
export const workTypeEnum = pgEnum("work_type", ["full_time", "part_time", "contract"]);
export const jobStatusEnum = pgEnum("job_status", ["active", "closed", "pending"]);
export const workerStatusEnum = pgEnum("worker_status", ["pending", "approved", "rejected"]);
export const genderEnum = pgEnum("gender", ["male", "female", "other"]);

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// Users table - supports all roles
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  password: varchar("password"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  phone: varchar("phone"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").default("user").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  preferredLanguage: varchar("preferred_language").default("en"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Categories for workers (Maid, Driver, Carpenter, etc.)
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  nameHi: varchar("name_hi"),
  slug: varchar("slug").notNull().unique(),
  icon: varchar("icon"),
  description: text("description"),
  descriptionHi: text("description_hi"),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Areas in Jaipur
export const areas = pgTable("areas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  nameHi: varchar("name_hi"),
  slug: varchar("slug").notNull().unique(),
  description: text("description"),
  descriptionHi: text("description_hi"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Worker profiles
export const workers = pgTable("workers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  agentId: varchar("agent_id").references(() => users.id),
  name: varchar("name").notNull(),
  phone: varchar("phone").notNull(),
  whatsapp: varchar("whatsapp"),
  email: varchar("email"),
  photo: varchar("photo"),
  age: integer("age"),
  gender: genderEnum("gender"),
  categoryId: varchar("category_id").references(() => categories.id).notNull(),
  areaId: varchar("area_id").references(() => areas.id).notNull(),
  skills: text("skills").array(),
  experience: integer("experience").default(0),
  salaryExpectation: integer("salary_expectation"),
  salaryType: varchar("salary_type").default("monthly"),
  workType: workTypeEnum("work_type").default("full_time"),
  availability: varchar("availability"),
  verificationLevel: verificationLevelEnum("verification_level").default("none"),
  status: workerStatusEnum("status").default("pending"),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  totalRatings: integer("total_ratings").default(0),
  bio: text("bio"),
  address: text("address"),
  reference: text("reference"),
  isActive: boolean("is_active").default(true).notNull(),
  viewCount: integer("view_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// KYC Documents
export const kycDocuments = pgTable("kyc_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workerId: varchar("worker_id").references(() => workers.id).notNull(),
  documentType: varchar("document_type").notNull(),
  documentNumber: varchar("document_number"),
  documentUrl: varchar("document_url").notNull(),
  isVerified: boolean("is_verified").default(false),
  verifiedBy: varchar("verified_by").references(() => users.id),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Subscription Plans
export const subscriptionPlans = pgTable("subscription_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  tier: subscriptionTierEnum("tier").notNull().unique(),
  price: integer("price").notNull(),
  currency: varchar("currency").default("INR"),
  contactLimit: integer("contact_limit"),
  jobPostLimit: integer("job_post_limit"),
  hasWhatsappAccess: boolean("has_whatsapp_access").default(false),
  userLimit: integer("user_limit").default(1),
  features: text("features").array(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Subscriptions
export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  planId: varchar("plan_id").references(() => subscriptionPlans.id).notNull(),
  status: varchar("status").default("active"),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  contactsUsed: integer("contacts_used").default(0),
  jobPostsUsed: integer("job_posts_used").default(0),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payments
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  subscriptionId: varchar("subscription_id").references(() => subscriptions.id),
  amount: integer("amount").notNull(),
  currency: varchar("currency").default("INR"),
  status: varchar("status").default("pending"),
  paymentMethod: varchar("payment_method"),
  stripePaymentId: varchar("stripe_payment_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Job Postings
export const jobs = pgTable("jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  categoryId: varchar("category_id").references(() => categories.id).notNull(),
  areaId: varchar("area_id").references(() => areas.id).notNull(),
  workType: workTypeEnum("work_type").default("full_time"),
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  salaryType: varchar("salary_type").default("monthly"),
  workersNeeded: integer("workers_needed").default(1),
  requirements: text("requirements"),
  status: jobStatusEnum("status").default("active"),
  contactPhone: varchar("contact_phone"),
  contactWhatsapp: varchar("contact_whatsapp"),
  isUrgent: boolean("is_urgent").default(false),
  viewCount: integer("view_count").default(0),
  applicationCount: integer("application_count").default(0),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Contact Views - tracking which workers a client has viewed
export const contactViews = pgTable("contact_views", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  workerId: varchar("worker_id").references(() => workers.id).notNull(),
  viewedAt: timestamp("viewed_at").defaultNow(),
});

// Saved/Favorite Workers
export const savedWorkers = pgTable("saved_workers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  workerId: varchar("worker_id").references(() => workers.id).notNull(),
  savedAt: timestamp("saved_at").defaultNow(),
});

// Agent Assignments (which areas an agent handles)
export const agentAssignments = pgTable("agent_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agentId: varchar("agent_id").references(() => users.id).notNull(),
  areaId: varchar("area_id").references(() => areas.id).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  workers: many(workers),
  subscriptions: many(subscriptions),
  payments: many(payments),
  jobs: many(jobs),
  contactViews: many(contactViews),
  savedWorkers: many(savedWorkers),
}));

export const workersRelations = relations(workers, ({ one, many }) => ({
  user: one(users, { fields: [workers.userId], references: [users.id] }),
  agent: one(users, { fields: [workers.agentId], references: [users.id] }),
  category: one(categories, { fields: [workers.categoryId], references: [categories.id] }),
  area: one(areas, { fields: [workers.areaId], references: [areas.id] }),
  kycDocuments: many(kycDocuments),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  workers: many(workers),
  jobs: many(jobs),
}));

export const areasRelations = relations(areas, ({ many }) => ({
  workers: many(workers),
  jobs: many(jobs),
  agentAssignments: many(agentAssignments),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, { fields: [subscriptions.userId], references: [users.id] }),
  plan: one(subscriptionPlans, { fields: [subscriptions.planId], references: [subscriptionPlans.id] }),
}));

export const jobsRelations = relations(jobs, ({ one }) => ({
  user: one(users, { fields: [jobs.userId], references: [users.id] }),
  category: one(categories, { fields: [jobs.categoryId], references: [categories.id] }),
  area: one(areas, { fields: [jobs.areaId], references: [areas.id] }),
}));

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true, createdAt: true });
export const insertAreaSchema = createInsertSchema(areas).omit({ id: true, createdAt: true });
export const insertWorkerSchema = createInsertSchema(workers).omit({ id: true, createdAt: true, updatedAt: true });
export const insertKycDocumentSchema = createInsertSchema(kycDocuments).omit({ id: true, createdAt: true });
export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({ id: true, createdAt: true });
export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true });
export const insertJobSchema = createInsertSchema(jobs).omit({ id: true, createdAt: true, updatedAt: true });
export const insertContactViewSchema = createInsertSchema(contactViews).omit({ id: true, viewedAt: true });
export const insertSavedWorkerSchema = createInsertSchema(savedWorkers).omit({ id: true, savedAt: true });
export const insertAgentAssignmentSchema = createInsertSchema(agentAssignments).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Area = typeof areas.$inferSelect;
export type InsertArea = z.infer<typeof insertAreaSchema>;

export type Worker = typeof workers.$inferSelect;
export type InsertWorker = z.infer<typeof insertWorkerSchema>;

export type KycDocument = typeof kycDocuments.$inferSelect;
export type InsertKycDocument = z.infer<typeof insertKycDocumentSchema>;

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;

export type ContactView = typeof contactViews.$inferSelect;
export type InsertContactView = z.infer<typeof insertContactViewSchema>;

export type SavedWorker = typeof savedWorkers.$inferSelect;
export type InsertSavedWorker = z.infer<typeof insertSavedWorkerSchema>;

export type AgentAssignment = typeof agentAssignments.$inferSelect;
export type InsertAgentAssignment = z.infer<typeof insertAgentAssignmentSchema>;

// Extended types for frontend
export type WorkerWithDetails = Worker & {
  category?: Category;
  area?: Area;
  agent?: User;
};

export type JobWithDetails = Job & {
  category?: Category;
  area?: Area;
  user?: User;
};

export type SubscriptionWithPlan = Subscription & {
  plan?: SubscriptionPlan;
};
