import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Preloader } from "@/components/Preloader";

// Pages
import Home from "@/pages/home";
import Store from "@/pages/store";
import ProductDetail from "@/pages/product-detail";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Profile from "@/pages/profile";
import Orders from "@/pages/orders";
import OrderDetail from "@/pages/order-detail";
import Partner from "@/pages/partner";
import Admin from "@/pages/admin";
import Contact from "@/pages/contact";
import About from "@/pages/about";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component, adminOnly = false, partnerOnly = false }: { component: any, adminOnly?: boolean, partnerOnly?: boolean }) {
  const { isAuthenticated, isAuthResolved, isAdmin, isPartner } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthResolved) return; // Wait for /me to settle before redirecting
    if (!isAuthenticated) {
      setLocation("/login");
    } else if (adminOnly && !isAdmin) {
      setLocation("/");
    } else if (partnerOnly && !isPartner) {
      setLocation("/");
    }
  }, [isAuthResolved, isAuthenticated, isAdmin, isPartner, setLocation, adminOnly, partnerOnly]);

  if (!isAuthResolved) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 rounded-full border-2 border-muted border-t-primary animate-spin" />
      </div>
    );
  }
  if (!isAuthenticated || (adminOnly && !isAdmin) || (partnerOnly && !isPartner)) {
    return null;
  }
  return <Component />;
}

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    // Prefer Lenis if it's mounted so its internal scroll state stays in sync.
    // `immediate: true` means snap to the top with no animation on route change.
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { immediate: true, force: true });
    } else {
      window.scrollTo(0, 0);
    }
    document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }, [location]);
  return null;
}

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <Navbar />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/store" component={Store} />
          <Route path="/products/:id" component={ProductDetail} />
          <Route path="/cart" component={Cart} />
          
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/contact" component={Contact} />
          <Route path="/about" component={About} />

          <Route path="/checkout">
            {() => <ProtectedRoute component={Checkout} />}
          </Route>
          <Route path="/profile">
            {() => <ProtectedRoute component={Profile} />}
          </Route>
          <Route path="/orders">
            {() => <ProtectedRoute component={Orders} />}
          </Route>
          <Route path="/orders/:id">
            {() => <ProtectedRoute component={OrderDetail} />}
          </Route>
          <Route path="/partner">
            {() => <ProtectedRoute component={Partner} />}
          </Route>
          <Route path="/admin">
            {() => <ProtectedRoute component={Admin} adminOnly={true} />}
          </Route>
          
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <AuthProvider>
          <TooltipProvider>
            <Preloader />
            <SmoothScroll />
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;