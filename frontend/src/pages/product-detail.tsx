import { useState } from "react";
import { Link, useParams } from "wouter";
import {
  useGetProduct, getGetProductQueryKey,
  useGetRelatedProducts, getGetRelatedProductsQueryKey,
  useListProductReviews, getListProductReviewsQueryKey,
  useCreateReview,
  useAddToCart, getGetCartQueryKey,
  useAddToWishlist, getGetWishlistQueryKey,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { CurrencyAmount } from "@/components/ui/CurrencyAmount";
import { StarRating } from "@/components/products/StarRating";
import { ProductCard } from "@/components/products/ProductCard";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ShoppingCart, Heart, Minus, Plus, Star, Check, Truck, ShieldCheck, RefreshCcw } from "lucide-react";

export default function ProductDetail() {
  const params = useParams();
  const id = params.id ?? "";
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [imageIdx, setImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const { data: product, isLoading } = useGetProduct(id, {
    query: { enabled: !!id, queryKey: getGetProductQueryKey(id) }
  });
  const { data: related } = useGetRelatedProducts(id, {
    query: { enabled: !!id, queryKey: getGetRelatedProductsQueryKey(id) }
  });
  const { data: reviews } = useListProductReviews(id, {
    query: { enabled: !!id, queryKey: getListProductReviewsQueryKey(id) }
  });

  const addToCart = useAddToCart({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        toast({ title: "Added to cart", description: `${product?.name} added.` });
      },
      onError: () => toast({ title: "Login required", description: "Please log in to add items.", variant: "destructive" })
    }
  });

  const addToWishlist = useAddToWishlist({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetWishlistQueryKey() });
        toast({ title: "Added to wishlist" });
      },
      onError: () => toast({ title: "Login required", description: "Please log in to use wishlist.", variant: "destructive" })
    }
  });

  const createReview = useCreateReview({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProductReviewsQueryKey(id) });
        queryClient.invalidateQueries({ queryKey: getGetProductQueryKey(id) });
        setReviewComment("");
        setReviewRating(5);
        toast({ title: "Review posted!" });
      },
      onError: (e) => toast({ title: "Failed", description: e.message, variant: "destructive" })
    }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-14">
        <div className="grid md:grid-cols-2 gap-10">
          <Skeleton className="aspect-square rounded-3xl" />
          <div className="space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Product not found.</div>;
  }

  const discount = product.comparePrice && product.comparePrice > product.price
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : 0;

  return (
    <div className="container mx-auto px-4 lg:px-8 py-10 lg:py-14">
      {/* Breadcrumb */}
      <nav className="text-xs text-muted-foreground mb-8 uppercase tracking-wider">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/store" className="hover:text-foreground">Store</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground normal-case tracking-normal">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-square rounded-3xl border border-border/60 bg-muted overflow-hidden">
            <img src={product.images[imageIdx] || "https://placehold.co/600x600/png"}
              alt={product.name}
              className="w-full h-full object-cover" />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setImageIdx(i)}
                  className={`aspect-square rounded-xl border-2 overflow-hidden bg-muted transition-all ${
                    i === imageIdx ? "border-foreground" : "border-border/40 hover:border-border"
                  }`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.categoryName && (
            <Link href={`/store?categoryId=${product.categoryId}`}
              className="inline-block text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-4 hover:text-foreground">
              — {product.categoryName}
            </Link>
          )}
          <h1 className="font-serif text-4xl lg:text-5xl font-light leading-[1.05] tracking-tight mb-4">
            {product.name}
          </h1>
          <div className="flex items-center gap-3 mb-6 text-sm">
            <StarRating rating={product.rating} />
            <span className="text-muted-foreground">{product.rating.toFixed(1)} · {product.reviewCount} reviews</span>
            {product.partnerName && (
              <span className="text-muted-foreground">· Sold by {product.partnerName}</span>
            )}
          </div>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="font-serif text-4xl font-medium"><CurrencyAmount amount={product.price} /></span>
            {product.comparePrice && product.comparePrice > product.price && (
              <>
                <span className="text-base text-muted-foreground line-through">
                  <CurrencyAmount amount={product.comparePrice} />
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  Save {discount}%
                </span>
              </>
            )}
          </div>

          <p className="text-muted-foreground leading-relaxed mb-6 whitespace-pre-line">{product.description}</p>

          <div className="flex items-center gap-2 mb-6 text-sm">
            {product.inventory > 0 ? (
              <>
                <Check className="h-4 w-4 text-emerald-600" />
                <span className="text-emerald-600 font-medium">In stock</span>
                <span className="text-muted-foreground">· {product.inventory} available</span>
              </>
            ) : (
              <span className="text-destructive font-medium">Out of stock</span>
            )}
          </div>

          {/* Quantity & Actions */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <div className="flex items-center border border-border rounded-full overflow-hidden h-12">
              <button className="px-4 hover:bg-muted h-full disabled:opacity-50"
                disabled={quantity <= 1} onClick={() => setQuantity(q => q - 1)}>
                <Minus className="h-4 w-4" />
              </button>
              <span className="px-4 font-medium border-x border-border min-w-[3rem] text-center text-sm">{quantity}</span>
              <button className="px-4 hover:bg-muted h-full disabled:opacity-50"
                disabled={quantity >= product.inventory} onClick={() => setQuantity(q => q + 1)}>
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button size="lg" className="flex-1 min-w-[180px] gap-2 rounded-full h-12"
              disabled={product.inventory === 0 || addToCart.isPending}
              onClick={() => addToCart.mutate({ data: { productId: product.id, quantity } })}>
              <ShoppingCart className="h-4 w-4" /> Add to cart
            </Button>
            <Button size="lg" variant="outline" className="rounded-full h-12 w-12 p-0"
              onClick={() => addToWishlist.mutate({ productId: product.id })}>
              <Heart className="h-4 w-4" />
            </Button>
          </div>

          {/* Trust strip */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-border/60">
            {[
              { icon: Truck, t: "Free shipping", d: "Above ₹999" },
              { icon: ShieldCheck, t: "2-yr warranty", d: "Included" },
              { icon: RefreshCcw, t: "14-day returns", d: "No questions" },
            ].map((f) => (
              <div key={f.t} className="flex flex-col gap-1.5">
                <f.icon className="h-4 w-4 text-foreground" />
                <p className="text-sm font-medium">{f.t}</p>
                <p className="text-xs text-muted-foreground">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-20 border-t border-border/60 pt-12">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">— Reviews</p>
        <h2 className="font-serif text-3xl lg:text-4xl font-light tracking-tight mb-8">
          What customers <span className="italic">say.</span>
        </h2>
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-4">
            {!reviews || reviews.length === 0 ? (
              <p className="text-muted-foreground">No reviews yet. Be the first to share your thoughts.</p>
            ) : (
              reviews.map((r) => (
                <div key={r.id} className="border border-border/60 rounded-2xl p-5 bg-card">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-sm">{r.userName}</p>
                      <p className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                    <StarRating rating={r.rating} />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{r.comment}</p>
                </div>
              ))
            )}
          </div>

          <div className="border border-border/60 rounded-2xl p-6 bg-card h-fit">
            <h3 className="font-serif text-lg font-medium mb-4">Write a review</h3>
            {!isAuthenticated ? (
              <div className="text-sm text-muted-foreground">
                <Link href="/login" className="text-primary hover:underline">Log in</Link> to leave a review.
              </div>
            ) : (
              <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!reviewComment.trim()) return;
                  createReview.mutate({ id, data: { rating: reviewRating, comment: reviewComment } });
                }} className="space-y-3">
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-2">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} type="button" onClick={() => setReviewRating(n)}>
                        <Star className={`h-6 w-6 ${n <= reviewRating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-2">Your review</label>
                  <Textarea rows={4} placeholder="Share your thoughts..." className="rounded-xl"
                    value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} />
                </div>
                <Button type="submit" className="w-full rounded-full" disabled={createReview.isPending}>
                  {createReview.isPending ? "Posting..." : "Submit review"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Related */}
      {related && related.length > 0 && (
        <section className="mt-20 border-t border-border/60 pt-12">
          <div className="flex items-end justify-between mb-8">
            <h2 className="font-serif text-3xl lg:text-4xl font-light tracking-tight">
              You may also <span className="italic">like.</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
            {related.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
