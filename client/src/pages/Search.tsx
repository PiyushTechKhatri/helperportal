import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { WorkerCard } from "@/components/workers/WorkerCard";
import { WorkerFilters } from "@/components/workers/WorkerFilters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Filter, SlidersHorizontal, X } from "lucide-react";
import { Link } from "wouter";
import type { WorkerWithDetails, Category, Area, SubscriptionWithPlan } from "@shared/schema";

interface FilterState {
  categories: string[];
  areas: string[];
  experience: [number, number];
  salaryRange: [number, number];
  gender: string;
  workType: string;
  verificationLevel: string;
}

const defaultFilters: FilterState = {
  categories: [],
  areas: [],
  experience: [0, 20],
  salaryRange: [0, 100000],
  gender: "",
  workType: "",
  verificationLevel: "",
};

export default function SearchPage() {
  const { t, language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [sortBy, setSortBy] = useState("relevance");
  const [showFilters, setShowFilters] = useState(false);
  const [showSubscribeDialog, setShowSubscribeDialog] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category");
    const area = params.get("area");
    const q = params.get("q");

    if (category) {
      setFilters((prev) => ({ ...prev, categories: [category] }));
    }
    if (area) {
      setFilters((prev) => ({ ...prev, areas: [area] }));
    }
    if (q) {
      setSearchQuery(q);
    }
  }, [location]);

  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (filters.categories.length) params.set("categories", filters.categories.join(","));
    if (filters.areas.length) params.set("areas", filters.areas.join(","));
    if (filters.gender) params.set("gender", filters.gender);
    if (filters.workType) params.set("workType", filters.workType);
    if (filters.experience[0] > 0) params.set("minExp", String(filters.experience[0]));
    if (filters.experience[1] < 20) params.set("maxExp", String(filters.experience[1]));
    if (filters.salaryRange[0] > 0) params.set("minSalary", String(filters.salaryRange[0]));
    if (filters.salaryRange[1] < 100000) params.set("maxSalary", String(filters.salaryRange[1]));
    if (sortBy !== "relevance") params.set("sort", sortBy);
    return params.toString();
  };

  const { data: workers, isLoading: workersLoading } = useQuery<WorkerWithDetails[]>({
    queryKey: ["/api/workers", buildQueryString()],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: areas } = useQuery<Area[]>({
    queryKey: ["/api/areas"],
  });

  const { data: subscription } = useQuery<SubscriptionWithPlan>({
    queryKey: ["/api/subscription"],
    enabled: isAuthenticated,
  });

  const hasSubscription = subscription && subscription.status === "active" && subscription.plan?.tier !== "free";

  const handleApplyFilters = () => {
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setFilters(defaultFilters);
  };

  const handleViewContact = (workerId: string) => {
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }
    if (!hasSubscription) {
      setShowSubscribeDialog(true);
    }
  };

  const activeFilterCount =
    filters.categories.length +
    filters.areas.length +
    (filters.gender ? 1 : 0) +
    (filters.workType ? 1 : 0) +
    (filters.experience[0] > 0 || filters.experience[1] < 20 ? 1 : 0) +
    (filters.salaryRange[0] > 0 || filters.salaryRange[1] < 100000 ? 1 : 0);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("hero.searchPlaceholder")}
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-workers"
          />
        </div>

        <Sheet open={showFilters} onOpenChange={setShowFilters}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="outline" className="gap-2" data-testid="button-filters-mobile">
              <Filter className="h-4 w-4" />
              {t("search.filters")}
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <SheetHeader className="p-4 border-b">
              <SheetTitle>{t("search.filters")}</SheetTitle>
            </SheetHeader>
            <div className="p-4 overflow-y-auto h-[calc(100vh-60px)]">
              <WorkerFilters
                filters={filters}
                categories={categories || []}
                areas={areas || []}
                onFilterChange={setFilters}
                onApply={handleApplyFilters}
                onClear={handleClearFilters}
              />
            </div>
          </SheetContent>
        </Sheet>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40" data-testid="select-sort">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Relevance</SelectItem>
            <SelectItem value="experience">Experience</SelectItem>
            <SelectItem value="salary_low">Salary: Low to High</SelectItem>
            <SelectItem value="salary_high">Salary: High to Low</SelectItem>
            <SelectItem value="rating">Rating</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.categories.map((catId) => {
            const cat = categories?.find((c) => c.id === catId || c.slug === catId);
            return cat ? (
              <Badge key={catId} variant="secondary" className="gap-1">
                {language === "en" ? cat.name : cat.nameHi || cat.name}
                <button
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      categories: prev.categories.filter((c) => c !== catId),
                    }))
                  }
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ) : null;
          })}
          {filters.areas.map((areaId) => {
            const area = areas?.find((a) => a.id === areaId || a.slug === areaId);
            return area ? (
              <Badge key={areaId} variant="secondary" className="gap-1">
                {language === "en" ? area.name : area.nameHi || area.name}
                <button
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      areas: prev.areas.filter((a) => a !== areaId),
                    }))
                  }
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ) : null;
          })}
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters} data-testid="button-clear-all-filters">
              Clear all
            </Button>
          )}
        </div>
      )}

      <div className="flex gap-6">
        <aside className="hidden lg:block w-72 shrink-0">
          <WorkerFilters
            filters={filters}
            categories={categories || []}
            areas={areas || []}
            onFilterChange={setFilters}
            onApply={handleApplyFilters}
            onClear={handleClearFilters}
          />
        </aside>

        <main className="flex-1">
          <div className="mb-4 text-sm text-muted-foreground">
            {workersLoading ? (
              <Skeleton className="h-5 w-32" />
            ) : (
              <span data-testid="text-results-count">
                {workers?.length || 0} {t("search.results")}
              </span>
            )}
          </div>

          {workersLoading ? (
            <div className="grid gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-lg" />
              ))}
            </div>
          ) : workers && workers.length > 0 ? (
            <div className="grid gap-4">
              {workers.map((worker) => (
                <WorkerCard
                  key={worker.id}
                  worker={worker}
                  hasAccess={hasSubscription}
                  onViewContact={handleViewContact}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{t("search.noResults")}</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or search terms
              </p>
              <Button variant="outline" onClick={handleClearFilters}>
                {t("search.clearFilters")}
              </Button>
            </div>
          )}
        </main>
      </div>

      <Dialog open={showSubscribeDialog} onOpenChange={setShowSubscribeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade to View Contacts</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-4 pt-4">
                <p>
                  Subscribe to one of our plans to view worker contact details and connect with them directly.
                </p>
                <div className="flex gap-2">
                  <Link href="/pricing">
                    <Button className="w-full" data-testid="button-view-plans">View Plans</Button>
                  </Link>
                  <Button variant="outline" onClick={() => setShowSubscribeDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
