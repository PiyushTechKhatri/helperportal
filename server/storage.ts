import { eq, and, ilike, gte, lte, inArray, desc, sql } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  categories,
  areas,
  workers,
  kycDocuments,
  subscriptionPlans,
  subscriptions,
  payments,
  jobs,
  contactViews,
  savedWorkers,
  agentAssignments,
  type User,
  type UpsertUser,
  type Category,
  type InsertCategory,
  type Area,
  type InsertArea,
  type Worker,
  type InsertWorker,
  type KycDocument,
  type InsertKycDocument,
  type SubscriptionPlan,
  type InsertSubscriptionPlan,
  type Subscription,
  type InsertSubscription,
  type Payment,
  type InsertPayment,
  type Job,
  type InsertJob,
  type ContactView,
  type InsertContactView,
  type SavedWorker,
  type InsertSavedWorker,
  type WorkerWithDetails,
  type JobWithDetails,
  type SubscriptionWithPlan,
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: any): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserRole(userId: string, role: string): Promise<User | undefined>;
  getAgents(): Promise<User[]>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Areas
  getAreas(): Promise<Area[]>;
  getAreaBySlug(slug: string): Promise<Area | undefined>;
  createArea(area: InsertArea): Promise<Area>;

  // Workers
  getWorkers(filters?: WorkerFilters): Promise<WorkerWithDetails[]>;
  getWorkerById(id: string): Promise<WorkerWithDetails | undefined>;
  getWorkersByAgent(agentId: string): Promise<WorkerWithDetails[]>;
  createWorker(worker: InsertWorker): Promise<Worker>;
  updateWorkerStatus(id: string, status: string): Promise<Worker | undefined>;
  getFeaturedWorkers(limit?: number): Promise<WorkerWithDetails[]>;
  getPendingWorkers(): Promise<WorkerWithDetails[]>;
  incrementWorkerViews(id: string): Promise<void>;

  // Subscription Plans
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  getSubscriptionPlanByTier(tier: string): Promise<SubscriptionPlan | undefined>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;

  // Subscriptions
  getUserSubscription(userId: string): Promise<SubscriptionWithPlan | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscriptionUsage(id: string, contactsUsed?: number, jobPostsUsed?: number): Promise<void>;

  // Jobs
  getJobs(filters?: JobFilters): Promise<JobWithDetails[]>;
  getJobsByUser(userId: string): Promise<JobWithDetails[]>;
  getRecentJobs(limit?: number): Promise<JobWithDetails[]>;
  createJob(job: InsertJob): Promise<Job>;
  updateJobStatus(id: string, status: string): Promise<Job | undefined>;

  // Contact Views
  getContactViews(userId: string): Promise<ContactView[]>;
  hasViewedContact(userId: string, workerId: string): Promise<boolean>;
  recordContactView(view: InsertContactView): Promise<ContactView>;

  // Saved Workers
  getSavedWorkers(userId: string): Promise<WorkerWithDetails[]>;
  saveWorker(save: InsertSavedWorker): Promise<SavedWorker>;
  unsaveWorker(userId: string, workerId: string): Promise<void>;
  isWorkerSaved(userId: string, workerId: string): Promise<boolean>;

  // Agent Assignments
  assignAgentToArea(agentId: string, areaId: string): Promise<void>;
  getAgentAreas(agentId: string): Promise<Area[]>;

  // Stats
  getStats(): Promise<{ workers: number; employers: number; verified: number }>;
  getAdminStats(): Promise<{
    totalWorkers: number;
    totalClients: number;
    totalAgents: number;
    activeSubscriptions: number;
    monthlyRevenue: number;
    pendingApprovals: number;
  }>;
  getAgentStats(agentId: string): Promise<{
    totalWorkers: number;
    pendingApproval: number;
    approved: number;
    thisMonth: number;
  }>;

  // Seeding
  seedDefaultData(): Promise<void>;
}

interface WorkerFilters {
  categories?: string[];
  areas?: string[];
  minExp?: number;
  maxExp?: number;
  minSalary?: number;
  maxSalary?: number;
  gender?: string;
  workType?: string;
  query?: string;
}

interface JobFilters {
  categories?: string[];
  areas?: string[];
  workType?: string;
  status?: string;
}

