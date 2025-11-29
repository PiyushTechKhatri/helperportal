import { useQuery, useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { PricingCard } from "@/components/subscription/PricingCard";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { SubscriptionPlan, SubscriptionWithPlan } from "@shared/schema";

export default function Pricing() {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: plans, isLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ["/api/subscription-plans"],
  });

  const { data: currentSubscription } = useQuery<SubscriptionWithPlan>({
    queryKey: ["/api/subscription"],
    enabled: isAuthenticated,
  });

  const subscribeMutation = useMutation({
    mutationFn: async (planId: string) => {
      return apiRequest("POST", "/api/subscriptions", { planId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscription"] });
      toast({
        title: "Success!",
        description: "Your subscription has been activated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubscribe = (planId: string) => {
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }
    subscribeMutation.mutate(planId);
  };

  const orderedPlans = plans?.sort((a, b) => a.price - b.price);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-pricing-title">
          {t("subscription.title")}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Choose the plan that best fits your hiring needs. All plans include access to our verified worker database.
        </p>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-96 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {orderedPlans?.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              isPopular={plan.tier === "premium"}
              isCurrentPlan={currentSubscription?.planId === plan.id}
              onSubscribe={handleSubscribe}
            />
          ))}
        </div>
      )}

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-8">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto space-y-6 text-left">
          <div className="space-y-2">
            <h3 className="font-semibold">Can I cancel my subscription anytime?</h3>
            <p className="text-muted-foreground">
              Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">What payment methods do you accept?</h3>
            <p className="text-muted-foreground">
              We accept all major credit cards, debit cards, and UPI payments through our secure payment gateway.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">Are the workers really verified?</h3>
            <p className="text-muted-foreground">
              Yes, all workers go through a KYC verification process. Some workers also have police verification for added trust.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">What if I need more contacts than my plan allows?</h3>
            <p className="text-muted-foreground">
              You can upgrade to a higher plan at any time to get more contact views and additional features.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
