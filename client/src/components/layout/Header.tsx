import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Menu,
  Sun,
  Moon,
  Globe,
  User,
  LogOut,
  LayoutDashboard,
  Briefcase,
  Search,
  CreditCard,
  Users,
} from "lucide-react";
import { useState } from "react";

export function Header() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/search", label: t("nav.findHelpers"), icon: Search },
    { href: "/post-job", label: t("nav.postJob"), icon: Briefcase },
    { href: "/pricing", label: t("nav.pricing"), icon: CreditCard },
  ];

  const getDashboardLink = () => {
    if (!user) return "/dashboard";
    switch (user.role) {
      case "admin":
        return "/admin";
      case "agent":
        return "/agent";
      default:
        return "/dashboard";
    }
  };

  const getRoleBadge = () => {
    if (!user) return null;
    switch (user.role) {
      case "admin":
        return <Badge variant="destructive" className="text-xs">Admin</Badge>;
      case "agent":
        return <Badge variant="secondary" className="text-xs">Agent</Badge>;
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-lg">
            JH
          </div>
          <span className="hidden font-semibold text-xl sm:inline-block" data-testid="text-logo">
            JaipurHelp
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button
                variant={location === link.href ? "secondary" : "ghost"}
                className="gap-2"
                data-testid={`link-nav-${link.href.slice(1)}`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLanguage(language === "en" ? "hi" : "en")}
            data-testid="button-language-toggle"
          >
            <Globe className="h-4 w-4" />
          </Button>
          <span className="text-xs font-medium hidden sm:inline">
            {language === "en" ? "EN" : "हि"}
          </span>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            data-testid="button-theme-toggle"
          >
            {theme === "light" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>

          {isLoading ? (
            <div className="h-9 w-24 animate-pulse bg-muted rounded-md" />
          ) : isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="gap-2 pl-2"
                  data-testid="button-user-menu"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={user.profileImageUrl || undefined} />
                    <AvatarFallback className="text-xs">
                      {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline max-w-24 truncate text-sm">
                    {user.firstName || user.email?.split("@")[0]}
                  </span>
                  {getRoleBadge()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-2 p-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.profileImageUrl || undefined} />
                    <AvatarFallback>
                      {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {user.firstName} {user.lastName}
                    </span>
                    <span className="text-xs text-muted-foreground truncate max-w-32">
                      {user.email}
                    </span>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={getDashboardLink()} className="cursor-pointer gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    {t("nav.dashboard")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer gap-2 text-destructive"
                  onClick={async () => {
                    await fetch('/api/auth/logout', { method: 'POST' });
                    window.location.href = '/';
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  {t("nav.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth">
                <Button variant="ghost" data-testid="button-login">
                  {t("nav.login")}
                </Button>
              </Link>
              <Link href="/auth" className="hidden sm:inline">
                <Button data-testid="button-signup">
                  {t("nav.signup")}
                </Button>
              </Link>
            </div>
          )}

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <nav className="flex flex-col gap-2 mt-8">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <Button
                      variant={location === link.href ? "secondary" : "ghost"}
                      className="w-full justify-start gap-3"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </Button>
                  </Link>
                ))}
                {isAuthenticated && (
                  <Link href={getDashboardLink()}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      {t("nav.dashboard")}
                    </Button>
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
