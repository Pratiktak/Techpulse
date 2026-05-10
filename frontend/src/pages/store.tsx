import { useState, useEffect } from "react";
import { Link, useSearch } from "wouter";
import { useListProducts, useListCategories, getListProductsQueryKey, getListCategoriesQueryKey } from "@/lib/api";
import { ProductCard } from "@/components/products/ProductCard";
import { SkeletonCard } from "@/components/products/SkeletonCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X, SlidersHorizontal, ArrowRight } from "lucide-react";

export default function Store() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);

  const [search, setSearch] = useState(params.get("search") || "");
  const [categoryId, setCategoryId] = useState<string | undefined>(
    params.get("categoryId") || undefined
  );
  const [sort, setSort] = useState(params.get("sort") || "");
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const queryParams = {
    page, limit: 12,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(sort ? { sort } : {}),
  };

  const { data, isLoading } = useListProducts(queryParams, {
    query: { queryKey: getListProductsQueryKey(queryParams) }
  });
  const { data: categories } = useListCategories({
    query: { queryKey: getListCategoriesQueryKey() }
  });

  const clearFilter = () => {
    setSearch(""); setCategoryId(undefined); setSort(""); setPage(1);
  };

  const hasFilters = !!debouncedSearch || !!categoryId || !!sort;
  const activeCategory = categories?.find(c => c.id === categoryId);

  return (
    <div className="bg-background">
      {/* Editorial header */}
      <section className="border-b border-border/60">
        <div className="container mx-auto px-4 lg:px-8 pt-12 pb-10">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">— The collection</p>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h1 className="font-serif font-light leading-[0.95] tracking-tight text-[clamp(2.5rem,7vw,5rem)]">
              {activeCategory ? <>Shop <span className="italic">{activeCategory.name}.</span></> : <>The <span className="italic">store.</span></>}
            </h1>
            <p className="text-sm text-muted-foreground">
              {data?.total ? `${data.total} products` : "Browsing all tech"}
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 lg:px-8 py-10">
        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search products..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-11 rounded-full" />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select value={categoryId ? String(categoryId) : "all"}
              onValueChange={(v) => { setCategoryId(v === "all" ? undefined : v); setPage(1); }}>
              <SelectTrigger className="w-44 h-11 rounded-full"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sort || "default"}
              onValueChange={(v) => { setSort(v === "default" ? "" : v); setPage(1); }}>
              <SelectTrigger className="w-44 h-11 rounded-full">
                <SlidersHorizontal className="h-3.5 w-3.5 mr-2" /><SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Featured</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="rating_desc">Top Rated</SelectItem>
              </SelectContent>
            </Select>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilter} className="rounded-full h-11 gap-1.5">
                <X className="h-3.5 w-3.5" /> Clear
              </Button>
            )}
          </div>
        </div>

        {/* Category chips */}
        {categories && (
          <div className="flex gap-2 flex-wrap mb-10">
            <button
              onClick={() => { setCategoryId(undefined); setPage(1); }}
              className={`text-xs px-3.5 py-1.5 rounded-full border transition-colors ${
                !categoryId ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground"
              }`}>All</button>
            {categories.map((c) => (
              <button key={c.id}
                onClick={() => { setCategoryId(c.id); setPage(1); }}
                className={`text-xs px-3.5 py-1.5 rounded-full border transition-colors ${
                  categoryId === c.id ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground"
                }`}>{c.name}</button>
            ))}
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
          {isLoading ? (
            Array(12).fill(0).map((_, i) => <SkeletonCard key={i} />)
          ) : data?.products && data.products.length > 0 ? (
            data.products.map((product) => <ProductCard key={product.id} product={product} />)
          ) : (
            <div className="col-span-full py-24 text-center">
              <p className="font-serif text-2xl font-light mb-2">No products found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters.</p>
              <Link href="/store"><Button variant="outline" className="rounded-full mt-6 gap-2">Reset <ArrowRight className="h-4 w-4" /></Button></Link>
            </div>
          )}
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-14">
            <Button variant="outline" size="sm" className="rounded-full"
              disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
            <span className="text-sm text-muted-foreground">
              Page <span className="text-foreground font-medium">{page}</span> of {data.totalPages}
            </span>
            <Button variant="outline" size="sm" className="rounded-full"
              disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        )}
      </div>
    </div>
  );
}
