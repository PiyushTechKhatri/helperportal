import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { WorkerCard } from "@/components/workers/WorkerCard";
import {
  Search,
  Briefcase,
  Heart,
  ArrowRight,
  Users,
  TrendingUp,
  Star,
} from "lucide-react";
import type { WorkerWithDetails, JobWithDetails, SubscriptionWithPlan } from "@shared/schema";

export default function Home() {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const { data: featuredWorkers, isLoading: workersLoading } = useQuery<WorkerWithDetails[]>({
    queryKey: ["/api/workers/featured"],
  });

  const { data: recentJobs, isLoading: jobsLoading } = useQuery<JobWithDetails[]>({
    queryKey: ["/api/jobs/recent"],
  });

  const { data: subscription } = useQuery<SubscriptionWithPlan>({
    queryKey: ["/api/subscription"],
  });

  const hasSubscription = subscription && subscription.status === "active" && subscription.plan?.tier !== "free";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2" data-testid="text-home-welcome">
          Welcome back, {user?.firstName || user?.email?.split("@")[0]}!
        </h1>
        <p className="text-muted-foreground">
          Find the perfect helper for your needs or manage your account.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Link href="/search">
          <Card className="hover-elevate cursor-pointer h-full">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Search className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold">{t("hero.findHelpers")}</h3>
                <p className="text-sm text-muted-foreground">Browse verified workers</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/post-job">
          <Card className="hover-elevate cursor-pointer h-full">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold">{t("hero.postJob")}</h3>
                <p className="text-sm text-muted-foreground">Post your requirement</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard">
          <Card className="hover-elevate cursor-pointer h-full">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Heart className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold">{t("dashboard.savedWorkers")}</h3>
                <p className="text-sm text-muted-foreground">View your saved profiles</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {subscription && (
        <Card className="mb-8 bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Your Plan: {subscription.plan?.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {subscription.plan?.contactLimit === -1
                      ? "Unlimited"
                      : `${(subscription.plan?.contactLimit || 0) - (subscription.contactsUsed || 0)} contacts remaining`}
                  </p>
                </div>
              </div>
              {subscription.plan?.tier !== "business" && (
                <Link href="/pricing">
                  <Button variant="outline" className="gap-2">
                    Upgrade <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Featured Workers</h2>
          <Link href="/search">
            <Button variant="ghost" className="gap-2">
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {workersLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : featuredWorkers && featuredWorkers.length > 0 ? (
          <div className="grid gap-4">
            {featuredWorkers.slice(0, 6).map((worker) => (
              <WorkerCard
                key={worker.id}
                worker={worker}
                hasAccess={hasSubscription}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No featured workers available</p>
              <Link href="/search">
                <Button variant="link">Browse all workers</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Recent Job Postings</h2>
          <Link href="/post-job">
            <Button variant="ghost" className="gap-2">
              Post a Job <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {jobsLoading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : recentJobs && recentJobs.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {recentJobs.slice(0, 4).map((job) => (
              <Card key={job.id} className="hover-elevate">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{job.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {language === "en"
                          ? job.category?.name
                          : job.category?.nameHi || job.category?.name}{" "}
                        in{" "}
                        {language === "en"
                          ? job.area?.name
                          : job.area?.nameHi || job.area?.name}
                      </p>
                      {job.salaryMin && job.salaryMax && (
                        <p className="text-sm font-medium text-primary mt-2">
                          ₹{job.salaryMin.toLocaleString()} - ₹{job.salaryMax.toLocaleString()}
                          <span className="text-muted-foreground font-normal">
                            /{job.salaryType === "daily" ? "day" : "month"}
                          </span>
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {job.isUrgent && (
                        <Badge variant="destructive">Urgent</Badge>
                      )}
                      <Badge variant="secondary">
                        {job.workersNeeded} needed
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No recent job postings</p>
              <Link href="/post-job">
                <Button variant="link">Post the first job</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
