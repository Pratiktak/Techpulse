import { Link, useParams } from "wouter";
import { useGetOrder, getGetOrderQueryKey, useCancelOrder, getListOrdersQueryKey } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CurrencyAmount } from "@/components/ui/CurrencyAmount";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Truck, Package, CheckCircle2, Clock, XCircle } from "lucide-react";

const statusFlow = ["pending", "processing", "shipped", "delivered"];

export default function OrderDetail() {
  const params = useParams();
  const id = params.id ?? "";
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useGetOrder(id, {
    query: { enabled: !!id, queryKey: getGetOrderQueryKey(id) }
  });

  const cancelOrder = useCancelOrder({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetOrderQueryKey(id) });
        queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
        toast({ title: "Order cancelled" });
      },
      onError: (e) => toast({ title: "Failed", description: e.message, variant: "destructive" })
    }
  });

  if (isLoading) {
    return <div className="container mx-auto px-4 py-10 max-w-4xl"><Skeleton className="h-96 rounded-xl" /></div>;
  }

  if (!order) {
    return <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Order not found.</div>;
  }

  const currentStep = order.status === "cancelled" ? -1 : statusFlow.indexOf(order.status);
  const isCancelled = order.status === "cancelled";
  const canCancel = order.status === "pending" || order.status === "processing";

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <Link href="/orders" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-1">— Order</p>
            <h1 className="font-serif text-4xl lg:text-5xl font-light tracking-tight">#{order.id}</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Placed on {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <Badge variant={isCancelled ? "destructive" : "default"} className="text-sm py-1 px-3 capitalize">
          {order.status}
        </Badge>
      </div>

      {/* Timeline */}
      {!isCancelled ? (
        <div className="border rounded-xl bg-card p-6 mb-8">
          <h2 className="font-semibold mb-4">Order Status</h2>
          <div className="flex items-center justify-between">
            {statusFlow.map((step, i) => {
              const Icon = i === 0 ? Clock : i === 1 ? Package : i === 2 ? Truck : CheckCircle2;
              const reached = i <= currentStep;
              return (
                <div key={step} className="flex-1 flex flex-col items-center relative">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${reached ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className={`text-xs mt-2 capitalize ${reached ? "font-medium" : "text-muted-foreground"}`}>{step}</p>
                  {i < statusFlow.length - 1 && (
                    <div className={`absolute top-5 left-1/2 w-full h-0.5 ${i < currentStep ? "bg-primary" : "bg-muted"}`} />
                  )}
                </div>
              );
            })}
          </div>
          {order.trackingNumber && (
            <div className="mt-6 pt-6 border-t text-sm">
              <span className="text-muted-foreground">Tracking number: </span>
              <span className="font-mono font-medium">{order.trackingNumber}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="border border-destructive/30 bg-destructive/5 rounded-xl p-6 mb-8 flex items-center gap-3">
          <XCircle className="h-5 w-5 text-destructive" />
          <p className="text-sm">This order has been cancelled.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Items */}
        <div className="md:col-span-2 border rounded-xl bg-card p-6">
          <h2 className="font-semibold mb-4">Items</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4">
                <img
                  src={item.productImage || "https://placehold.co/64x64/png"}
                  alt={item.productName}
                  className="w-16 h-16 rounded-lg border object-cover bg-secondary/20"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.productName}</p>
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <p className="font-medium"><CurrencyAmount amount={item.price * item.quantity} /></p>
              </div>
            ))}
          </div>
          <div className="border-t mt-4 pt-4 flex justify-between font-bold">
            <span>Total</span>
            <span><CurrencyAmount amount={order.total} /></span>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div className="border rounded-xl bg-card p-6">
            <h3 className="font-semibold mb-2">Shipping Address</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{order.shippingAddress}</p>
          </div>
          <div className="border rounded-xl bg-card p-6">
            <h3 className="font-semibold mb-2">Payment</h3>
            <p className="text-sm text-muted-foreground capitalize">Method: {order.paymentMethod || "—"}</p>
            <p className="text-sm text-muted-foreground capitalize">Status: {order.paymentStatus}</p>
          </div>
          {canCancel && (
            <Button variant="outline" className="w-full text-destructive hover:text-destructive" onClick={() => cancelOrder.mutate({ id })} disabled={cancelOrder.isPending}>
              Cancel Order
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
