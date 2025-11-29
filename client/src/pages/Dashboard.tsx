import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart,
  Briefcase,
  CreditCard,
  Clock,
  ArrowRight,
  Users,
  Eye,
  Star,
} from "lucide-react";
import type { WorkerWithDetails, JobWithDetails, SubscriptionWithPlan, ContactView } from "@shared/schema";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const { data: subscription, isLoading: subLoading } = useQuery<SubscriptionWithPlan>({
    queryKey: ["/api/subscription"],
    enabled: isAuthenticated,
  });

  const { data: savedWorkers, isLoading: savedLoading } = useQuery<WorkerWithDetails[]>({
    queryKey: ["/api/saved-workers"],
    enabled: isAuthenticated,
  });

  const { data: myJobs, isLoading: jobsLoading } = useQuery<JobWithDetails[]>({
    queryKey: ["/api/my-jobs"],
    enabled: isAuthenticated,
  });

  const { data: contactHistory, isLoading: historyLoading } = useQuery<ContactView[]>({
    queryKey: ["/api/contact-views"],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [authLoading, isAuthenticated, toast]);

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          <Skeleton className="h-32" />
          <div className="grid md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const getPlanBadgeColor = () => {
    switch (subscription?.plan?.tier) {
      case "premium":
        return "bg-amber-500";
      case "business":
        return "bg-purple-500";
      case "basic":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.profileImageUrl || undefined} />
            <AvatarFallback className="text-xl">
              {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-dashboard-welcome">
              Welcome, {user.firstName || user.email?.split("@")[0]}!
            </h1>
            <div className="flex items-center gap-2 mt-1">
              {subscription?.plan && (
                <Badge className={getPlanBadgeColor()}>
                  {subscription.plan.name} Plan
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Heart className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{savedWorkers?.length || 0}</p>
                <p className="text-sm text-muted-foreground">{t("dashboard.savedWorkers")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{myJobs?.length || 0}</p>
                <p className="text-sm text-muted-foreground">{t("dashboard.myJobs")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Eye className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{subscription?.contactsUsed || 0}</p>
                <p className="text-sm text-muted-foreground">Contacts Viewed</p>
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
                <p className="text-2xl font-bold">
                  {subscription?.plan?.contactLimit === -1
                    ? "∞"
                    : (subscription?.plan?.contactLimit || 0) - (subscription?.contactsUsed || 0)}
                </p>
                <p className="text-sm text-muted-foreground">Contacts Left</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="saved" className="space-y-6">
        <TabsList>
          <TabsTrigger value="saved" data-testid="tab-saved-workers">
            <Heart className="h-4 w-4 mr-2" />
            {t("dashboard.savedWorkers")}
          </TabsTrigger>
          <TabsTrigger value="jobs" data-testid="tab-my-jobs">
            <Briefcase className="h-4 w-4 mr-2" />
            {t("dashboard.myJobs")}
          </TabsTrigger>
          <TabsTrigger value="subscription" data-testid="tab-subscription">
            <CreditCard className="h-4 w-4 mr-2" />
            {t("dashboard.subscription")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="saved">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t("dashboard.savedWorkers")}</CardTitle>
              <Link href="/search">
                <Button variant="ghost" size="sm" className="gap-2">
                  Find More <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {savedLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-20" />
                  ))}
                </div>
              ) : savedWorkers && savedWorkers.length > 0 ? (
                <div className="space-y-4">
                  {savedWorkers.map((worker) => (
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
                      <Link href={`/worker/${worker.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No saved workers yet</p>
                  <Link href="/search">
                    <Button variant="link">Browse Workers</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t("dashboard.myJobs")}</CardTitle>
              <Link href="/post-job">
                <Button size="sm" className="gap-2">
                  Post New Job
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {jobsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-20" />
                  ))}
                </div>
              ) : myJobs && myJobs.length > 0 ? (
                <div className="space-y-4">
                  {myJobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center gap-4 p-4 rounded-lg border"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{job.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {language === "en"
                            ? job.category?.name
                            : job.category?.nameHi || job.category?.name}{" "}
                          in{" "}
                          {language === "en"
                            ? job.area?.name
                            : job.area?.nameHi || job.area?.name}
                        </p>
                      </div>
                      <Badge
                        variant={job.status === "active" ? "default" : "secondary"}
                      >
                        {job.status}
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        {job.applicationCount} applications
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No jobs posted yet</p>
                  <Link href="/post-job">
                    <Button variant="link">Post Your First Job</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription">
          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.subscription")}</CardTitle>
            </CardHeader>
            <CardContent>
              {subLoading ? (
                <Skeleton className="h-40" />
              ) : subscription?.plan ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                    <div>
                      <h3 className="font-semibold text-lg">{subscription.plan.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {subscription.plan.price === 0
                          ? "Free"
                          : `₹${subscription.plan.price}/month`}
                      </p>
                    </div>
                    <Badge className={getPlanBadgeColor()}>
                      {subscription.status}
                    </Badge>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg border">
                      <p className="text-sm text-muted-foreground mb-1">Contacts</p>
                      <p className="text-xl font-bold">
                        {subscription.contactsUsed} /{" "}
                        {subscription.plan.contactLimit === -1
                          ? "∞"
                          : subscription.plan.contactLimit}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border">
                      <p className="text-sm text-muted-foreground mb-1">Job Posts</p>
                      <p className="text-xl font-bold">
                        {subscription.jobPostsUsed} /{" "}
                        {subscription.plan.jobPostLimit === -1
                          ? "∞"
                          : subscription.plan.jobPostLimit}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border">
                      <p className="text-sm text-muted-foreground mb-1">WhatsApp Access</p>
                      <p className="text-xl font-bold">
                        {subscription.plan.hasWhatsappAccess ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>

                  {subscription.plan.tier !== "business" && (
                    <Link href="/pricing">
                      <Button className="w-full">Upgrade Plan</Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground mb-4">No active subscription</p>
                  <Link href="/pricing">
                    <Button>View Plans</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
