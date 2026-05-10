import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useGetCart, getGetCartQueryKey } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User as UserIcon, Search } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Navbar() {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const isPartnerOnly = user?.role === "partner";
  const [location, setLocation] = useLocation();

  const { data: cart } = useGetCart({
    query: { enabled: isAuthenticated, queryKey: getGetCartQueryKey() },
  });
  const cartCount = cart?.itemCount || 0;

  const navItems = [
    { href: "/store", label: "Store" },
    { href: "/store?sort=newest", label: "New" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 lg:px-8 h-16 flex items-center justify-between gap-6">
        <div className="flex items-center gap-8 min-w-0">
          <Link href="/" className="font-serif text-2xl font-medium tracking-tight text-foreground shrink-0">
            TechPulse<span className="text-primary">.</span>
          </Link>
          <nav className="hidden md:flex gap-1 text-sm">
            {navItems.map((item) => {
              const active = location === item.href.split("?")[0];
              return (
                <Link key={item.href} href={item.href}
                  className={`px-3 py-1.5 rounded-full transition-colors ${
                    active
                      ? "text-foreground bg-muted"
                      : "text-muted-foreground hover:text-foreground"
                  }`}>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle />

          <Link href="/store">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Search className="h-4 w-4" />
            </Button>
          </Link>

          <Link href="/cart">
            <Button variant="ghost" size="icon" className="rounded-full relative">
              <ShoppingCart className="h-4 w-4" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 h-4 min-w-[16px] px-1 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full border border-border/60 overflow-hidden ml-1 h-9 w-9">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    <UserIcon className="h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLocation("/profile")}>Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation("/orders")}>My Orders</DropdownMenuItem>
                {isPartnerOnly && <DropdownMenuItem onClick={() => setLocation("/partner")}>Partner Dashboard</DropdownMenuItem>}
                {isAdmin && <DropdownMenuItem onClick={() => setLocation("/admin")}>Admin Dashboard</DropdownMenuItem>}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { logout(); setLocation("/"); }}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex gap-2 ml-2">
              <Link href="/login">
                <Button variant="ghost" className="rounded-full text-sm h-9 px-4">Log in</Button>
              </Link>
              <Link href="/register">
                <Button className="rounded-full text-sm h-9 px-5">Sign up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
