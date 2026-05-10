import { Link } from "wouter";
import { useListOrders, getListOrdersQueryKey } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CurrencyAmount } from "@/components/ui/CurrencyAmount";
import { Package } from "lucide-react";

const statusVariant = (status: string): any => {
  switch (status) {
    case "pending": return "secondary";
    case "processing": return "default";
    case "shipped": return "default";
    case "delivered": return "default";
    case "cancelled": return "destructive";
    default: return "secondary";
  }
};

export default function Orders() {
  const { data, isLoading } = useListOrders(undefined, { query: { queryKey: getListOrdersQueryKey() } });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2">— History</p>
        <h1 className="font-serif text-4xl lg:text-5xl font-light tracking-tight">My <span className="italic">orders.</span></h1>
      </div>
        {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-32 mb-4 rounded-xl" />)}
      </div>
    );
  }

  const orderList: any[] = Array.isArray(data) ? data : ((data as any)?.orders || []);

  if (!orderList || orderList.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-4xl">
        <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="font-serif text-3xl font-light mb-2">No orders <span className="italic">yet.</span></h2>
        <p className="text-muted-foreground mb-6">Your order history will appear here.</p>
        <Link href="/store"><Button>Browse Store</Button></Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2">— History</p>
        <h1 className="font-serif text-4xl lg:text-5xl font-light tracking-tight">My <span className="italic">orders.</span></h1>
      </div>
      <div className="space-y-4">
        {orderList.map((order: any) => (
          <Link key={order.id} href={`/orders/${order.id}`}>
            <div className="border rounded-xl bg-card p-5 hover:border-primary transition-colors cursor-pointer">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">Order #{order.id}</span>
                    <Badge variant={statusVariant(order.status)}>{order.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold"><CurrencyAmount amount={order.total} /></p>
                  <p className="text-xs text-muted-foreground capitalize">{order.paymentMethod} • {order.paymentStatus}</p>
                </div>
              </div>
              <div className="flex gap-2 overflow-hidden">
                {order.items?.slice(0, 4).map((item: any) => (
                  <img
                    key={item.id}
                    src={item.productImage || "https://placehold.co/64x64/png"}
                    alt={item.productName}
                    className="w-14 h-14 rounded-lg border object-cover bg-secondary/20"
                  />
                ))}
                {order.items && order.items.length > 4 && (
                  <div className="w-14 h-14 rounded-lg border bg-muted flex items-center justify-center text-xs font-medium">
                    +{order.items.length - 4}
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
