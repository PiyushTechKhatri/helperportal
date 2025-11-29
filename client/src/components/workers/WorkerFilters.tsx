import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Filter, X } from "lucide-react";
import type { Category, Area } from "@shared/schema";

interface FilterState {
  categories: string[];
  areas: string[];
  experience: [number, number];
  salaryRange: [number, number];
  gender: string;
  workType: string;
  verificationLevel: string;
}

interface WorkerFiltersProps {
  filters: FilterState;
  categories: Category[];
  areas: Area[];
  onFilterChange: (filters: FilterState) => void;
  onApply: () => void;
  onClear: () => void;
}

export function WorkerFilters({
  filters,
  categories,
  areas,
  onFilterChange,
  onApply,
  onClear,
}: WorkerFiltersProps) {
  const { t, language } = useLanguage();

  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter((c) => c !== categoryId)
      : [...filters.categories, categoryId];
    onFilterChange({ ...filters, categories: newCategories });
  };

  const handleAreaToggle = (areaId: string) => {
    const newAreas = filters.areas.includes(areaId)
      ? filters.areas.filter((a) => a !== areaId)
      : [...filters.areas, areaId];
    onFilterChange({ ...filters, areas: newAreas });
  };

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.areas.length > 0 ||
    filters.gender !== "" ||
    filters.workType !== "" ||
    filters.verificationLevel !== "" ||
    filters.experience[0] > 0 ||
    filters.experience[1] < 20 ||
    filters.salaryRange[0] > 0 ||
    filters.salaryRange[1] < 100000;

  return (
    <Card className="sticky top-20" data-testid="card-filters">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-4 w-4" />
            {t("search.filters")}
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="text-muted-foreground"
              data-testid="button-clear-filters"
            >
              <X className="h-4 w-4 mr-1" />
              {t("search.clearFilters")}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label className="text-sm font-medium">{t("search.category")}</Label>
          <ScrollArea className="h-40">
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={filters.categories.includes(category.id)}
                    onCheckedChange={() => handleCategoryToggle(category.id)}
                    data-testid={`checkbox-category-${category.slug}`}
                  />
                  <label
                    htmlFor={`category-${category.id}`}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {language === "en" ? category.name : category.nameHi || category.name}
                  </label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <Separator />

        <div className="space-y-3">
          <Label className="text-sm font-medium">{t("search.area")}</Label>
          <ScrollArea className="h-40">
            <div className="space-y-2">
              {areas.map((area) => (
                <div key={area.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`area-${area.id}`}
                    checked={filters.areas.includes(area.id)}
                    onCheckedChange={() => handleAreaToggle(area.id)}
                    data-testid={`checkbox-area-${area.slug}`}
                  />
                  <label
                    htmlFor={`area-${area.id}`}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {language === "en" ? area.name : area.nameHi || area.name}
                  </label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <Separator />

        <div className="space-y-3">
          <Label className="text-sm font-medium">{t("search.experience")}</Label>
          <div className="px-2">
            <Slider
              value={filters.experience}
              onValueChange={(value) =>
                onFilterChange({ ...filters, experience: value as [number, number] })
              }
              min={0}
              max={20}
              step={1}
              className="mt-2"
              data-testid="slider-experience"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{filters.experience[0]} yrs</span>
              <span>{filters.experience[1]}+ yrs</span>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <Label className="text-sm font-medium">{t("search.salary")}</Label>
          <div className="px-2">
            <Slider
              value={filters.salaryRange}
              onValueChange={(value) =>
                onFilterChange({ ...filters, salaryRange: value as [number, number] })
              }
              min={0}
              max={100000}
              step={1000}
              className="mt-2"
              data-testid="slider-salary"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                }).format(filters.salaryRange[0])}
              </span>
              <span>
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                }).format(filters.salaryRange[1])}
              </span>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <Label className="text-sm font-medium">{t("search.gender")}</Label>
          <Select
            value={filters.gender}
            onValueChange={(value) => onFilterChange({ ...filters, gender: value })}
          >
            <SelectTrigger data-testid="select-gender">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">{t("search.workType")}</Label>
          <Select
            value={filters.workType}
            onValueChange={(value) => onFilterChange({ ...filters, workType: value })}
          >
            <SelectTrigger data-testid="select-work-type">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="full_time">Full Time</SelectItem>
              <SelectItem value="part_time">Part Time</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button className="w-full" onClick={onApply} data-testid="button-apply-filters">
          {t("search.applyFilters")}
        </Button>
      </CardContent>
    </Card>
  );
}
