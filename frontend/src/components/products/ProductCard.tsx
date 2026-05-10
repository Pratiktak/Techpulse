import { Link } from "wouter";
import { Product } from "@/lib/api";
import { CurrencyAmount } from "@/components/ui/CurrencyAmount";
import { useAddToCart, getGetCartQueryKey } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Star } from "lucide-react";

export function ProductCard({ product }: { product: Product }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addToCart = useAddToCart({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        toast({ title: "Added to cart", description: `${product.name} has been added.` });
      },
      onError: () => toast({ title: "Login required", description: "Please log in to add items.", variant: "destructive" }),
    },
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart.mutate({ data: { productId: product.id, quantity: 1 } });
  };

  const discount =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round((1 - product.price / product.comparePrice) * 100)
      : 0;

  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col h-full"
    >
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-border/60 bg-muted/40">
        <img
          src={product.images[0] || "https://placehold.co/400x400/png"}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
        />
        {discount > 0 && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-background/95 backdrop-blur text-[10px] font-semibold uppercase tracking-wider">
            -{discount}%
          </div>
        )}
        <button
          aria-label="Add to cart"
          onClick={handleAddToCart}
          disabled={addToCart.isPending || product.inventory === 0}
          className="absolute bottom-3 right-3 h-9 w-9 rounded-full bg-background/95 backdrop-blur border border-border/40 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="pt-4 px-1 flex flex-col flex-grow">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
          {product.categoryName}
        </p>
        <h3 className="font-serif text-base font-medium leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <div className="mt-2 flex items-end justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold">
              <CurrencyAmount amount={product.price} />
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-xs text-muted-foreground line-through">
                <CurrencyAmount amount={product.comparePrice} />
              </span>
            )}
          </div>
          {product.reviewCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {product.rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
