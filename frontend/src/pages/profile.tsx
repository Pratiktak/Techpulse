import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  useUpdateProfile, getGetMeQueryKey,
  useGetWishlist, getGetWishlistQueryKey,
  useRemoveFromWishlist,
} from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductCard } from "@/components/products/ProductCard";
import { CurrencyAmount } from "@/components/ui/CurrencyAmount";
import { Badge } from "@/components/ui/badge";
import { useListOrders, getListOrdersQueryKey } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Heart, X, Package, ChevronRight, User as UserIcon, Mail, Phone, MapPin, ImageIcon, Check } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || "");
      setAddress(user.address || "");
      setAvatar(user.avatar || "");
    }
  }, [user]);

  const updateProfile = useUpdateProfile({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        toast({ title: "Profile updated" });
      },
      onError: (e) => toast({ title: "Failed", description: e.message, variant: "destructive" })
    }
  });

  const { data: wishlist } = useGetWishlist({ query: { queryKey: getGetWishlistQueryKey() } });
  const { data: orders, isLoading: ordersLoading } = useListOrders(undefined, { query: { queryKey: getListOrdersQueryKey() } });
  const recentOrders = (Array.isArray(orders) ? orders : []).slice(0, 5);

  const removeWishlist = useRemoveFromWishlist({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetWishlistQueryKey() })
    }
  });

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({ data: { name, phone, address, avatar } });
  };

  const initials = (user?.name || user?.email || "U")
    .split(/[\s@]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  return (
    <div className="container mx-auto px-4 lg:px-8 py-10 lg:py-14">
      <div className="mb-10 lg:mb-12">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">— Account</p>
        <h1 className="font-serif text-4xl lg:text-5xl font-light tracking-tight">
          My <span className="italic">account.</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-3 max-w-md">
          Manage your personal details, track orders and curate your wishlist.
        </p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="mb-8">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <form
            onSubmit={handleUpdate}
            className="rounded-3xl border border-border/60 bg-card overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.08)]"
          >
            {/* ─── Identity strip ────────────────────────────────────────── */}
            <div className="relative px-6 sm:px-10 py-8 border-b border-border/60 bg-gradient-to-br from-muted/40 via-card to-card">
              <div className="flex items-center gap-5">
                <div className="relative h-20 w-20 rounded-full overflow-hidden bg-muted ring-4 ring-background flex items-center justify-center shrink-0">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt=""
                      className="h-full w-full object-cover"
                      onError={(e) => ((e.currentTarget.style.display = "none"))}
                    />
                  ) : (
                    <span className="font-serif text-2xl text-muted-foreground">
                      {initials}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-1">
                    Signed in as
                  </p>
                  <p className="font-serif text-2xl font-light tracking-tight truncate">
                    {user?.name || user?.email}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* ─── Personal information ──────────────────────────────────── */}
            <div className="px-6 sm:px-10 py-8 space-y-8">
              <section>
                <div className="flex items-baseline justify-between mb-5">
                  <h2 className="font-serif text-lg font-medium">Personal information</h2>
                  <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    Required
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <FieldShell icon={Mail} label="Email" hint="Cannot be changed">
                    <Input
                      value={user?.email || ""}
                      disabled
                      className="h-11 rounded-xl bg-muted/60 dark:bg-muted/30 px-4"
                    />
                  </FieldShell>

                  <FieldShell icon={UserIcon} label="Full name" htmlFor="name">
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="h-11 rounded-xl px-4 focus-visible:ring-1 focus-visible:ring-primary/40"
                    />
                  </FieldShell>

                  <FieldShell icon={Phone} label="Phone" htmlFor="phone">
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="h-11 rounded-xl px-4 focus-visible:ring-1 focus-visible:ring-primary/40"
                    />
                  </FieldShell>

                  <FieldShell icon={ImageIcon} label="Avatar URL" htmlFor="avatar" hint="Optional">
                    <Input
                      id="avatar"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      placeholder="https://..."
                      className="h-11 rounded-xl px-4 focus-visible:ring-1 focus-visible:ring-primary/40"
                    />
                  </FieldShell>
                </div>
              </section>

              <section>
                <div className="flex items-baseline justify-between mb-5">
                  <h2 className="font-serif text-lg font-medium">Shipping address</h2>
                  <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    Default
                  </span>
                </div>
                <FieldShell icon={MapPin} label="Address" htmlFor="address">
                  <Textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House / flat, street, city, state, PIN"
                    rows={4}
                    className="rounded-xl px-4 py-3 resize-none focus-visible:ring-1 focus-visible:ring-primary/40"
                  />
                </FieldShell>
              </section>
            </div>

            {/* ─── Footer actions ────────────────────────────────────────── */}
            <div className="px-6 sm:px-10 py-5 border-t border-border/60 bg-muted/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                Changes are saved to your account immediately.
              </p>
              <Button
                type="submit"
                disabled={updateProfile.isPending}
                className="rounded-full h-11 px-6 gap-2 sm:self-end"
              >
                {updateProfile.isPending ? (
                  "Saving..."
                ) : (
                  <>
                    <Check className="h-4 w-4" /> Save changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="orders">
          {ordersLoading ? (
            <div className="text-center py-16 text-sm text-muted-foreground">Loading orders...</div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-16">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-4">You haven't placed any orders yet.</p>
              <Link href="/store"><Button className="rounded-full px-6">Browse Store</Button></Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order: any) => (
                <Link key={order.id} href={`/orders/${order.id}`}>
                  <div className="border border-border/60 rounded-2xl bg-card p-5 hover:border-foreground/40 transition-colors cursor-pointer flex items-center gap-4">
                    <div className="flex -space-x-2 shrink-0">
                      {(order.items ?? []).slice(0, 3).map((item: any) => (
                        <img
                          key={item.id}
                          src={item.productImage || "https://placehold.co/64x64/png"}
                          alt={item.productName}
                          className="w-12 h-12 rounded-lg border-2 border-card object-cover bg-secondary/20"
                        />
                      ))}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">Order #{order.id}</span>
                        <Badge variant="secondary" className="capitalize text-[10px] px-2 py-0">{order.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()} • {order.items?.length ?? 0} item{(order.items?.length ?? 0) === 1 ? "" : "s"}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-medium text-sm"><CurrencyAmount amount={order.total} /></p>
                      <p className="text-[10px] text-muted-foreground capitalize">{order.paymentMethod}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </div>
                </Link>
              ))}
              {(orders?.length ?? 0) > 5 && (
                <div className="text-center pt-2">
                  <Link href="/orders"><Button variant="outline" className="rounded-full">View all {orders!.length} orders</Button></Link>
                </div>
              )}
              {(orders?.length ?? 0) > 0 && (orders?.length ?? 0) <= 5 && (
                <div className="text-center pt-2">
                  <Link href="/orders"><Button variant="ghost" size="sm" className="rounded-full text-muted-foreground">View full order history</Button></Link>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="wishlist">
          {!wishlist || wishlist.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-4">Your wishlist is empty.</p>
              <Link href="/store"><Button>Browse Store</Button></Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {wishlist.map((item: any) => (
                <div key={item.id} className="relative group">
                  <ProductCard product={item.product} />
                  <button
                    className="absolute top-3 right-3 bg-background/90 hover:bg-destructive hover:text-destructive-foreground rounded-full p-1.5 z-10 transition-colors border shadow-sm"
                    onClick={(e) => { e.preventDefault(); removeWishlist.mutate({ productId: item.productId }); }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

type FieldShellProps = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
};

function FieldShell({ icon: Icon, label, htmlFor, hint, children }: FieldShellProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label
          htmlFor={htmlFor}
          className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-medium"
        >
          <Icon className="h-3 w-3" />
          {label}
        </Label>
        {hint && (
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