class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: any): Promise<User> {
    const [result] = await db.insert(users).values(user).returning();
    return result;
  }

  async upsertUser(user: UpsertUser): Promise<User> {
    const [result] = await db
      .insert(users)
      .values(user)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result;
  }

  async updateUserRole(userId: string, role: string): Promise<User | undefined> {
    const [result] = await db
      .update(users)
      .set({ role: role as any, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return result;
  }

  async getAgents(): Promise<User[]> {
    return db.select().from(users).where(eq(users.role, "agent"));
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return db.select().from(categories).where(eq(categories.isActive, true)).orderBy(categories.sortOrder);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
    return result[0];
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [result] = await db.insert(categories).values(category).returning();
    return result;
  }

  // Areas
  async getAreas(): Promise<Area[]> {
    return db.select().from(areas).where(eq(areas.isActive, true)).orderBy(areas.name);
  }

  async getAreaBySlug(slug: string): Promise<Area | undefined> {
    const result = await db.select().from(areas).where(eq(areas.slug, slug)).limit(1);
    return result[0];
  }

  async createArea(area: InsertArea): Promise<Area> {
    const [result] = await db.insert(areas).values(area).returning();
    return result;
  }

  // Workers
  async getWorkers(filters?: WorkerFilters): Promise<WorkerWithDetails[]> {
    const conditions: any[] = [
      eq(workers.isActive, true),
      eq(workers.status, "approved")
    ];
    
    // Apply filters
    if (filters?.categories && filters.categories.length > 0) {
      // Check if categories are slugs or IDs
      const categoryList = await db.select().from(categories)
        .where(inArray(categories.slug, filters.categories));
      
      if (categoryList.length > 0) {
        const categoryIds = categoryList.map(c => c.id);
        conditions.push(inArray(workers.categoryId, categoryIds));
      } else {
        // Assume they're IDs
        conditions.push(inArray(workers.categoryId, filters.categories));
      }
    }
    
    if (filters?.areas && filters.areas.length > 0) {
      // Check if areas are slugs or IDs
      const areaList = await db.select().from(areas)
        .where(inArray(areas.slug, filters.areas));
      
      if (areaList.length > 0) {
        const areaIds = areaList.map(a => a.id);
        conditions.push(inArray(workers.areaId, areaIds));
      } else {
        // Assume they're IDs
        conditions.push(inArray(workers.areaId, filters.areas));
      }
    }
    
    if (filters?.minExp !== undefined && filters.minExp > 0) {
      conditions.push(gte(workers.experience, filters.minExp));
    }
    
    if (filters?.maxExp !== undefined && filters.maxExp < 20) {
      conditions.push(lte(workers.experience, filters.maxExp));
    }
    
    if (filters?.minSalary !== undefined && filters.minSalary > 0) {
      conditions.push(gte(workers.salaryExpectation, filters.minSalary));
    }
    
    if (filters?.maxSalary !== undefined && filters.maxSalary < 100000) {
      conditions.push(lte(workers.salaryExpectation, filters.maxSalary));
    }
    
    if (filters?.gender && filters.gender !== "any") {
      conditions.push(eq(workers.gender, filters.gender as any));
    }
    
    if (filters?.workType && filters.workType !== "any") {
      conditions.push(eq(workers.workType, filters.workType as any));
    }
    
    if (filters?.query) {
      conditions.push(ilike(workers.name, `%${filters.query}%`));
    }

    const result = await db.select().from(workers)
      .leftJoin(categories, eq(workers.categoryId, categories.id))
      .leftJoin(areas, eq(workers.areaId, areas.id))
      .where(and(...conditions))
      .orderBy(desc(workers.createdAt));
    
    return result.map((row) => ({
      ...row.workers,
      category: row.categories ?? undefined,
      area: row.areas ?? undefined,
    }));
  }

  async getWorkerById(id: string): Promise<WorkerWithDetails | undefined> {
    const result = await db.select().from(workers)
      .leftJoin(categories, eq(workers.categoryId, categories.id))
      .leftJoin(areas, eq(workers.areaId, areas.id))
      .leftJoin(users, eq(workers.agentId, users.id))
      .where(eq(workers.id, id))
      .limit(1);
    
    if (!result[0]) return undefined;
    
    return {
      ...result[0].workers,
      category: result[0].categories ?? undefined,
      area: result[0].areas ?? undefined,
      agent: result[0].users ?? undefined,
    };
  }

  async getWorkersByAgent(agentId: string): Promise<WorkerWithDetails[]> {
    const result = await db.select().from(workers)
      .leftJoin(categories, eq(workers.categoryId, categories.id))
      .leftJoin(areas, eq(workers.areaId, areas.id))
      .where(eq(workers.agentId, agentId))
      .orderBy(desc(workers.createdAt));
    
    return result.map((row) => ({
      ...row.workers,
      category: row.categories ?? undefined,
      area: row.areas ?? undefined,
    }));
  }

  async createWorker(worker: InsertWorker): Promise<Worker> {
    const [result] = await db.insert(workers).values(worker).returning();
    return result;
  }

  async updateWorkerStatus(id: string, status: string): Promise<Worker | undefined> {
    const [result] = await db
      .update(workers)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(workers.id, id))
      .returning();
    return result;
  }

  async getFeaturedWorkers(limit = 10): Promise<WorkerWithDetails[]> {
    const result = await db.select().from(workers)
      .leftJoin(categories, eq(workers.categoryId, categories.id))
      .leftJoin(areas, eq(workers.areaId, areas.id))
      .where(and(
        eq(workers.isActive, true),
        eq(workers.status, "approved")
      ))
      .orderBy(desc(workers.rating), desc(workers.viewCount))
      .limit(limit);
    
    return result.map((row) => ({
      ...row.workers,
      category: row.categories ?? undefined,
      area: row.areas ?? undefined,
    }));
  }

  async getPendingWorkers(): Promise<WorkerWithDetails[]> {
    const result = await db.select().from(workers)
      .leftJoin(categories, eq(workers.categoryId, categories.id))
      .leftJoin(areas, eq(workers.areaId, areas.id))
      .leftJoin(users, eq(workers.agentId, users.id))
      .where(eq(workers.status, "pending"))
      .orderBy(desc(workers.createdAt));
    
    return result.map((row) => ({
      ...row.workers,
      category: row.categories ?? undefined,
      area: row.areas ?? undefined,
      agent: row.users ?? undefined,
    }));
  }

  async incrementWorkerViews(id: string): Promise<void> {
    await db.update(workers)
      .set({ viewCount: sql`${workers.viewCount} + 1` })
      .where(eq(workers.id, id));
  }

  // Subscription Plans
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return db.select().from(subscriptionPlans).where(eq(subscriptionPlans.isActive, true));
  }

  async getSubscriptionPlanByTier(tier: string): Promise<SubscriptionPlan | undefined> {
    const result = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.tier, tier as any)).limit(1);
    return result[0];
  }

  async createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const [result] = await db.insert(subscriptionPlans).values(plan).returning();
    return result;
  }

  // Subscriptions
  async getUserSubscription(userId: string): Promise<SubscriptionWithPlan | undefined> {
    const result = await db.select().from(subscriptions)
      .leftJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .where(and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, "active")
      ))
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);
    
    if (!result[0]) return undefined;
    
    return {
      ...result[0].subscriptions,
      plan: result[0].subscription_plans ?? undefined,
    };
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const [result] = await db.insert(subscriptions).values(subscription).returning();
    return result;
  }

  async updateSubscriptionUsage(id: string, contactsUsed?: number, jobPostsUsed?: number): Promise<void> {
    const updates: any = { updatedAt: new Date() };
    if (contactsUsed !== undefined) updates.contactsUsed = contactsUsed;
    if (jobPostsUsed !== undefined) updates.jobPostsUsed = jobPostsUsed;
    
    await db.update(subscriptions).set(updates).where(eq(subscriptions.id, id));
  }

  // Jobs
  async getJobs(filters?: JobFilters): Promise<JobWithDetails[]> {
    const result = await db.select().from(jobs)
      .leftJoin(categories, eq(jobs.categoryId, categories.id))
      .leftJoin(areas, eq(jobs.areaId, areas.id))
      .leftJoin(users, eq(jobs.userId, users.id))
      .where(eq(jobs.status, "active"))
      .orderBy(desc(jobs.isUrgent), desc(jobs.createdAt));
    
    return result.map((row) => ({
      ...row.jobs,
      category: row.categories ?? undefined,
      area: row.areas ?? undefined,
      user: row.users ?? undefined,
    }));
  }

  async getJobsByUser(userId: string): Promise<JobWithDetails[]> {
    const result = await db.select().from(jobs)
      .leftJoin(categories, eq(jobs.categoryId, categories.id))
      .leftJoin(areas, eq(jobs.areaId, areas.id))
      .where(eq(jobs.userId, userId))
      .orderBy(desc(jobs.createdAt));
    
    return result.map((row) => ({
      ...row.jobs,
      category: row.categories ?? undefined,
      area: row.areas ?? undefined,
    }));
  }

  async getRecentJobs(limit = 10): Promise<JobWithDetails[]> {
    const result = await db.select().from(jobs)
      .leftJoin(categories, eq(jobs.categoryId, categories.id))
      .leftJoin(areas, eq(jobs.areaId, areas.id))
      .where(eq(jobs.status, "active"))
      .orderBy(desc(jobs.isUrgent), desc(jobs.createdAt))
      .limit(limit);
    
    return result.map((row) => ({
      ...row.jobs,
      category: row.categories ?? undefined,
      area: row.areas ?? undefined,
    }));
  }

  async createJob(job: InsertJob): Promise<Job> {
    const [result] = await db.insert(jobs).values(job).returning();
    return result;
  }

  async updateJobStatus(id: string, status: string): Promise<Job | undefined> {
    const [result] = await db
      .update(jobs)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(jobs.id, id))
      .returning();
    return result;
  }

  // Contact Views
  async getContactViews(userId: string): Promise<ContactView[]> {
    return db.select().from(contactViews).where(eq(contactViews.userId, userId)).orderBy(desc(contactViews.viewedAt));
  }

  async hasViewedContact(userId: string, workerId: string): Promise<boolean> {
    const result = await db.select().from(contactViews)
      .where(and(eq(contactViews.userId, userId), eq(contactViews.workerId, workerId)))
      .limit(1);
    return result.length > 0;
  }

  async recordContactView(view: InsertContactView): Promise<ContactView> {
    const [result] = await db.insert(contactViews).values(view).returning();
    return result;
  }

  // Saved Workers
  async getSavedWorkers(userId: string): Promise<WorkerWithDetails[]> {
    const result = await db.select().from(savedWorkers)
      .innerJoin(workers, eq(savedWorkers.workerId, workers.id))
      .leftJoin(categories, eq(workers.categoryId, categories.id))
      .leftJoin(areas, eq(workers.areaId, areas.id))
      .where(eq(savedWorkers.userId, userId))
      .orderBy(desc(savedWorkers.savedAt));
    
    return result.map((row) => ({
      ...row.workers,
      category: row.categories ?? undefined,
      area: row.areas ?? undefined,
    }));
  }

  async saveWorker(save: InsertSavedWorker): Promise<SavedWorker> {
    const [result] = await db.insert(savedWorkers).values(save).returning();
    return result;
  }

  async unsaveWorker(userId: string, workerId: string): Promise<void> {
    await db.delete(savedWorkers).where(and(
      eq(savedWorkers.userId, userId),
      eq(savedWorkers.workerId, workerId)
    ));
  }

  async isWorkerSaved(userId: string, workerId: string): Promise<boolean> {
    const result = await db.select().from(savedWorkers)
      .where(and(eq(savedWorkers.userId, userId), eq(savedWorkers.workerId, workerId)))
      .limit(1);
    return result.length > 0;
  }

  // Stats
  async getStats(): Promise<{ workers: number; employers: number; verified: number }> {
    const workerCount = await db.select({ count: sql<number>`count(*)` }).from(workers).where(eq(workers.status, "approved"));
    const clientCount = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.role, "client"));
    const verifiedCount = await db.select({ count: sql<number>`count(*)` }).from(workers)
      .where(and(eq(workers.status, "approved"), sql`${workers.verificationLevel} != 'none'`));
    
    return {
      workers: Number(workerCount[0]?.count || 0),
      employers: Number(clientCount[0]?.count || 0),
      verified: Number(verifiedCount[0]?.count || 0),
    };
  }

  async getAdminStats(): Promise<{
    totalWorkers: number;
    totalClients: number;
    totalAgents: number;
    activeSubscriptions: number;
    monthlyRevenue: number;
    pendingApprovals: number;
  }> {
    const workerCount = await db.select({ count: sql<number>`count(*)` }).from(workers);
    const clientCount = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.role, "client"));
    const agentCount = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.role, "agent"));
    const subCount = await db.select({ count: sql<number>`count(*)` }).from(subscriptions).where(eq(subscriptions.status, "active"));
    const pendingCount = await db.select({ count: sql<number>`count(*)` }).from(workers).where(eq(workers.status, "pending"));
    
    return {
      totalWorkers: Number(workerCount[0]?.count || 0),
      totalClients: Number(clientCount[0]?.count || 0),
      totalAgents: Number(agentCount[0]?.count || 0),
      activeSubscriptions: Number(subCount[0]?.count || 0),
      monthlyRevenue: 0,
      pendingApprovals: Number(pendingCount[0]?.count || 0),
    };
  }

  async getAgentStats(agentId: string): Promise<{
    totalWorkers: number;
    pendingApproval: number;
    approved: number;
    thisMonth: number;
  }> {
    const total = await db.select({ count: sql<number>`count(*)` }).from(workers).where(eq(workers.agentId, agentId));
    const pending = await db.select({ count: sql<number>`count(*)` }).from(workers).where(and(eq(workers.agentId, agentId), eq(workers.status, "pending")));
    const approved = await db.select({ count: sql<number>`count(*)` }).from(workers).where(and(eq(workers.agentId, agentId), eq(workers.status, "approved")));
    
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const thisMonth = await db.select({ count: sql<number>`count(*)` }).from(workers)
      .where(and(eq(workers.agentId, agentId), gte(workers.createdAt, startOfMonth)));
    
    return {
      totalWorkers: Number(total[0]?.count || 0),
      pendingApproval: Number(pending[0]?.count || 0),
      approved: Number(approved[0]?.count || 0),
      thisMonth: Number(thisMonth[0]?.count || 0),
    };
  }

  // Agent Assignments
  async assignAgentToArea(agentId: string, areaId: string): Promise<void> {
    await db.insert(agentAssignments).values({
      agentId,
      areaId
    });
  }

  async getAgentAreas(agentId: string): Promise<Area[]> {
    const result = await db.select().from(agentAssignments)
      .innerJoin(areas, eq(agentAssignments.areaId, areas.id))
      .where(and(eq(agentAssignments.agentId, agentId), eq(agentAssignments.isActive, true)));
    
    return result.map(row => row.areas);
  }

  // Seeding
  async seedDefaultData(): Promise<void> {
    // Check if data already exists
    const existingCategories = await db.select().from(categories).limit(1);
    if (existingCategories.length > 0) return;

    // Seed categories
    const defaultCategories = [
      { name: "Maid", nameHi: "मेड", slug: "maid", icon: "home", sortOrder: 1 },
      { name: "Driver", nameHi: "ड्राइवर", slug: "driver", icon: "car", sortOrder: 2 },
      { name: "Cook", nameHi: "कुक", slug: "cook", icon: "utensils-crossed", sortOrder: 3 },
      { name: "Security Guard", nameHi: "सिक्योरिटी गार्ड", slug: "security", icon: "shield-check", sortOrder: 4 },
      { name: "Factory Worker", nameHi: "फैक्ट्री वर्कर", slug: "factory", icon: "factory", sortOrder: 5 },
      { name: "Carpenter", nameHi: "कारपेंटर", slug: "carpenter", icon: "hammer", sortOrder: 6 },
      { name: "Electrician", nameHi: "इलेक्ट्रीशियन", slug: "electrician", icon: "zap", sortOrder: 7 },
      { name: "Plumber", nameHi: "प्लंबर", slug: "plumber", icon: "droplet", sortOrder: 8 },
      { name: "Office Boy", nameHi: "ऑफिस बॉय", slug: "office", icon: "building-2", sortOrder: 9 },
      { name: "Construction Worker", nameHi: "कंस्ट्रक्शन वर्कर", slug: "construction", icon: "hard-hat", sortOrder: 10 },
      { name: "Painter", nameHi: "पेंटर", slug: "painter", icon: "paintbrush", sortOrder: 11 },
      { name: "Gardener", nameHi: "माली", slug: "gardener", icon: "tree", sortOrder: 12 },
    ];

    await db.insert(categories).values(defaultCategories);

    // Seed areas
    const defaultAreas = [
      { name: "Mansarovar", nameHi: "मानसरोवर", slug: "mansarovar" },
      { name: "Sitapura", nameHi: "सीतापुरा", slug: "sitapura" },
      { name: "Malviya Nagar", nameHi: "मालवीय नगर", slug: "malviya-nagar" },
      { name: "Vaishali Nagar", nameHi: "वैशाली नगर", slug: "vaishali-nagar" },
      { name: "C-Scheme", nameHi: "सी-स्कीम", slug: "c-scheme" },
      { name: "Raja Park", nameHi: "राजा पार्क", slug: "raja-park" },
      { name: "Tonk Road", nameHi: "टोंक रोड", slug: "tonk-road" },
      { name: "Jagatpura", nameHi: "जगतपुरा", slug: "jagatpura" },
      { name: "Sanganer", nameHi: "सांगानेर", slug: "sanganer" },
      { name: "Jhotwara", nameHi: "झोटवाड़ा", slug: "jhotwara" },
      { name: "Sodala", nameHi: "सोडाला", slug: "sodala" },
      { name: "Adarsh Nagar", nameHi: "आदर्श नगर", slug: "adarsh-nagar" },
      { name: "Bani Park", nameHi: "बानी पार्क", slug: "bani-park" },
      { name: "MI Road", nameHi: "एमआई रोड", slug: "mi-road" },
      { name: "Vidhyadhar Nagar", nameHi: "विद्याधर नगर", slug: "vidhyadhar-nagar" },
    ];

    await db.insert(areas).values(defaultAreas);

    // Seed subscription plans
    const defaultPlans = [
      { 
        name: "Free", 
        tier: "free" as const, 
        price: 0, 
        contactLimit: 3, 
        jobPostLimit: 1, 
        hasWhatsappAccess: false,
        features: ["View 3 worker contacts", "Post 1 job", "Basic search filters"] 
      },
      { 
        name: "Basic", 
        tier: "basic" as const, 
        price: 299, 
        contactLimit: 20, 
        jobPostLimit: 5, 
        hasWhatsappAccess: false,
        features: ["View 20 worker contacts", "Post 5 jobs", "All search filters", "Email support"] 
      },
      { 
        name: "Premium", 
        tier: "premium" as const, 
        price: 599, 
        contactLimit: 50, 
        jobPostLimit: 15, 
        hasWhatsappAccess: true,
        features: ["View 50 worker contacts", "Post 15 jobs", "WhatsApp access", "Priority support", "Featured job posts"] 
      },
      { 
        name: "Business", 
        tier: "business" as const, 
        price: 1499, 
        contactLimit: -1, 
        jobPostLimit: -1, 
        hasWhatsappAccess: true,
        userLimit: 5,
        features: ["Unlimited contacts", "Unlimited jobs", "WhatsApp access", "Dedicated support", "5 team members", "Analytics dashboard"] 
      },
    ];

    await db.insert(subscriptionPlans).values(defaultPlans);

    // Create default admin and agent accounts
    const bcrypt = await import("bcrypt");
    const defaultPassword = await bcrypt.hash("admin123", 10);
    
    const defaultUsers = [
      {
        email: "admin@jaipurhelp.com",
        password: defaultPassword,
        firstName: "Admin",
        lastName: "User",
        role: "admin" as const
      },
      {
        email: "agent@jaipurhelp.com", 
        password: defaultPassword,
        firstName: "Agent",
        lastName: "User",
        role: "agent" as const
      }
    ];

    for (const user of defaultUsers) {
      const existing = await this.getUserByEmail(user.email);
      if (!existing) {
        await db.insert(users).values(user);
      }
    }
  }
}

export const storage = new DatabaseStorage();
