import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgentManagement } from "@/components/admin/AgentManagement";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  UserCheck,
  CreditCard,
  TrendingUp,
  Check,
  X,
  BarChart3,
  Building2,
  IndianRupee,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { WorkerWithDetails, User, SubscriptionWithPlan } from "@shared/schema";

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const { data: pendingWorkers, isLoading: workersLoading } = useQuery<WorkerWithDetails[]>({
    queryKey: ["/api/admin/workers/pending"],
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: allWorkers } = useQuery<WorkerWithDetails[]>({
    queryKey: ["/api/admin/workers"],
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: agents } = useQuery<User[]>({
    queryKey: ["/api/admin/agents"],
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: subscriptions } = useQuery<SubscriptionWithPlan[]>({
    queryKey: ["/api/admin/subscriptions"],
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: stats } = useQuery<{
    totalWorkers: number;
    totalClients: number;
    totalAgents: number;
    activeSubscriptions: number;
    monthlyRevenue: number;
    pendingApprovals: number;
  }>({
    queryKey: ["/api/admin/stats"],
    enabled: isAuthenticated && user?.role === "admin",
  });

  const approveWorkerMutation = useMutation({
    mutationFn: async (workerId: string) => {
      return apiRequest("PATCH", `/api/admin/workers/${workerId}/approve`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/workers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/workers/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Worker Approved",
        description: "The worker profile is now visible to clients.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve worker.",
        variant: "destructive",
      });
    },
  });

  const rejectWorkerMutation = useMutation({
    mutationFn: async (workerId: string) => {
      return apiRequest("PATCH", `/api/admin/workers/${workerId}/reject`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/workers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/workers/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Worker Rejected",
        description: "The worker profile has been rejected.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject worker.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "admin")) {
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

  if (authLoading || !isAuthenticated || user?.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-[600px]" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" data-testid="text-admin-dashboard-title">
          {t("admin.title")}
        </h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.firstName || "Admin"}
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalWorkers || allWorkers?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Total Workers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalClients || 0}</p>
                <p className="text-sm text-muted-foreground">Total Clients</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.activeSubscriptions || subscriptions?.filter(s => s.status === 'active').length || 0}</p>
                <p className="text-sm text-muted-foreground">Active Subscriptions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <IndianRupee className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  ₹{(stats?.monthlyRevenue || 0).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="approvals" className="space-y-6">
        <TabsList>
          <TabsTrigger value="approvals" data-testid="tab-approvals">
            <UserCheck className="h-4 w-4 mr-2" />
            Approvals ({pendingWorkers?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="workers" data-testid="tab-workers">
            <Users className="h-4 w-4 mr-2" />
            Workers
          </TabsTrigger>
          <TabsTrigger value="agents" data-testid="tab-agents">
            <Building2 className="h-4 w-4 mr-2" />
            Agents
          </TabsTrigger>
          <TabsTrigger value="subscriptions" data-testid="tab-subscriptions">
            <CreditCard className="h-4 w-4 mr-2" />
            Subscriptions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="approvals">
          <Card>
            <CardHeader>
              <CardTitle>Pending Worker Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              {workersLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-20" />
                  ))}
                </div>
              ) : pendingWorkers && pendingWorkers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Worker</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Area</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Agent</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingWorkers.map((worker) => (
                      <TableRow key={worker.id} data-testid={`pending-worker-${worker.id}`}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={worker.photo || undefined} />
                              <AvatarFallback>
                                {worker.name?.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{worker.name}</p>
                              <p className="text-sm text-muted-foreground">{worker.phone}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {language === "en"
                            ? worker.category?.name
                            : worker.category?.nameHi || worker.category?.name}
                        </TableCell>
                        <TableCell>
                          {language === "en"
                            ? worker.area?.name
                            : worker.area?.nameHi || worker.area?.name}
                        </TableCell>
                        <TableCell>{worker.experience || 0} years</TableCell>
                        <TableCell>
                          {worker.agent?.firstName || worker.agent?.email?.split("@")[0] || "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() => approveWorkerMutation.mutate(worker.id)}
                              disabled={approveWorkerMutation.isPending}
                              data-testid={`button-approve-${worker.id}`}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => rejectWorkerMutation.mutate(worker.id)}
                              disabled={rejectWorkerMutation.isPending}
                              data-testid={`button-reject-${worker.id}`}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No pending approvals</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workers">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>All Workers</CardTitle>
              <Badge variant="secondary">{allWorkers?.length || 0} total</Badge>
            </CardHeader>
            <CardContent>
              {allWorkers && allWorkers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Worker</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Area</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Views</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allWorkers.slice(0, 20).map((worker) => (
                      <TableRow key={worker.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={worker.photo || undefined} />
                              <AvatarFallback>
                                {worker.name?.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{worker.name}</p>
                              <p className="text-sm text-muted-foreground">{worker.phone}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {language === "en"
                            ? worker.category?.name
                            : worker.category?.nameHi || worker.category?.name}
                        </TableCell>
                        <TableCell>
                          {language === "en"
                            ? worker.area?.name
                            : worker.area?.nameHi || worker.area?.name}
                        </TableCell>
                        <TableCell>
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
                        </TableCell>
                        <TableCell>{worker.viewCount || 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No workers found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents">
          <AgentManagement />
        </TabsContent>

        <TabsContent value="subscriptions">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Active Subscriptions</CardTitle>
              <Badge variant="secondary">{subscriptions?.filter(s => s.status === 'active').length || 0} active</Badge>
            </CardHeader>
            <CardContent>
              {subscriptions && subscriptions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Contacts Used</TableHead>
                      <TableHead>Started</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.slice(0, 20).map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell>{sub.userId}</TableCell>
                        <TableCell>
                          <Badge>{sub.plan?.name || sub.planId}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={sub.status === "active" ? "default" : "secondary"}>
                            {sub.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{sub.contactsUsed || 0}</TableCell>
                        <TableCell>
                          {sub.startDate
                            ? new Date(sub.startDate).toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No subscriptions found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
