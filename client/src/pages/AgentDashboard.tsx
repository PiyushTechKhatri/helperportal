import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Users,
  Plus,
  Clock,
  CheckCircle,
  TrendingUp,
  Upload,
  UserPlus,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { WorkerWithDetails, Category, Area } from "@shared/schema";

const workerFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  whatsapp: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  age: z.number().min(18).max(70).optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  categoryId: z.string().min(1, "Please select a category"),
  areaId: z.string().min(1, "Please select an area"),
  skills: z.string().optional(),
  experience: z.number().min(0).max(50).optional(),
  salaryExpectation: z.number().min(0).optional(),
  salaryType: z.enum(["monthly", "daily"]).default("monthly"),
  workType: z.enum(["full_time", "part_time", "contract"]).default("full_time"),
  bio: z.string().optional(),
  address: z.string().optional(),
});

type WorkerFormValues = z.infer<typeof workerFormSchema>;

export default function AgentDashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [showAddWorker, setShowAddWorker] = useState(false);

  const form = useForm<WorkerFormValues>({
    resolver: zodResolver(workerFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      whatsapp: "",
      email: "",
      categoryId: "",
      areaId: "",
      skills: "",
      experience: 0,
      salaryExpectation: 0,
      salaryType: "monthly",
      workType: "full_time",
      bio: "",
      address: "",
    },
  });

  const { data: myWorkers, isLoading: workersLoading } = useQuery<WorkerWithDetails[]>({
    queryKey: ["/api/agent/workers"],
    enabled: isAuthenticated && user?.role === "agent",
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: areas } = useQuery<Area[]>({
    queryKey: ["/api/areas"],
  });

  const { data: stats } = useQuery<{
    totalWorkers: number;
    pendingApproval: number;
    approved: number;
    thisMonth: number;
  }>({
    queryKey: ["/api/agent/stats"],
    enabled: isAuthenticated && user?.role === "agent",
  });

  const addWorkerMutation = useMutation({
    mutationFn: async (data: WorkerFormValues) => {
      const processedData = {
        ...data,
        skills: data.skills ? data.skills.split(",").map((s) => s.trim()) : [],
      };
      return apiRequest("POST", "/api/agent/workers", processedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agent/workers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/agent/stats"] });
      toast({
        title: "Worker Added!",
        description: "The worker profile has been created and is pending approval.",
      });
      setShowAddWorker(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add worker. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: WorkerFormValues) => {
    addWorkerMutation.mutate(data);
  };

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "agent")) {
      toast({
        title: "Unauthorized",
        description: "You do not have access to this page.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  }, [authLoading, isAuthenticated, user, toast]);

  if (authLoading || !isAuthenticated || user?.role !== "agent") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-[600px]" />
      </div>
    );
  }

  const pendingWorkers = myWorkers?.filter((w) => w.status === "pending") || [];
  const approvedWorkers = myWorkers?.filter((w) => w.status === "approved") || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-agent-dashboard-title">
            {t("agent.title")}
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.firstName || "Agent"}
          </p>
        </div>
        <Dialog open={showAddWorker} onOpenChange={setShowAddWorker}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="button-add-worker">
              <Plus className="h-4 w-4" />
              {t("agent.addWorker")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Add New Worker
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Worker's full name" {...field} data-testid="input-worker-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone *</FormLabel>
                        <FormControl>
                          <Input placeholder="+91 98765 43210" {...field} data-testid="input-worker-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-worker-category">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories?.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {language === "en" ? cat.name : cat.nameHi || cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="areaId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Area *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-worker-area">
                              <SelectValue placeholder="Select area" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {areas?.map((area) => (
                              <SelectItem key={area.id} value={area.id}>
                                {language === "en" ? area.name : area.nameHi || area.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={18}
                            max={70}
                            placeholder="25"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Experience (years)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={50}
                            placeholder="2"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="skills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skills (comma separated)</FormLabel>
                      <FormControl>
                        <Input placeholder="Cooking, Cleaning, Laundry" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="salaryExpectation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Salary Expectation (₹)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            placeholder="15000"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="salaryType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Salary Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="workType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Work Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="full_time">Full Time</SelectItem>
                            <SelectItem value="part_time">Part Time</SelectItem>
                            <SelectItem value="contract">Contract</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio / Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief description about the worker..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={addWorkerMutation.isPending}
                  data-testid="button-submit-worker"
                >
                  {addWorkerMutation.isPending ? "Adding..." : "Add Worker"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalWorkers || myWorkers?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Total Workers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.pendingApproval || pendingWorkers.length}</p>
                <p className="text-sm text-muted-foreground">Pending Approval</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.approved || approvedWorkers.length}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.thisMonth || 0}</p>
                <p className="text-sm text-muted-foreground">Added This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all-workers">
            All Workers ({myWorkers?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="pending" data-testid="tab-pending-workers">
            Pending ({pendingWorkers.length})
          </TabsTrigger>
          <TabsTrigger value="approved" data-testid="tab-approved-workers">
            Approved ({approvedWorkers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>{t("agent.myWorkers")}</CardTitle>
            </CardHeader>
            <CardContent>
              {workersLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-20" />
                  ))}
                </div>
              ) : myWorkers && myWorkers.length > 0 ? (
                <div className="space-y-4">
                  {myWorkers.map((worker) => (
                    <div
                      key={worker.id}
                      className="flex items-center gap-4 p-4 rounded-lg border"
                      data-testid={`worker-row-${worker.id}`}
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={worker.photo || undefined} />
                        <AvatarFallback>
                          {worker.name?.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{worker.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {language === "en"
                            ? worker.category?.name
                            : worker.category?.nameHi || worker.category?.name}{" "}
                          • {worker.phone}
                        </p>
                      </div>
                      <Badge
                        variant={
                          worker.status === "approved"
                            ? "default"
                            : worker.status === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {worker.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No workers added yet</p>
                  <Button variant="link" onClick={() => setShowAddWorker(true)}>
                    Add Your First Worker
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>{t("agent.pendingApproval")}</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingWorkers.length > 0 ? (
                <div className="space-y-4">
                  {pendingWorkers.map((worker) => (
                    <div
                      key={worker.id}
                      className="flex items-center gap-4 p-4 rounded-lg border"
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={worker.photo || undefined} />
                        <AvatarFallback>
                          {worker.name?.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{worker.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {language === "en"
                            ? worker.category?.name
                            : worker.category?.nameHi || worker.category?.name}
                        </p>
                      </div>
                      <Badge variant="secondary">Pending</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No pending workers</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved">
          <Card>
            <CardHeader>
              <CardTitle>Approved Workers</CardTitle>
            </CardHeader>
            <CardContent>
              {approvedWorkers.length > 0 ? (
                <div className="space-y-4">
                  {approvedWorkers.map((worker) => (
                    <div
                      key={worker.id}
                      className="flex items-center gap-4 p-4 rounded-lg border"
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={worker.photo || undefined} />
                        <AvatarFallback>
                          {worker.name?.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{worker.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {language === "en"
                            ? worker.category?.name
                            : worker.category?.nameHi || worker.category?.name}
                        </p>
                      </div>
                      <Badge>Approved</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No approved workers yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
