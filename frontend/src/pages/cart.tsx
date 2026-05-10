import { Link, useLocation } from "wouter";
import {
  useGetCart, getGetCartQueryKey,
  useUpdateCartItem, useRemoveFromCart, useClearCart,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CurrencyAmount } from "@/components/ui/CurrencyAmount";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Cart() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cart, isLoading } = useGetCart({
    query: { enabled: isAuthenticated, queryKey: getGetCartQueryKey() }
  });

  const updateItem = useUpdateCartItem({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() }),
      onError: () => toast({ title: "Error", description: "Failed to update cart", variant: "destructive" })
    }
  });

  const removeItem = useRemoveFromCart({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() }),
      onError: () => toast({ title: "Error", description: "Failed to remove item", variant: "destructive" })
    }
  });

  const clearCart = useClearCart({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        toast({ title: "Cart cleared" });
      }
    }
  });

  if (!isAuthenticated) {
    return <EmptyCart title="Your cart is empty" subtitle="Log in to see your saved items or continue shopping." showLogin />;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-14">
        <Skeleton className="h-12 w-48 mb-10" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex gap-4 p-5 border rounded-2xl">
                <Skeleton className="w-28 h-28 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-9 w-32" />
                </div>
              </div>
            ))}
          </div>
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </div>
    );
  }

  const items = cart?.items || [];

  if (items.length === 0) {
    return <EmptyCart title="Your cart is empty" subtitle="Add some products to get started." />;
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-14">
      <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2">— Bag</p>
          <h1 className="font-serif text-4xl lg:text-5xl font-light tracking-tight">
            Your <span className="italic">cart.</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-2">{items.length} {items.length === 1 ? "item" : "items"} ready for checkout.</p>
        </div>
        <Button variant="ghost" size="sm" className="rounded-full text-destructive hover:text-destructive gap-2" onClick={() => clearCart.mutate()}>
          <Trash2 className="h-4 w-4" /> Clear all
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-5 p-5 border border-border/60 rounded-2xl bg-card">
              <Link href={`/products/${item.productId}`} className="shrink-0">
                <img src={item.product.images[0] || "https://placehold.co/96x96/png"}
                  alt={item.product.name}
                  className="w-28 h-28 object-cover rounded-xl border border-border/40 bg-muted" />
              </Link>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{item.product.categoryName}</p>
                <Link href={`/products/${item.productId}`}>
                  <h3 className="font-serif text-lg font-medium leading-snug hover:text-primary transition-colors line-clamp-2 mt-0.5">
                    {item.product.name}
                  </h3>
                </Link>
                <p className="font-semibold mt-1.5"><CurrencyAmount amount={item.product.price} /></p>
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  <div className="flex items-center border border-border rounded-full overflow-hidden h-8">
                    <button className="px-3 hover:bg-muted h-full disabled:opacity-50"
                      disabled={updateItem.isPending || item.quantity <= 1}
                      onClick={() => updateItem.mutate({ productId: item.productId, data: { quantity: item.quantity - 1 } })}>
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="px-3 text-xs font-medium border-x min-w-[2rem] text-center">{item.quantity}</span>
                    <button className="px-3 hover:bg-muted h-full disabled:opacity-50"
                      disabled={updateItem.isPending}
                      onClick={() => updateItem.mutate({ productId: item.productId, data: { quantity: item.quantity + 1 } })}>
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <button className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
                    onClick={() => removeItem.mutate({ productId: item.productId })}>
                    <Trash2 className="h-3 w-3" /> Remove
                  </button>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-serif text-lg font-medium"><CurrencyAmount amount={item.product.price * item.quantity} /></p>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:sticky lg:top-24 h-fit">
          <div className="rounded-2xl bg-card border border-border/60 p-6 space-y-5">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">— Order summary</p>
              <h2 className="font-serif text-2xl font-light">Total review</h2>
            </div>
            <div className="space-y-2 text-sm border-t border-border/60 pt-4">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span><CurrencyAmount amount={cart?.total || 0} /></span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span className="text-emerald-600">Free</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tax</span>
                <span>Calculated at checkout</span>
              </div>
            </div>
            <div className="border-t border-border/60 pt-4 flex items-baseline justify-between">
              <span className="text-sm font-medium">Total</span>
              <span className="font-serif text-2xl font-medium"><CurrencyAmount amount={cart?.total || 0} /></span>
            </div>
            <Button className="w-full rounded-full h-12 gap-2" size="lg" onClick={() => setLocation("/checkout")}>
              Proceed to checkout <ArrowRight className="h-4 w-4" />
            </Button>
            <Link href="/store">
              <Button variant="ghost" className="w-full rounded-full">Continue shopping</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyCart({ title, subtitle, showLogin }: { title: string; subtitle: string; showLogin?: boolean }) {
  return (
    <div className="container mx-auto px-4 py-32 text-center">
      <div className="inline-flex h-16 w-16 rounded-full bg-muted items-center justify-center mb-6">
        <ShoppingBag className="h-7 w-7 text-muted-foreground" />
      </div>
      <h2 className="font-serif text-3xl lg:text-4xl font-light mb-2">{title}</h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">{subtitle}</p>
      <div className="flex gap-3 justify-center">
        {showLogin && <Link href="/login"><Button className="rounded-full px-6">Log in</Button></Link>}
        <Link href="/store"><Button variant={showLogin ? "outline" : "default"} className="rounded-full px-6 gap-2">Browse store <ArrowRight className="h-4 w-4" /></Button></Link>
      </div>
    </div>
  );
}
