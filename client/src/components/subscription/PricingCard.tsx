import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star } from "lucide-react";
import type { SubscriptionPlan } from "@shared/schema";

interface PricingCardProps {
  plan: SubscriptionPlan;
  isPopular?: boolean;
  isCurrentPlan?: boolean;
  onSubscribe?: (planId: string) => void;
}

export function PricingCard({
  plan,
  isPopular = false,
  isCurrentPlan = false,
  onSubscribe,
}: PricingCardProps) {
  const { t, language } = useLanguage();

  const features = plan.features || [];

  const getTierName = () => {
    switch (plan.tier) {
      case "free":
        return t("subscription.free");
      case "basic":
        return t("subscription.basic");
      case "premium":
        return t("subscription.premium");
      case "business":
        return t("subscription.business");
      default:
        return plan.name;
    }
  };

  return (
    <Card
      className={`relative flex flex-col ${
        isPopular ? "border-primary border-2 shadow-lg" : ""
      }`}
      data-testid={`card-pricing-${plan.tier}`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="gap-1 px-3 py-1 bg-primary text-primary-foreground">
            <Star className="h-3 w-3 fill-current" />
            {t("subscription.mostPopular")}
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-2 pt-6">
        <h3 className="text-xl font-semibold">{getTierName()}</h3>
        <div className="mt-4">
          <span className="text-4xl font-bold">
            {plan.price === 0 ? (
              t("subscription.free")
            ) : (
              <>
                <span className="text-2xl">₹</span>
                {plan.price}
              </>
            )}
          </span>
          {plan.price > 0 && (
            <span className="text-muted-foreground">{t("subscription.perMonth")}</span>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <ul className="space-y-3">
          <li className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-primary shrink-0" />
            <span>
              {plan.contactLimit === null || plan.contactLimit === -1
                ? t("subscription.unlimited")
                : plan.contactLimit}{" "}
              {t("subscription.contacts")}
            </span>
          </li>
          <li className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-primary shrink-0" />
            <span>
              {plan.jobPostLimit === null || plan.jobPostLimit === -1
                ? t("subscription.unlimited")
                : plan.jobPostLimit}{" "}
              {t("subscription.jobPosts")}
            </span>
          </li>
          {plan.hasWhatsappAccess && (
            <li className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary shrink-0" />
              <span>{t("subscription.whatsapp")}</span>
            </li>
          )}
          {plan.userLimit && plan.userLimit > 1 && (
            <li className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary shrink-0" />
              <span>
                {plan.userLimit} {t("subscription.multiUser")}
              </span>
            </li>
          )}
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        {isCurrentPlan ? (
          <Button variant="outline" className="w-full" disabled data-testid={`button-current-plan-${plan.tier}`}>
            {t("subscription.currentPlan")}
          </Button>
        ) : (
          <Button
            className={`w-full ${isPopular ? "" : "variant-outline"}`}
            variant={isPopular ? "default" : "outline"}
            onClick={() => onSubscribe?.(plan.id)}
            data-testid={`button-subscribe-${plan.tier}`}
          >
            {plan.price === 0 ? "Get Started" : t("subscription.subscribe")}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
