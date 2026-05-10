import { useState, useRef } from "react";
import { Link } from "wouter";
import {
  useGetFeaturedProducts, getGetFeaturedProductsQueryKey,
  useListCategories, getListCategoriesQueryKey,
  useListProducts, getListProductsQueryKey,
  useAddToCart, getGetCartQueryKey,
} from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { CurrencyAmount } from "@/components/ui/CurrencyAmount";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { FaqAccordion } from "@/components/FaqAccordion";
import {
  ArrowRight, ArrowUpRight, Plus, Sparkles, Mail, ChevronLeft, ChevronRight, Star, Quote,
} from "lucide-react";

export default function Home() {
  const { data: featuredProducts, isLoading: isLoadingFeatured } = useGetFeaturedProducts({
    query: { queryKey: getGetFeaturedProductsQueryKey() }
  });
  const { data: categories } = useListCategories({
    query: { queryKey: getListCategoriesQueryKey() }
  });
  const newArrivalsParams = { page: 1, limit: 8, sort: "newest" as const };
  const { data: newArrivals } = useListProducts(newArrivalsParams, {
    query: { queryKey: getListProductsQueryKey(newArrivalsParams) },
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const addToCart = useAddToCart({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        toast({ title: "Added to cart" });
      },
      onError: () => toast({ title: "Login required", description: "Please log in to add items.", variant: "destructive" }),
    },
  });
  const handleQuickAdd = (e: React.MouseEvent, productId: string | number) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart.mutate({ data: { productId, quantity: 1 } });
  };

  const featured = featuredProducts ?? [];
  const hero = featured[0];
  const bestSellers = featured.slice(1, 4);
  const showcase = featured[4] ?? featured[0];
  const bento = featured.slice(5, 9);
  const arrivals = newArrivals?.products ?? [];

  return (
    <div className="bg-background overflow-hidden">

      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section className="border-b border-border/60">
        <div className="container mx-auto px-4 lg:px-8 pt-10 pb-16 lg:pt-14 lg:pb-24">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium tracking-wide uppercase mb-6">
                <Sparkles className="h-3 w-3" /> New Season · 2026
              </div>
              <h1 className="font-serif font-light leading-[0.95] tracking-tight text-foreground text-[clamp(3rem,8vw,7rem)]">
                Engineered<br />
                for the<br />
                <span className="italic font-normal text-primary">extraordinary.</span>
              </h1>
              <p className="text-base lg:text-lg text-muted-foreground leading-relaxed max-w-md mt-10">
                A curated collection of the finest tech — designed for those who refuse to compromise on craft, performance, and form.
              </p>
              <div className="mt-8 flex items-center gap-2 sm:gap-3">
                <Link href="/store" className="flex-1 sm:flex-none">
                  <Button size="lg" className="rounded-full px-6 sm:px-7 h-12 text-sm font-medium gap-2 w-full sm:w-auto">
                    Explore collection <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/about" className="shrink-0">
                  <Button size="lg" variant="ghost" className="rounded-full px-4 sm:px-5 h-12 text-sm font-medium">
                    Our story
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-6 mt-14 max-w-xl pt-8 border-t border-border/60">
                {[
                  { k: "120k+", v: "Happy customers" },
                  { k: "500+", v: "Premium products" },
                  { k: "4.9★", v: "Average rating" },
                ].map((s) => (
                  <div key={s.v}>
                    <div className="font-serif text-3xl font-medium text-foreground">{s.k}</div>
                    <div className="text-xs text-muted-foreground mt-1">{s.v}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              {hero ? (
                <Link href={`/products/${hero.id}`} className="block group">
                  <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-gradient-to-br from-muted to-accent/30 border border-border/60">
                    <img src={hero.images[0]} alt={hero.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                    <div className="absolute top-5 left-5 px-3 py-1.5 rounded-full bg-background/90 backdrop-blur text-xs font-medium tracking-wide">
                      Featured · {hero.categoryName}
                    </div>
                    <div className="absolute bottom-5 left-5 right-5 p-5 rounded-2xl bg-background/95 backdrop-blur-xl border border-border/40 shadow-lg">
                      <div className="flex items-end justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Editor's pick</p>
                          <h3 className="font-serif text-xl font-medium leading-tight truncate">{hero.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            <CurrencyAmount amount={hero.price} />
                          </p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 group-hover:rotate-45 transition-transform">
                          <ArrowUpRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ) : <Skeleton className="aspect-[4/5] rounded-3xl" />}
              <div className="hidden lg:block absolute -left-12 top-1/2 -rotate-90 origin-left text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                · TechPulse / 2026 collection ·
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── BEST SELLERS ─────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 lg:px-8 py-12 md:py-20 lg:py-24">
        <div className="flex flex-wrap items-end justify-between gap-5 mb-8 md:mb-12">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">— Best sellers</p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-6xl font-light tracking-tight max-w-2xl">
              Best —<br />
              <span className="italic">selling tech.</span>
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {(categories ?? []).slice(0, 3).map((c, i) => (
              <Link key={c.id} href={`/store?categoryId=${c.id}`}>
                <span className={`inline-flex items-center px-3.5 py-1.5 md:px-4 md:py-2 rounded-full text-xs font-medium border transition-colors ${
                  i === 0
                    ? "bg-foreground text-background border-foreground"
                    : "bg-background text-foreground border-border hover:border-foreground"
                }`}>{c.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile: 2-up grid with shorter 4:5 cards keeps the section compact.
            Desktop (md+): unchanged 3-up with the original 3:4 portrait cards. */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
          {isLoadingFeatured
            ? Array(3).fill(0).map((_, i) => (
                <Skeleton
                  key={i}
                  className={`aspect-[4/5] md:aspect-[3/4] rounded-2xl md:rounded-3xl ${
                    i === 2 ? "col-span-2 md:col-span-1" : ""
                  }`}
                />
              ))
            : bestSellers.map((p, i) => (
              <Link
                key={p.id}
                href={`/products/${p.id}`}
                className={`group block ${
                  /* On mobile we show a 2-column grid; if there are 3 items the
                     last one spans both columns so it still gets a hero feel. */
                  i === 2 ? "col-span-2 md:col-span-1" : ""
                }`}
              >
                <div className={`relative rounded-2xl md:rounded-3xl overflow-hidden bg-muted border border-border/60 ${
                  i === 2 ? "aspect-[16/9] md:aspect-[3/4]" : "aspect-[4/5] md:aspect-[3/4]"
                }`}>
                  <div className="absolute top-2.5 left-2.5 md:top-4 md:left-4 z-10 flex items-center gap-1.5 px-2 py-0.5 md:px-2.5 md:py-1 rounded-full bg-background/95 backdrop-blur text-[9px] md:text-[10px] font-medium uppercase tracking-wider">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                    {(i + 2) + "x Style"}
                  </div>
                  <img src={p.images[0]} alt={p.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]" />
                  <button aria-label={`Add ${p.name} to cart`}
                    onClick={(e) => handleQuickAdd(e, p.id)}
                    disabled={addToCart.isPending}
                    className="absolute bottom-2.5 right-2.5 md:bottom-4 md:right-4 h-8 w-8 md:h-10 md:w-10 rounded-full bg-background/95 backdrop-blur border border-border/40 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50">
                    <Plus className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  </button>
                </div>
                <div className="flex items-baseline justify-between mt-2.5 md:mt-4 px-0.5 md:px-1 gap-2">
                  <h3 className="font-serif text-sm md:text-lg font-medium truncate">{p.name}</h3>
                  <span className="text-xs md:text-sm font-medium text-muted-foreground shrink-0">
                    <CurrencyAmount amount={p.price} />
                  </span>
                </div>
              </Link>
            ))
          }
        </div>
      </section>

      {/* ─── WIDE FEATURE BANNER ──────────────────────────────────────────── */}
      <section className="container mx-auto px-4 lg:px-8 pb-12 md:pb-20 lg:pb-24">
        <div className="grid md:grid-cols-12 gap-3 md:gap-5">
          <div className="md:col-span-4 relative aspect-[16/10] sm:aspect-[2/1] md:aspect-auto md:min-h-[420px] rounded-2xl md:rounded-3xl overflow-hidden bg-muted border border-border/60">
            <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&q=80" alt="Curated by experts"
              className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6 text-white">
              <p className="font-serif text-xl md:text-2xl font-light leading-tight">
                Tech curated<br /><span className="italic">by experts</span>
              </p>
              <p className="text-[11px] md:text-xs text-white/80 mt-1.5 md:mt-2">Hand-selected products</p>
            </div>
          </div>
          <div className="md:col-span-8 relative min-h-[300px] md:min-h-[420px] rounded-2xl md:rounded-3xl overflow-hidden bg-foreground text-background border border-border/60 p-6 md:p-8 lg:p-12 flex flex-col justify-between">
            <img
              src={`${import.meta.env.BASE_URL}headphones-showcase.webp`}
              alt=""
              className="absolute -right-6 -bottom-6 md:-right-10 md:-bottom-10 w-[62%] md:w-[55%] max-w-md object-contain pointer-events-none drop-shadow-[0_25px_45px_rgba(0,0,0,0.55)]"
            />
            <div className="pointer-events-none absolute -right-12 -bottom-12 md:-right-16 md:-bottom-16 w-[60%] md:w-[50%] aspect-square rounded-full bg-primary/15 blur-3xl" />
            <div className="relative">
              <h3 className="font-serif font-light tracking-tight leading-[0.9] text-[clamp(2.25rem,9vw,6rem)]">
                TECH<br /><span className="italic">UNLEASHED</span>
              </h3>
            </div>
            <div className="relative grid grid-cols-2 gap-3 md:gap-4 max-w-md mt-6 md:mt-0">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-background/60">— Premium build</p>
                <p className="text-xs md:text-sm text-background/90">Aerospace-grade aluminum, hand-finished detail.</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-background/60">— Signature warranty</p>
                <p className="text-xs md:text-sm text-background/90">Two-year coverage on every product, no questions asked.</p>
              </div>
            </div>
            <Link href="/store" className="absolute top-5 right-5 md:top-8 md:right-8">
              <Button size="sm" variant="secondary" className="rounded-full gap-1.5 h-8 md:h-9 px-3 md:px-4 text-[11px] md:text-xs">
                Discover <Plus className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── NEW ARRIVALS · HORIZONTAL SLIDER ─────────────────────────────── */}
      <section className="container mx-auto px-4 lg:px-8 pb-20 lg:pb-24">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">— Just landed</p>
            <h2 className="font-serif text-4xl lg:text-5xl font-light tracking-tight">
              New <span className="italic">arrivals.</span>
            </h2>
          </div>
          <Link href="/store?sort=newest">
            <Button variant="ghost" size="sm" className="rounded-full gap-2 text-xs">
              View all new <ArrowUpRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>

        <div className="-mr-4 lg:-mr-8 overflow-x-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory">
          <div className="flex gap-5 pb-2 w-max pr-4 lg:pr-8">
            {(arrivals.length ? arrivals : Array(6).fill(null)).map((p, i) => (
              p ? (
                <Link key={p.id} href={`/products/${p.id}`} className="group block snap-start w-[260px] sm:w-[300px] shrink-0">
                  <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-muted border border-border/60">
                    <img src={p.images[0]} alt={p.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]" />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-background/95 backdrop-blur text-[10px] font-semibold uppercase tracking-wider">
                      New
                    </div>
                  </div>
                  <div className="pt-4 px-1">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{p.categoryName}</p>
                    <h3 className="font-serif text-base font-medium leading-snug line-clamp-1">{p.name}</h3>
                    <p className="text-sm font-semibold mt-1"><CurrencyAmount amount={p.price} /></p>
                  </div>
                </Link>
              ) : <Skeleton key={i} className="w-[260px] sm:w-[300px] aspect-[4/5] rounded-3xl shrink-0" />
            ))}
          </div>
        </div>
      </section>

      {/* ─── TRENDING NOW (carousel) ──────────────────────────────────────── */}
      <TrendingNow products={[...featured, ...arrivals]} />

      {/* ─── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 lg:px-8 pb-20 lg:pb-24">
        <h2 className="font-serif text-3xl lg:text-5xl font-light tracking-tight max-w-3xl mb-10">
          Loved by people who notice <span className="italic">the details.</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { q: "The build quality is genuinely on another level. It feels like an heirloom.", a: "Aarav S." },
            { q: "Easily the cleanest checkout experience I've had on any e-commerce site.", a: "Priya M." },
            { q: "TechPulse has become my default for any tech purchase. The taste is unmatched.", a: "Rohan K." },
          ].map((t) => (
            <figure key={t.a} className="rounded-3xl border border-border/60 bg-card p-6 lg:p-7 flex flex-col gap-5">
              <Quote className="h-5 w-5 text-muted-foreground/60" />
              <blockquote className="font-serif text-lg lg:text-xl font-light leading-snug text-foreground/90">
                "{t.q}"
              </blockquote>
              <figcaption className="text-xs uppercase tracking-widest text-muted-foreground mt-auto">— {t.a}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ─── BROWSE BY CATEGORY ─────────────────────────────────────────── */}
      {categories && categories.length > 0 && (
        <section className="container mx-auto px-4 lg:px-8 pb-20">
          <div className="flex items-end justify-between mb-8">
            <h2 className="font-serif text-3xl lg:text-4xl font-light tracking-tight">
              Shop by <span className="italic">category</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.slice(0, 12).map((cat) => (
              <Link key={cat.id} href={`/store?categoryId=${cat.id}`}
                className="group relative aspect-square rounded-2xl overflow-hidden border border-border/60 bg-neutral-900 flex items-end p-4 hover:border-foreground transition-colors">
                {cat.image && (
                  <img src={cat.image} alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
                <h3 className="relative font-serif text-base font-medium text-white">{cat.name}</h3>
                <ArrowUpRight className="absolute top-3 right-3 h-4 w-4 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ─── FAQ ─────────────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 lg:px-8 pb-20 lg:pb-24">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">— FAQ</p>
            <h2 className="font-serif text-4xl lg:text-5xl font-light tracking-tight">
              Frequently<br />
              <span className="italic">asked.</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-4 max-w-sm">
              Quick answers to the things shoppers ask us most.
            </p>
            <Link href="/contact">
              <Button variant="outline" className="rounded-full mt-6 gap-2 h-10 px-5 text-xs">
                Contact support <ArrowUpRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          <div className="lg:col-span-8">
            <Faq />
          </div>
        </div>
      </section>

      {/* ─── NEWSLETTER ───────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 lg:px-8 pb-20 lg:pb-24">
        <div className="relative rounded-[2rem] overflow-hidden bg-foreground text-background p-8 lg:p-14">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/30 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
          <div className="relative grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background/10 backdrop-blur border border-background/10 text-xs uppercase tracking-wider mb-5">
                <Mail className="h-3 w-3" /> Inner circle
              </div>
              <h3 className="font-serif font-light leading-[1.05] text-[clamp(2rem,5vw,3.5rem)]">
                Be the first<br />
                <span className="italic">to know.</span>
              </h3>
              <p className="text-sm text-background/70 mt-5 max-w-md">
                Drops, restocks, and members-only pricing — sent once a week. Unsubscribe any time.
              </p>
            </div>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-col sm:flex-row gap-3 lg:justify-end"
            >
              <Input type="email" required placeholder="you@example.com"
                className="h-12 rounded-full bg-background/10 backdrop-blur border-background/20 text-background placeholder:text-background/50 focus-visible:ring-background/30 px-5 sm:max-w-sm" />
              <Button type="submit" size="lg" variant="secondary" className="rounded-full h-12 px-7 text-sm font-medium gap-2 shrink-0">
                Subscribe <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* ─── OVERSIZED WORDMARK ──────────────────────────────────────────── */}
      <section className="border-t border-border/60 overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8 pt-16 pb-6">
          <div className="grid md:grid-cols-2 gap-8 mb-10">
            <p className="font-serif text-2xl lg:text-3xl font-light leading-tight max-w-md italic">
              "The future of tech, refined to its essential form."
            </p>
            <div className="flex md:justify-end items-end">
              <Link href="/store">
                <Button size="lg" className="rounded-full h-12 px-7 gap-2">
                  Browse the store <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="font-serif font-light tracking-tight leading-none text-foreground/95 text-[clamp(4rem,18vw,18rem)] -mb-[0.18em] select-none">
            TechPulse<span className="text-primary">.</span>
          </div>
        </div>
      </section>
    </div>
  );
}

type TrendingProduct = {
  id: string | number;
  name: string;
  price: number;
  images: string[];
  categoryName?: string;
};

function TrendingNow({ products }: { products: TrendingProduct[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const seen = new Set<string>();
  const items = products.filter((p) => {
    const k = String(p.id);
    if (!p || seen.has(k)) return false;
    seen.add(k);
    return true;
  }).slice(0, 8);

  const scrollBy = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
  };

  if (items.length === 0) return null;

  return (
    <section className="container mx-auto px-4 lg:px-8 pb-20 lg:pb-24">
      <div className="flex items-end justify-between gap-6 mb-8">
        <div>
          <h2 className="font-serif text-4xl lg:text-5xl font-light tracking-tight">
            Trending <span className="italic">now</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-2">What everyone's reaching for.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => scrollBy(-1)} aria-label="Scroll left"
            className="h-10 w-10 rounded-full border border-border/80 flex items-center justify-center hover:bg-accent transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => scrollBy(1)} aria-label="Scroll right"
            className="h-10 w-10 rounded-full border border-border/80 flex items-center justify-center hover:bg-accent transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div ref={scroller}
        className="-mr-4 lg:-mr-8 overflow-x-auto scroll-smooth scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory">
        <div className="flex gap-4 pb-1 w-max pr-4 lg:pr-8">
          {items.map((p, i) => {
            const onSale = i % 2 === 0;
            const wasPrice = onSale ? Math.round((p.price * 1.25) / 100) * 100 : null;
            const rating = (4.4 + ((i * 7) % 6) / 10).toFixed(1);
            return (
              <Link key={p.id} href={`/products/${p.id}`}
                className="group block snap-start w-[230px] sm:w-[260px] shrink-0">
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted border border-border/60">
                  <img src={p.images[0]} alt={p.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  {onSale && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-background/95 backdrop-blur text-[10px] font-semibold uppercase tracking-wider">
                      Sale
                    </div>
                  )}
                </div>
                <div className="pt-4 px-1">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{p.categoryName ?? "Tech"}</p>
                  <h3 className="font-medium text-sm leading-snug line-clamp-1">{p.name}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-semibold"><CurrencyAmount amount={p.price} /></span>
                      {wasPrice && (
                        <span className="text-xs text-muted-foreground line-through">
                          <CurrencyAmount amount={wasPrice} />
                        </span>
                      )}
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="h-3 w-3 fill-foreground text-foreground" />{rating}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const FAQ_ITEMS = [
  { q: "How long does shipping take?", a: "Standard delivery lands in 2–4 business days across India, with free shipping on every order over ₹999. Express options are available at checkout." },
  { q: "What's your return policy?", a: "Every order ships with a 14-day no-questions-asked return window. Items are picked up from your doorstep, and refunds settle in 3–5 days." },
  { q: "Do products come with warranty?", a: "Yes — every product includes the manufacturer warranty plus our complimentary 2-year TechPulse Care coverage on eligible items." },
  { q: "Can I become a partner seller?", a: "Absolutely. Apply through the Partner page and our team reviews applications within two business days." },
  { q: "Which payment methods do you accept?", a: "Cards, UPI, NetBanking, and Cash on Delivery are supported. Members can also pay via wallet credits earned through orders." },
];

function Faq() {
  return <FaqAccordion items={FAQ_ITEMS} />;
}
