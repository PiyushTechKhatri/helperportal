import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Search from "@/pages/Search";
import Pricing from "@/pages/Pricing";
import PostJob from "@/pages/PostJob";
import Dashboard from "@/pages/Dashboard";
import AgentDashboard from "@/pages/AgentDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import { Auth } from "@/pages/Auth";

function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();

  const getDefaultRoute = () => {
    if (!isAuthenticated || !user) return Landing;
    
    switch (user.role) {
      case "admin":
        return AdminDashboard;
      case "agent":
        return AgentDashboard;
      default:
        return Home;
    }
  };

  return (
    <Switch>
      <Route path="/" component={getDefaultRoute()} />
      <Route path="/auth" component={Auth} />
      <Route path="/search" component={Search} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/post-job" component={PostJob} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/agent" component={AgentDashboard} />
      <Route path="/admin" component={AdminDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Router />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <TooltipProvider>
            <AppLayout />
            <Toaster />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
