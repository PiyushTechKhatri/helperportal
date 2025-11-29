import { Express, Request } from "express";
import { storage } from "./storage";
import { isAuthenticated } from "./simpleAuth";
import { insertWorkerSchema, insertJobSchema } from "@shared/schema";

export async function registerRoutes(app: Express) {
  // Seed default data on startup
  await storage.seedDefaultData();

  // Helper to get user from session
  const getUser = (req: Request) => {
    const userId = (req as any).session?.userId;
    return userId ? { id: userId } : null;
  };



  // Categories
  app.get("/api/categories", async (req, res) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  // Areas
  app.get("/api/areas", async (req, res) => {
    const areas = await storage.getAreas();
    res.json(areas);
  });

  // Stats
  app.get("/api/stats", async (req, res) => {
    const stats = await storage.getStats();
    res.json(stats);
  });

  // Workers
  app.get("/api/workers", async (req, res) => {
    const filters = {
      categories: req.query.categories ? (req.query.categories as string).split(",") : undefined,
      areas: req.query.areas ? (req.query.areas as string).split(",") : undefined,
      minExp: req.query.minExp ? parseInt(req.query.minExp as string) : undefined,
      maxExp: req.query.maxExp ? parseInt(req.query.maxExp as string) : undefined,
      minSalary: req.query.minSalary ? parseInt(req.query.minSalary as string) : undefined,
      maxSalary: req.query.maxSalary ? parseInt(req.query.maxSalary as string) : undefined,
      gender: req.query.gender as string | undefined,
      workType: req.query.workType as string | undefined,
      query: req.query.q as string | undefined,
    };
    
    const workers = await storage.getWorkers(filters);
    res.json(workers);
  });

  app.get("/api/workers/featured", async (req, res) => {
    const workers = await storage.getFeaturedWorkers(10);
    res.json(workers);
  });

  app.get("/api/workers/:id", async (req, res) => {
    const worker = await storage.getWorkerById(req.params.id);
    if (!worker) {
      return res.status(404).json({ message: "Worker not found" });
    }
    
    // Increment view count
    await storage.incrementWorkerViews(req.params.id);
    
    res.json(worker);
  });

  // Subscription Plans
  app.get("/api/subscription-plans", async (req, res) => {
    const plans = await storage.getSubscriptionPlans();
    res.json(plans);
  });

  // User Subscription
  app.get("/api/subscription", isAuthenticated, async (req, res) => {
    const user = getUser(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let subscription = await storage.getUserSubscription(user.id);
    
    // If no subscription, create a free one
    if (!subscription) {
      const freePlan = await storage.getSubscriptionPlanByTier("free");
      if (freePlan) {
        await storage.createSubscription({
          userId: user.id,
          planId: freePlan.id,
          status: "active",
        });
        subscription = await storage.getUserSubscription(user.id);
      }
    }

    res.json(subscription);
  });

  app.post("/api/subscriptions", isAuthenticated, async (req, res) => {
    const user = getUser(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { planId } = req.body;
    
    const subscription = await storage.createSubscription({
      userId: user.id,
      planId,
      status: "active",
    });

    res.json(subscription);
  });

  // Jobs
  app.get("/api/jobs", async (req, res) => {
    const jobs = await storage.getJobs();
    res.json(jobs);
  });

  app.get("/api/jobs/recent", async (req, res) => {
    const jobs = await storage.getRecentJobs(10);
    res.json(jobs);
  });

  app.get("/api/my-jobs", isAuthenticated, async (req, res) => {
    const user = getUser(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const jobs = await storage.getJobsByUser(user.id);
    res.json(jobs);
  });

  app.post("/api/jobs", isAuthenticated, async (req, res) => {
    const user = getUser(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const validatedData = insertJobSchema.safeParse({
      ...req.body,
      userId: user.id,
    });

    if (!validatedData.success) {
      return res.status(400).json({ message: "Invalid data", errors: validatedData.error.errors });
    }

    const job = await storage.createJob(validatedData.data);
    res.json(job);
  });

  // Saved Workers
  app.get("/api/saved-workers", isAuthenticated, async (req, res) => {
    const user = getUser(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const workers = await storage.getSavedWorkers(user.id);
    res.json(workers);
  });

  app.post("/api/saved-workers", isAuthenticated, async (req, res) => {
    const user = getUser(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { workerId } = req.body;
    
    const isSaved = await storage.isWorkerSaved(user.id, workerId);
    if (isSaved) {
      await storage.unsaveWorker(user.id, workerId);
      return res.json({ saved: false });
    }

    await storage.saveWorker({ userId: user.id, workerId });
    res.json({ saved: true });
  });

  // Contact Views
  app.get("/api/contact-views", isAuthenticated, async (req, res) => {
    const user = getUser(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const views = await storage.getContactViews(user.id);
    res.json(views);
  });

  app.post("/api/contact-views", isAuthenticated, async (req, res) => {
    const user = getUser(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { workerId } = req.body;

    // Check if already viewed
    const hasViewed = await storage.hasViewedContact(user.id, workerId);
    if (hasViewed) {
      return res.json({ success: true, alreadyViewed: true });
    }

    // Check subscription limits
    const subscription = await storage.getUserSubscription(user.id);
    if (!subscription) {
      return res.status(403).json({ message: "No active subscription" });
    }

    const contactLimit = subscription.plan?.contactLimit ?? 0;
    const contactsUsed = subscription.contactsUsed ?? 0;
    
    if (contactLimit !== -1 && contactsUsed >= contactLimit) {
      return res.status(403).json({ message: "Contact limit reached" });
    }

    // Record view and update usage
    await storage.recordContactView({ userId: user.id, workerId });
    await storage.updateSubscriptionUsage(subscription.id, contactsUsed + 1);

    res.json({ success: true });
  });

  // Agent Routes
  app.get("/api/agent/workers", isAuthenticated, async (req, res) => {
    const user = getUser(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const dbUser = await storage.getUser(user.id);
    if (dbUser?.role !== "agent") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const workers = await storage.getWorkersByAgent(user.id);
    res.json(workers);
  });

  app.get("/api/agent/stats", isAuthenticated, async (req, res) => {
    const user = getUser(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const dbUser = await storage.getUser(user.id);
    if (dbUser?.role !== "agent") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const stats = await storage.getAgentStats(user.id);
    res.json(stats);
  });

  app.post("/api/agent/workers", isAuthenticated, async (req, res) => {
    const user = getUser(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const dbUser = await storage.getUser(user.id);
    if (dbUser?.role !== "agent") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const validatedData = insertWorkerSchema.safeParse({
      ...req.body,
      agentId: user.id,
      status: "pending",
    });

    if (!validatedData.success) {
      return res.status(400).json({ message: "Invalid data", errors: validatedData.error.errors });
    }

    const worker = await storage.createWorker(validatedData.data);
    res.json(worker);
  });

  // Admin Routes
  app.get("/api/admin/workers", isAuthenticated, async (req, res) => {
    const user = getUser(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const dbUser = await storage.getUser(user.id);
    if (dbUser?.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const workers = await storage.getWorkers();
    res.json(workers);
  });

  app.get("/api/admin/workers/pending", isAuthenticated, async (req, res) => {
    const user = getUser(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const dbUser = await storage.getUser(user.id);
    if (dbUser?.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const workers = await storage.getPendingWorkers();
    res.json(workers);
  });

  app.patch("/api/admin/workers/:id/approve", isAuthenticated, async (req, res) => {
    const user = getUser(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const dbUser = await storage.getUser(user.id);
    if (dbUser?.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const worker = await storage.updateWorkerStatus(req.params.id, "approved");
    res.json(worker);
  });

  app.patch("/api/admin/workers/:id/reject", isAuthenticated, async (req, res) => {
    const user = getUser(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const dbUser = await storage.getUser(user.id);
    if (dbUser?.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const worker = await storage.updateWorkerStatus(req.params.id, "rejected");
    res.json(worker);
  });

  app.get("/api/admin/agents", isAuthenticated, async (req, res) => {
    const user = getUser(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const dbUser = await storage.getUser(user.id);
    if (dbUser?.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const agents = await storage.getAgents();
    res.json(agents);
  });

  app.get("/api/admin/subscriptions", isAuthenticated, async (req, res) => {
    const user = getUser(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const dbUser = await storage.getUser(user.id);
    if (dbUser?.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Return empty array for now
    res.json([]);
  });

  app.get("/api/admin/stats", isAuthenticated, async (req, res) => {
    const user = getUser(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const dbUser = await storage.getUser(user.id);
    if (dbUser?.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const stats = await storage.getAdminStats();
    res.json(stats);
  });
}
