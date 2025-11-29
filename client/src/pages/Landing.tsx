import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Briefcase,
  Users,
  Shield,
  CheckCircle,
  ArrowRight,
  MapPin,
  Home,
  Car,
  Hammer,
  HardHat,
  UtensilsCrossed,
  ShieldCheck,
  Factory,
  Building2,
} from "lucide-react";
import { useState } from "react";
import type { Category, Area } from "@shared/schema";

const categoryIcons: Record<string, React.ElementType> = {
  maid: Home,
  driver: Car,
  carpenter: Hammer,
  construction: HardHat,
  cook: UtensilsCrossed,
  security: ShieldCheck,
  factory: Factory,
  office: Building2,
};

export default function Landing() {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: areas, isLoading: areasLoading } = useQuery<Area[]>({
    queryKey: ["/api/areas"],
  });

  const { data: stats } = useQuery<{ workers: number; employers: number; verified: number }>({
    queryKey: ["/api/stats"],
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="flex flex-col">
      <section className="relative min-h-[600px] flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.08),transparent_50%)]" />
        
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge variant="secondary" className="px-4 py-1.5 text-sm">
              Trusted by 10,000+ employers in Jaipur
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight" data-testid="text-hero-title">
              {t("hero.title")}
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto" data-testid="text-hero-subtitle">
              {t("hero.subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={t("hero.searchPlaceholder")}
                  className="pl-10 h-12 text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  data-testid="input-search"
                />
              </div>
              <Button size="lg" className="h-12 px-8" onClick={handleSearch} data-testid="button-search">
                <Search className="h-4 w-4 mr-2" />
                {t("hero.findHelpers")}
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/search">
                <Button size="lg" className="gap-2 px-8" data-testid="button-find-helpers">
                  <Users className="h-5 w-5" />
                  {t("hero.findHelpers")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/post-job">
                <Button size="lg" variant="outline" className="gap-2 px-8" data-testid="button-post-job">
                  <Briefcase className="h-5 w-5" />
                  {t("hero.postJob")}
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-6 md:gap-12 pt-8">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold">{stats?.workers?.toLocaleString() || "10,000"}+</p>
                  <p className="text-sm text-muted-foreground">{t("hero.verifiedWorkers")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold">{stats?.employers?.toLocaleString() || "500"}+</p>
                  <p className="text-sm text-muted-foreground">{t("hero.happyEmployers")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold">{stats?.verified?.toLocaleString() || "1,000"}+</p>
                  <p className="text-sm text-muted-foreground">{t("hero.policeVerified")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">{t("categories.title")}</h2>
            <Link href="/search">
              <Button variant="ghost" className="gap-2" data-testid="button-view-all-categories">
                {t("categories.viewAll")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {categoriesLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories?.slice(0, 12).map((category) => {
                const Icon = categoryIcons[category.slug] || Users;
                return (
                  <Link key={category.id} href={`/search?category=${category.slug}`}>
                    <Card className="hover-elevate cursor-pointer transition-all group h-full" data-testid={`card-category-${category.slug}`}>
                      <CardContent className="p-4 flex flex-col items-center justify-center text-center h-32">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-medium text-sm">
                          {language === "en" ? category.name : category.nameHi || category.name}
                        </h3>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">{t("areas.title")}</h2>
            <Link href="/search">
              <Button variant="ghost" className="gap-2" data-testid="button-view-all-areas">
                {t("areas.viewAll")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {areasLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {areas?.slice(0, 10).map((area) => (
                <Link key={area.id} href={`/search?area=${area.slug}`}>
                  <Card className="hover-elevate cursor-pointer transition-all group" data-testid={`card-area-${area.slug}`}>
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">
                          {language === "en" ? area.name : area.nameHi || area.name}
                        </h3>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 md:py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to find your perfect helper?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of employers who trust JaipurHelp to find reliable, verified workers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/api/login">
              <Button size="lg" variant="secondary" className="gap-2 px-8" data-testid="button-get-started">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="gap-2 px-8 bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
