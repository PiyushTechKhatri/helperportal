import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MapPin,
  Star,
  Briefcase,
  Phone,
  MessageCircle,
  Heart,
  Lock,
  Shield,
  CheckCircle,
  Award,
} from "lucide-react";
import type { WorkerWithDetails } from "@shared/schema";

interface WorkerCardProps {
  worker: WorkerWithDetails;
  hasAccess?: boolean;
  isSaved?: boolean;
  onSave?: (workerId: string) => void;
  onViewContact?: (workerId: string) => void;
}

export function WorkerCard({
  worker,
  hasAccess = false,
  isSaved = false,
  onSave,
  onViewContact,
}: WorkerCardProps) {
  const { isAuthenticated } = useAuth();
  const { t, language } = useLanguage();
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [savedState, setSavedState] = useState(isSaved);

  const handleSave = () => {
    setSavedState(!savedState);
    onSave?.(worker.id);
  };

  const handleViewContact = () => {
    if (hasAccess) {
      setShowContactDialog(true);
    } else {
      onViewContact?.(worker.id);
    }
  };

  const getVerificationBadge = () => {
    switch (worker.verificationLevel) {
      case "premium":
        return (
          <Badge className="bg-amber-500 text-white gap-1">
            <Award className="h-3 w-3" />
            {t("worker.premium")}
          </Badge>
        );
      case "police":
        return (
          <Badge className="bg-blue-600 text-white gap-1">
            <Shield className="h-3 w-3" />
            {t("worker.policeVerified")}
          </Badge>
        );
      case "basic":
        return (
          <Badge variant="secondary" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            {t("worker.verified")}
          </Badge>
        );
      default:
        return null;
    }
  };

  const getSalaryDisplay = () => {
    if (!worker.salaryExpectation) return null;
    const formatted = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(worker.salaryExpectation);
    const suffix = worker.salaryType === "daily" ? t("worker.perDay") : t("worker.perMonth");
    return `${formatted}${suffix}`;
  };

  return (
    <>
      <Card className="group hover-elevate overflow-visible transition-all duration-200" data-testid={`card-worker-${worker.id}`}>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative shrink-0">
              <Avatar className="h-20 w-20 rounded-lg">
                <AvatarImage
                  src={worker.photo || undefined}
                  alt={worker.name}
                  className="object-cover"
                />
                <AvatarFallback className="rounded-lg text-lg bg-primary/10">
                  {worker.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {getVerificationBadge() && (
                <div className="absolute -top-2 -right-2">
                  {getVerificationBadge()}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Link href={`/worker/${worker.id}`}>
                    <h3 className="font-semibold text-lg hover:text-primary transition-colors truncate" data-testid={`text-worker-name-${worker.id}`}>
                      {worker.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {language === "en"
                      ? worker.category?.name
                      : worker.category?.nameHi || worker.category?.name}
                  </p>
                </div>
                {worker.rating && parseFloat(String(worker.rating)) > 0 && (
                  <div className="flex items-center gap-1 text-amber-500 shrink-0">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-sm font-medium">{parseFloat(String(worker.rating)).toFixed(1)}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {worker.experience && worker.experience > 0 && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Briefcase className="h-3.5 w-3.5" />
                    <span>
                      {worker.experience} {t("worker.experience")}
                    </span>
                  </div>
                )}
                {worker.area && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>
                      {language === "en"
                        ? worker.area.name
                        : worker.area.nameHi || worker.area.name}
                    </span>
                  </div>
                )}
              </div>

              {worker.skills && worker.skills.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {worker.skills.slice(0, 3).map((skill, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {worker.skills.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{worker.skills.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex items-center justify-between gap-2">
          {getSalaryDisplay() && (
            <span className="font-semibold text-primary text-lg" data-testid={`text-salary-${worker.id}`}>
              {getSalaryDisplay()}
            </span>
          )}

          <div className="flex items-center gap-2 ml-auto">
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSave}
                className={savedState ? "text-red-500" : ""}
                data-testid={`button-save-${worker.id}`}
              >
                <Heart className={`h-4 w-4 ${savedState ? "fill-current" : ""}`} />
              </Button>
            )}
            <Button
              onClick={handleViewContact}
              className="gap-2"
              data-testid={`button-contact-${worker.id}`}
            >
              {hasAccess ? (
                <>
                  <Phone className="h-4 w-4" />
                  {t("worker.viewContact")}
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  {t("worker.viewContact")}
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={worker.photo || undefined} />
                <AvatarFallback>
                  {worker.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <span>{worker.name}</span>
                <p className="text-sm font-normal text-muted-foreground">
                  {language === "en"
                    ? worker.category?.name
                    : worker.category?.nameHi || worker.category?.name}
                </p>
              </div>
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <a
                      href={`tel:${worker.phone}`}
                      className="font-medium text-foreground hover:text-primary"
                    >
                      {worker.phone}
                    </a>
                  </div>
                </div>
                {worker.whatsapp && (
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <MessageCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">WhatsApp</p>
                      <a
                        href={`https://wa.me/${worker.whatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-foreground hover:text-green-600"
                      >
                        {worker.whatsapp}
                      </a>
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button className="flex-1 gap-2" asChild>
                    <a href={`tel:${worker.phone}`}>
                      <Phone className="h-4 w-4" />
                      Call Now
                    </a>
                  </Button>
                  {worker.whatsapp && (
                    <Button variant="outline" className="flex-1 gap-2 text-green-600 border-green-600" asChild>
                      <a
                        href={`https://wa.me/${worker.whatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="h-4 w-4" />
                        WhatsApp
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
