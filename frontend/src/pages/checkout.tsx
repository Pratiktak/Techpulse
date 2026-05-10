import { useState } from "react";
import { useLocation } from "wouter";
import {
  useGetCart, getGetCartQueryKey,
  useCreateOrder,
} from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CurrencyAmount } from "@/components/ui/CurrencyAmount";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Truck, CreditCard, Wallet, Lock } from "lucide-react";

export default function Checkout() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cart, isLoading } = useGetCart({ query: { queryKey: getGetCartQueryKey() } });

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [line1, setLine1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [notes, setNotes] = useState("");

  const createOrder = useCreateOrder({
    mutation: {
      onSuccess: (order) => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        const isOnline = paymentMethod === "online";
        toast({
          title: isOnline ? "Payment successful" : "Order placed",
          description: isOnline
            ? `Payment received. Your order #${order.id} is confirmed.`
            : `Your order #${order.id} has been placed.`,
        });
        setLocation(`/orders/${order.id}`);
      },
      onError: (e: any) => {
        if (e?.cancelled) {
          toast({ title: "Payment cancelled", description: "You closed the payment window before completing payment." });
          return;
        }
        toast({ title: "Payment failed", description: e?.message || "Something went wrong.", variant: "destructive" });
      },
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const shippingAddress = `${name}\n${phone}\n${line1}\n${city}, ${state} ${pincode}`;
    createOrder.mutate({ data: { shippingAddress, paymentMethod, notes: notes || undefined } });
  };

  if (isLoading) return <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Loading...</div>;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h2 className="font-serif text-3xl font-light mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">Add some items before checking out.</p>
        <Button className="rounded-full px-6" onClick={() => setLocation("/store")}>Browse Store</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-14 max-w-6xl">
      <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2">— Almost there</p>
      <h1 className="font-serif text-4xl lg:text-5xl font-light tracking-tight mb-10">
        Secure <span className="italic">checkout.</span>
      </h1>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping */}
          <section className="border border-border/60 rounded-2xl bg-card p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-9 w-9 rounded-full bg-foreground text-background flex items-center justify-center">
                <Truck className="h-4 w-4" />
              </div>
              <h2 className="font-serif text-xl font-medium">Shipping address</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs uppercase tracking-wider text-muted-foreground">Full name</Label>
                <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} className="h-11 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs uppercase tracking-wider text-muted-foreground">Phone</Label>
                <Input id="phone" required value={phone} onChange={(e) => setPhone(e.target.value)} className="h-11 rounded-xl" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="line1" className="text-xs uppercase tracking-wider text-muted-foreground">Address</Label>
                <Input id="line1" required value={line1} onChange={(e) => setLine1(e.target.value)} placeholder="House no., Street" className="h-11 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city" className="text-xs uppercase tracking-wider text-muted-foreground">City</Label>
                <Input id="city" required value={city} onChange={(e) => setCity(e.target.value)} className="h-11 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="state" className="text-xs uppercase tracking-wider text-muted-foreground">State</Label>
                <Input id="state" required value={state} onChange={(e) => setState(e.target.value)} className="h-11 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pincode" className="text-xs uppercase tracking-wider text-muted-foreground">Pincode</Label>
                <Input id="pincode" required value={pincode} onChange={(e) => setPincode(e.target.value)} className="h-11 rounded-xl" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="notes" className="text-xs uppercase tracking-wider text-muted-foreground">Order notes (optional)</Label>
                <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Delivery instructions..." className="rounded-xl" />
              </div>
            </div>
          </section>

          {/* Payment */}
          <section className="border border-border/60 rounded-2xl bg-card p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-9 w-9 rounded-full bg-foreground text-background flex items-center justify-center">
                <CreditCard className="h-4 w-4" />
              </div>
              <h2 className="font-serif text-xl font-medium">Payment method</h2>
            </div>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="gap-3">
              <label className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === "cod" ? "border-foreground bg-muted/40" : "border-border hover:border-foreground/50"}`}>
                <RadioGroupItem value="cod" id="cod" className="mt-0.5" />
                <Wallet className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium">Cash on Delivery</p>
                  <p className="text-sm text-muted-foreground">Pay when your order arrives.</p>
                </div>
              </label>
              <label className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === "online" ? "border-foreground bg-muted/40" : "border-border hover:border-foreground/50"}`}>
                <RadioGroupItem value="online" id="online" className="mt-0.5" />
                <CreditCard className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium">Online payment</p>
                  <p className="text-sm text-muted-foreground">Card, UPI, NetBanking (test mode).</p>
                </div>
              </label>
            </RadioGroup>
          </section>
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="border border-border/60 rounded-2xl bg-card p-6 space-y-5">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">— Order</p>
              <h2 className="font-serif text-2xl font-light">Summary</h2>
            </div>
            <div className="space-y-3 text-sm max-h-64 overflow-auto pr-1">
              {cart.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <img src={item.product.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover border border-border/40 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs truncate">{item.product.name}</p>
                    <p className="text-[10px] text-muted-foreground">Qty {item.quantity}</p>
                  </div>
                  <span className="text-xs font-medium shrink-0"><CurrencyAmount amount={item.product.price * item.quantity} /></span>
                </div>
              ))}
            </div>
            <div className="border-t border-border/60 pt-4 space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span><CurrencyAmount amount={cart.total} /></span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span className="text-emerald-600">Free</span>
              </div>
            </div>
            <div className="flex items-baseline justify-between border-t border-border/60 pt-4">
              <span className="text-sm font-medium">Total</span>
              <span className="font-serif text-2xl font-medium"><CurrencyAmount amount={cart.total} /></span>
            </div>
            <Button type="submit" size="lg" className="w-full rounded-full h-12 gap-2" disabled={createOrder.isPending}>
              {createOrder.isPending
                ? <><Loader2 className="h-4 w-4 animate-spin" /> {paymentMethod === "online" ? "Opening secure payment..." : "Placing order..."}</>
                : <><Lock className="h-4 w-4" /> {paymentMethod === "online" ? "Pay now" : "Place order"}</>}
            </Button>
            <p className="text-[10px] text-muted-foreground text-center">Secured by 256-bit encryption</p>
          </div>
        </div>
      </form>
    </div>
  );
}
