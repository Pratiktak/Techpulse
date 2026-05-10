import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";

// ============================================================================
// API base + fetch wrapper
// ============================================================================

// In dev (and on Replit) the backend is reverse-proxied at /api on the same
// origin. In production (Render) the API is a separate service on a different
// domain — set VITE_API_BASE_URL to e.g. "https://techpulse-api.onrender.com"
// (no trailing /api) and we'll append /api here.
const RAW_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
const API_BASE = RAW_BASE ? `${RAW_BASE}/api` : "/api";

async function apiFetch<T = any>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...init,
    headers: {
      ...(init.body && !(init.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let body: any = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }
  if (!res.ok) {
    const err = new Error(body?.message || body?.error || res.statusText) as Error & {
      status?: number;
      response?: { status: number; data: any };
    };
    err.status = res.status;
    err.response = { status: res.status, data: body };
    throw err;
  }
  return body as T;
}

// ============================================================================
// Types — frontend-friendly shapes (id as string, etc.)
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "partner" | "admin";
  phone?: string;
  address?: string;
  avatar?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  images: string[];
  category: string;
  categoryId: string;
  categoryName: string;
  inventory: number;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isActive: boolean;
  partnerName?: string;
  partnerId?: string;
}

export interface Category {
  id: string;
  name: string;
  image?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentMethod: string;
  paymentStatus: string;
  total: number;
  items: OrderItem[];
  shippingAddress: string;
  trackingNumber?: string;
  createdAt: string;
  userId?: string;
}

export interface PartnerProfile {
  id: string;
  businessName: string;
  businessEmail?: string;
  businessPhone?: string;
  businessAddress?: string;
  status: "pending" | "approved" | "rejected";
}

// ============================================================================
// Adapters from MongoDB shapes
// ============================================================================

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80";

function adaptUser(raw: any): User | null {
  if (!raw) return null;
  return {
    id: String(raw._id ?? raw.id),
    email: raw.email,
    name: raw.fullName ?? raw.name ?? "",
    role: (raw.role as User["role"]) ?? "user",
    phone: raw.phone,
    address: raw.address,
    avatar: raw.avatar,
  };
}

function adaptProduct(raw: any): Product {
  const cat = raw.category ?? "Gadgets";
  const partnerObj = typeof raw.partner === "object" && raw.partner !== null ? raw.partner : null;
  const image = raw.image || FALLBACK_IMG;
  return {
    id: String(raw._id ?? raw.id),
    name: raw.name ?? "",
    description: raw.description ?? "",
    price: Number(raw.price) || 0,
    comparePrice: undefined,
    images: [image],
    category: cat,
    categoryId: cat,
    categoryName: cat,
    inventory: 999,
    rating: 4.7,
    reviewCount: 0,
    isFeatured: !!raw.isFeatured,
    isActive: true,
    partnerName: partnerObj?.businessName,
    partnerId: partnerObj ? String(partnerObj._id) : raw.partner ? String(raw.partner) : undefined,
  };
}

function adaptCart(raw: any): Cart {
  const items: CartItem[] = (raw?.items ?? [])
    .filter((it: any) => it.product) // skip null products
    .map((it: any) => {
      const p = adaptProduct(it.product);
      return {
        id: String(it._id ?? p.id),
        productId: p.id,
        quantity: Number(it.quantity) || 1,
        product: p,
      };
    });
  const total = items.reduce((s, it) => s + it.product.price * it.quantity, 0);
  const itemCount = items.reduce((s, it) => s + it.quantity, 0);
  return { items, total, itemCount };
}

function adaptOrder(raw: any): Order {
  const items: OrderItem[] = (raw?.items ?? []).map((it: any) => {
    const productObj = typeof it.product === "object" && it.product !== null ? it.product : null;
    const productId = productObj ? String(productObj._id) : String(it.product);
    return {
      id: String(it._id ?? productId),
      productId,
      productName: productObj?.name ?? "Product",
      productImage: productObj?.image ?? FALLBACK_IMG,
      quantity: Number(it.quantity) || 1,
      price: Number(it.price) || 0,
    };
  });
  const shipping = raw?.shippingAddress;
  let shippingStr = "";
  if (typeof shipping === "string") shippingStr = shipping;
  else if (shipping)
    shippingStr = [
      shipping.fullName,
      shipping.phone,
      shipping.address,
      `${shipping.city ?? ""}, ${shipping.state ?? ""} ${shipping.pincode ?? ""}`.trim(),
      shipping.country,
    ].filter(Boolean).join("\n");

  const userObj = typeof raw.user === "object" && raw.user !== null ? raw.user : null;

  return {
    id: String(raw._id ?? raw.id),
    status: (raw.orderStatus ?? "pending") as Order["status"],
    paymentMethod: String(raw.paymentMethod ?? "").toLowerCase(),
    paymentStatus: raw.paymentStatus ?? "pending",
    total: Number(raw.totalPrice) || 0,
    items,
    shippingAddress: shippingStr,
    createdAt: raw.createdAt ?? new Date().toISOString(),
    userId: userObj ? String(userObj._id) : raw.user ? String(raw.user) : undefined,
  };
}

function adaptPartner(raw: any): PartnerProfile | null {
  if (!raw) return null;
  return {
    id: String(raw._id ?? raw.id),
    businessName: raw.businessName ?? "",
    businessEmail: undefined,
    businessPhone: raw.phone,
    businessAddress: raw.address,
    status: raw.isApproved ? "approved" : "pending",
  };
}

// ============================================================================
// Categories — derived from product list (backend has no /categories)
// ============================================================================

const KNOWN_CATEGORIES: Category[] = [
  { id: "Smartphones", name: "Smartphones", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80" },
  { id: "Laptops", name: "Laptops", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80" },
  { id: "Smartwatches", name: "Smartwatches", image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&q=80" },
  { id: "Headphones", name: "Headphones", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80" },
  { id: "Gaming", name: "Gaming", image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&q=80" },
  { id: "Gadgets", name: "Gadgets", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80" },
];

// ============================================================================
// Query keys
// ============================================================================

export const getGetMeQueryKey = () => ["me"] as const;
export const getListProductsQueryKey = (params?: any) => ["products", "list", params ?? {}] as const;
export const getGetFeaturedProductsQueryKey = () => ["products", "featured"] as const;
export const getListCategoriesQueryKey = () => ["categories"] as const;
export const getGetProductQueryKey = (id: string | number) => ["products", "detail", String(id)] as const;
export const getGetRelatedProductsQueryKey = (id: string | number) => ["products", "related", String(id)] as const;
export const getListProductReviewsQueryKey = (id: string | number) => ["reviews", String(id)] as const;
export const getGetCartQueryKey = () => ["cart"] as const;
export const getGetWishlistQueryKey = () => ["wishlist"] as const;
export const getListOrdersQueryKey = () => ["orders", "mine"] as const;
export const getGetOrderQueryKey = (id: string | number) => ["orders", "detail", String(id)] as const;
export const getGetPartnerProfileQueryKey = () => ["partner", "me"] as const;
export const getGetPartnerStatsQueryKey = () => ["partner", "stats"] as const;
export const getListPartnerProductsQueryKey = () => ["partner", "products"] as const;
export const getListPartnerOrdersQueryKey = () => ["partner", "orders"] as const;
export const getGetAdminAnalyticsQueryKey = () => ["admin", "analytics"] as const;
export const getAdminListUsersQueryKey = () => ["admin", "users"] as const;
export const getAdminListPartnersQueryKey = () => ["admin", "partners"] as const;
export const getAdminListOrdersQueryKey = () => ["admin", "orders"] as const;
export const getAdminListProductsQueryKey = () => ["admin", "products"] as const;

// ============================================================================
// Auth token getter (no-op — we use cookies)
// ============================================================================

export function setAuthTokenGetter(_fn: () => string | null) {
  /* no-op — cookie auth */
}

// ============================================================================
// Auth hooks
// ============================================================================

type Opts<TData, TError = Error> = {
  query?: Partial<UseQueryOptions<TData, TError>>;
};
type MOpts<TData, TVars, TError = Error> = {
  mutation?: Partial<UseMutationOptions<TData, TError, TVars>>;
};

export function useGetMe(opts: Opts<User | null> = {}) {
  return useQuery<User | null>({
    queryKey: getGetMeQueryKey() as any,
    queryFn: async () => {
      const r = await apiFetch<{ user: any }>(`/auth/user/me`);
      return adaptUser(r.user);
    },
    retry: false,
    ...opts.query,
  });
}

export function useLogin(opts: MOpts<{ user: User; token: string }, { data: { email: string; password: string } }> = {}) {
  return useMutation({
    mutationFn: async ({ data }) => {
      const r = await apiFetch<{ user: any }>(`/auth/user/login`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      return { user: adaptUser(r.user)!, token: "cookie" };
    },
    ...opts.mutation,
  });
}

export function useRegister(opts: MOpts<{ user: User; token: string }, { data: { name: string; email: string; password: string } }> = {}) {
  return useMutation({
    mutationFn: async ({ data }) => {
      const r = await apiFetch<{ user: any }>(`/auth/user/register`, {
        method: "POST",
        body: JSON.stringify({ fullName: data.name, email: data.email, password: data.password }),
      });
      return { user: adaptUser(r.user)!, token: "cookie" };
    },
    ...opts.mutation,
  });
}

export async function logoutRequest() {
  try {
    await apiFetch(`/auth/user/logout`);
  } catch {
    /* noop */
  }
}

// ============================================================================
// Product hooks
// ============================================================================

async function fetchAllProducts(): Promise<Product[]> {
  try {
    const r = await apiFetch<{ products: any[] }>(`/products`);
    return (r.products ?? []).map(adaptProduct);
  } catch (e: any) {
    if (e?.status === 404) return [];
    throw e;
  }
}

interface ListProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string | number;
  sort?: string;
}
interface ListProductsResponse {
  products: Product[];
  total: number;
  totalPages: number;
  page: number;
}

export function useListProducts(
  params: ListProductsParams = {},
  opts: Opts<ListProductsResponse> = {},
) {
  return useQuery<ListProductsResponse>({
    queryKey: getListProductsQueryKey(params) as any,
    queryFn: async () => {
      let products = await fetchAllProducts();
      if (params.search) {
        const q = params.search.toLowerCase();
        products = products.filter(
          p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q),
        );
      }
      if (params.categoryId) {
        const c = String(params.categoryId);
        products = products.filter(p => p.categoryId === c);
      }
      switch (params.sort) {
        case "newest":
          products = products.slice().reverse();
          break;
        case "price_asc":
          products = products.slice().sort((a, b) => a.price - b.price);
          break;
        case "price_desc":
          products = products.slice().sort((a, b) => b.price - a.price);
          break;
        case "rating_desc":
          products = products.slice().sort((a, b) => b.rating - a.rating);
          break;
      }
      const page = params.page ?? 1;
      const limit = params.limit ?? 12;
      const total = products.length;
      const totalPages = Math.max(1, Math.ceil(total / limit));
      const start = (page - 1) * limit;
      return { products: products.slice(start, start + limit), total, totalPages, page };
    },
    ...opts.query,
  });
}

export function useGetFeaturedProducts(opts: Opts<Product[]> = {}) {
  return useQuery<Product[]>({
    queryKey: getGetFeaturedProductsQueryKey() as any,
    queryFn: async () => {
      const all = await fetchAllProducts();
      const featured = all.filter(p => p.isFeatured);
      // If no featured, fall back to first N so the home page isn't blank
      return featured.length > 0 ? featured : all.slice(0, 9);
    },
    ...opts.query,
  });
}

export function useListCategories(opts: Opts<Category[]> = {}) {
  return useQuery<Category[]>({
    queryKey: getListCategoriesQueryKey() as any,
    queryFn: async () => {
      try {
        const all = await fetchAllProducts();
        const used = new Set(all.map(p => p.categoryName).filter(Boolean));
        // Combine known + any unknown ones used by products
        const merged: Category[] = [...KNOWN_CATEGORIES];
        used.forEach(c => {
          if (!merged.some(m => m.id === c)) merged.push({ id: c, name: c });
        });
        return merged;
      } catch {
        return KNOWN_CATEGORIES;
      }
    },
    ...opts.query,
  });
}

export function useGetProduct(id: string | number, opts: Opts<Product | null> = {}) {
  return useQuery<Product | null>({
    queryKey: getGetProductQueryKey(id) as any,
    queryFn: async () => {
      const r = await apiFetch<{ product: any }>(`/products/${id}`);
      return adaptProduct(r.product);
    },
    ...opts.query,
  });
}

export function useGetRelatedProducts(id: string | number, opts: Opts<Product[]> = {}) {
  return useQuery<Product[]>({
    queryKey: getGetRelatedProductsQueryKey(id) as any,
    queryFn: async () => {
      const all = await fetchAllProducts();
      const target = all.find(p => p.id === String(id));
      if (!target) return [];
      return all.filter(p => p.id !== target.id && p.categoryId === target.categoryId).slice(0, 8);
    },
    ...opts.query,
  });
}

// Reviews — backend has none, return empty
export function useListProductReviews(_id: string | number, opts: Opts<any[]> = {}) {
  return useQuery<any[]>({
    queryKey: getListProductReviewsQueryKey(_id) as any,
    queryFn: async () => [],
    ...opts.query,
  });
}

export function useCreateReview(opts: MOpts<any, { id: string | number; data: any }> = {}) {
  return useMutation({
    mutationFn: async () => {
      throw new Error("Reviews are not yet available");
    },
    ...opts.mutation,
  });
}

// ============================================================================
// Cart hooks
// ============================================================================

export function useGetCart(opts: Opts<Cart> = {}) {
  return useQuery<Cart>({
    queryKey: getGetCartQueryKey() as any,
    queryFn: async () => {
      const r = await apiFetch<{ cart: any }>(`/cart`);
      return adaptCart(r.cart);
    },
    ...opts.query,
  });
}

export function useAddToCart(opts: MOpts<any, { data: { productId: string | number; quantity: number } }> = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ data }) =>
      apiFetch(`/cart`, {
        method: "POST",
        body: JSON.stringify({ productId: String(data.productId), quantity: data.quantity }),
      }),
    onSuccess: (...a) => {
      qc.invalidateQueries({ queryKey: getGetCartQueryKey() as any });
      opts.mutation?.onSuccess?.(...a);
    },
    ...opts.mutation,
  });
}

export function useUpdateCartItem(opts: MOpts<any, { productId: string | number; data: { quantity: number } }> = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, data }) =>
      apiFetch(`/cart`, {
        method: "PUT",
        body: JSON.stringify({ productId: String(productId), quantity: data.quantity }),
      }),
    onSuccess: (...a) => {
      qc.invalidateQueries({ queryKey: getGetCartQueryKey() as any });
      opts.mutation?.onSuccess?.(...a);
    },
    ...opts.mutation,
  });
}

export function useRemoveFromCart(opts: MOpts<any, { productId: string | number }> = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId }) =>
      apiFetch(`/cart`, {
        method: "DELETE",
        body: JSON.stringify({ productId: String(productId) }),
      }),
    onSuccess: (...a) => {
      qc.invalidateQueries({ queryKey: getGetCartQueryKey() as any });
      opts.mutation?.onSuccess?.(...a);
    },
    ...opts.mutation,
  });
}

export function useClearCart(opts: MOpts<any, void> = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const cart = await apiFetch<{ cart: any }>(`/cart`);
      const items = cart?.cart?.items ?? [];
      for (const it of items) {
        const pid = typeof it.product === "object" ? it.product._id : it.product;
        await apiFetch(`/cart`, {
          method: "DELETE",
          body: JSON.stringify({ productId: String(pid) }),
        });
      }
      return { ok: true };
    },
    onSuccess: (...a) => {
      qc.invalidateQueries({ queryKey: getGetCartQueryKey() as any });
      opts.mutation?.onSuccess?.(...a);
    },
    ...opts.mutation,
  });
}

// ============================================================================
// Order hooks
// ============================================================================

function parseShippingForBackend(addr: string): any {
  // Frontend passes a multi-line string. Reconstruct backend-required fields.
  const lines = addr.split("\n").map(s => s.trim()).filter(Boolean);
  const fullName = lines[0] ?? "Customer";
  const phone = lines[1] ?? "0000000000";
  const address = lines[2] ?? lines[0] ?? "Address";
  let city = "City";
  let state = "State";
  let pincode = "000000";
  if (lines[3]) {
    const m = lines[3].match(/^(.*?),\s*(.*?)\s+(\d{4,8})$/);
    if (m) {
      city = m[1].trim() || city;
      state = m[2].trim() || state;
      pincode = m[3].trim() || pincode;
    } else {
      city = lines[3].trim() || city;
    }
  }
  return { fullName, phone, address, city, state, pincode, country: "India" };
}

export function useCreateOrder(opts: MOpts<Order, { data: { shippingAddress: string; paymentMethod: string; notes?: string } }> = {}) {
  return useMutation({
    mutationFn: async ({ data }) => {
      const ship = parseShippingForBackend(data.shippingAddress);
      const pm = data.paymentMethod === "online" ? "ONLINE" : "COD";

      if (pm === "ONLINE") {
        // Razorpay flow
        const ro = await apiFetch<{ razorpayOrder: any; totalPrice: number }>(
          `/order/razorpay-order`,
          { method: "POST" },
        );
        const razorpayKey =
          (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || "rzp_test_key";

        await loadRazorpayScript();

        const paymentResult: any = await new Promise((resolve, reject) => {
          const Razorpay = (window as any).Razorpay;
          if (!Razorpay) {
            reject(new Error("Razorpay SDK failed to load"));
            return;
          }
          const rzp = new Razorpay({
            key: razorpayKey,
            amount: ro.razorpayOrder.amount,
            currency: ro.razorpayOrder.currency,
            order_id: ro.razorpayOrder.id,
            name: "TechPulse",
            description: "Order payment",
            prefill: { name: ship.fullName, contact: ship.phone },
            theme: { color: "#0a0a0a" },
            handler: (response: any) => resolve(response),
            modal: {
              ondismiss: () => {
                const err: any = new Error("Payment cancelled");
                err.cancelled = true;
                reject(err);
              },
            },
          });
          rzp.open();
        });

        const verified = await apiFetch<{ order: any }>(`/order/verify-payment`, {
          method: "POST",
          body: JSON.stringify({
            razorpay_order_id: paymentResult.razorpay_order_id,
            razorpay_payment_id: paymentResult.razorpay_payment_id,
            razorpay_signature: paymentResult.razorpay_signature,
            shippingAddress: ship,
            paymentMethod: pm,
          }),
        });
        return adaptOrder(verified.order);
      }

      const r = await apiFetch<{ order: any }>(`/order`, {
        method: "POST",
        body: JSON.stringify({ shippingAddress: ship, paymentMethod: pm }),
      });
      return adaptOrder(r.order);
    },
    ...opts.mutation,
  });
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).Razorpay) return resolve();
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Razorpay"));
    document.body.appendChild(s);
  });
}

export function useListOrders(_params?: any, opts: Opts<Order[]> = {}) {
  return useQuery<Order[]>({
    queryKey: getListOrdersQueryKey() as any,
    queryFn: async () => {
      const r = await apiFetch<{ orders: any[] }>(`/order/my`);
      return (r.orders ?? []).map(adaptOrder).reverse();
    },
    ...opts.query,
  });
}

export function useGetOrder(id: string | number, opts: Opts<Order | null> = {}) {
  return useQuery<Order | null>({
    queryKey: getGetOrderQueryKey(id) as any,
    queryFn: async () => {
      const r = await apiFetch<{ orders: any[] }>(`/order/my`);
      const found = (r.orders ?? []).find((o: any) => String(o._id) === String(id));
      return found ? adaptOrder(found) : null;
    },
    ...opts.query,
  });
}

export function useCancelOrder(opts: MOpts<any, { id: string | number }> = {}) {
  return useMutation({
    mutationFn: async ({ id }) => {
      const r = await apiFetch<{ order: any }>(`/order/${id}/cancel`, { method: "POST" });
      return adaptOrder(r.order);
    },
    ...opts.mutation,
  });
}

// ============================================================================
// Profile / Wishlist (degraded — backend has neither)
// ============================================================================

export function useUpdateProfile(opts: MOpts<any, { data: any }> = {}) {
  return useMutation({
    mutationFn: async () => {
      throw new Error("Profile editing is not yet available");
    },
    ...opts.mutation,
  });
}

const WISHLIST_KEY = "tp_wishlist";

function readWishlist(): string[] {
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeWishlist(ids: string[]) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
}

export function useGetWishlist(opts: Opts<{ id: string; productId: string; product: Product }[]> = {}) {
  return useQuery({
    queryKey: getGetWishlistQueryKey() as any,
    queryFn: async () => {
      const ids = readWishlist();
      if (ids.length === 0) return [];
      const all = await fetchAllProducts();
      return ids
        .map(id => all.find(p => p.id === id))
        .filter(Boolean)
        .map(p => ({ id: p!.id, productId: p!.id, product: p! }));
    },
    ...opts.query,
  });
}

export function useAddToWishlist(opts: MOpts<any, { productId: string | number }> = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId }) => {
      const ids = readWishlist();
      const id = String(productId);
      if (!ids.includes(id)) writeWishlist([...ids, id]);
      return { ok: true };
    },
    onSuccess: (...a) => {
      qc.invalidateQueries({ queryKey: getGetWishlistQueryKey() as any });
      opts.mutation?.onSuccess?.(...a);
    },
    ...opts.mutation,
  });
}

export function useRemoveFromWishlist(opts: MOpts<any, { productId: string | number }> = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId }) => {
      const id = String(productId);
      writeWishlist(readWishlist().filter(x => x !== id));
      return { ok: true };
    },
    onSuccess: (...a) => {
      qc.invalidateQueries({ queryKey: getGetWishlistQueryKey() as any });
      opts.mutation?.onSuccess?.(...a);
    },
    ...opts.mutation,
  });
}

// ============================================================================
// Partner hooks
// ============================================================================

export function useGetPartnerProfile(opts: Opts<PartnerProfile | null> = {}) {
  return useQuery<PartnerProfile | null>({
    queryKey: getGetPartnerProfileQueryKey() as any,
    queryFn: async () => {
      const r = await apiFetch<{ partner: any }>(`/partner/me`);
      return adaptPartner(r.partner);
    },
    ...opts.query,
  });
}

export function useApplyAsPartner(opts: MOpts<any, { data: { businessName: string; businessEmail?: string; businessPhone?: string; businessAddress?: string; description?: string } }> = {}) {
  return useMutation({
    mutationFn: async ({ data }) =>
      apiFetch(`/partner/apply`, {
        method: "POST",
        body: JSON.stringify({
          businessName: data.businessName,
          phone: data.businessPhone || "",
          address: data.businessAddress || "",
        }),
      }),
    ...opts.mutation,
  });
}

export function useGetPartnerStats(opts: Opts<{ totalRevenue: number; totalProducts: number; totalOrders: number; pendingOrders: number }> = {}) {
  return useQuery({
    queryKey: getGetPartnerStatsQueryKey() as any,
    queryFn: async () => {
      try {
        const r = await apiFetch<{ products: any[] }>(`/products/my-products`);
        return {
          totalRevenue: 0,
          totalProducts: (r.products ?? []).length,
          totalOrders: 0,
          pendingOrders: 0,
        };
      } catch {
        return { totalRevenue: 0, totalProducts: 0, totalOrders: 0, pendingOrders: 0 };
      }
    },
    ...opts.query,
  });
}

export function useListPartnerProducts(opts: Opts<Product[]> = {}) {
  return useQuery<Product[]>({
    queryKey: getListPartnerProductsQueryKey() as any,
    queryFn: async () => {
      const r = await apiFetch<{ products: any[] }>(`/products/my-products`);
      return (r.products ?? []).map(adaptProduct);
    },
    ...opts.query,
  });
}

export function useListPartnerOrders(opts: Opts<Order[]> = {}) {
  return useQuery<Order[]>({
    queryKey: getListPartnerOrdersQueryKey() as any,
    queryFn: async () => [],
    ...opts.query,
  });
}

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category?: string;
  categoryId?: string | number;
  comparePrice?: number;
  inventory?: number;
  isFeatured?: boolean;
  isActive?: boolean;
  images?: string[];
  imageFile?: File | null;
}

async function buildProductFormData(data: ProductFormData): Promise<FormData> {
  const fd = new FormData();
  fd.append("name", data.name);
  fd.append("description", data.description);
  fd.append("price", String(data.price));
  fd.append("category", String(data.category ?? data.categoryId ?? "Gadgets"));
  if (data.isFeatured !== undefined) fd.append("isFeatured", String(data.isFeatured));

  if (data.imageFile) {
    fd.append("image", data.imageFile);
  } else if (data.images && data.images[0]) {
    // Try to fetch the URL and turn it into a File
    const url = data.images[0];
    try {
      const resp = await fetch(url);
      const blob = await resp.blob();
      const filename = url.split("/").pop()?.split("?")[0] || "image.jpg";
      fd.append("image", new File([blob], filename, { type: blob.type || "image/jpeg" }));
    } catch {
      throw new Error("Could not load image from URL. Please use the file upload field.");
    }
  }
  return fd;
}

export function useCreateProduct(opts: MOpts<any, { data: ProductFormData }> = {}) {
  return useMutation({
    mutationFn: async ({ data }) => {
      const fd = await buildProductFormData(data);
      return apiFetch(`/products`, { method: "POST", body: fd });
    },
    ...opts.mutation,
  });
}

export function useUpdateProduct(opts: MOpts<any, { id: string | number; data: ProductFormData }> = {}) {
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const fd = await buildProductFormData(data);
      return apiFetch(`/products/${id}`, { method: "PUT", body: fd });
    },
    ...opts.mutation,
  });
}

export function useDeleteProduct(opts: MOpts<any, { id: string | number }> = {}) {
  return useMutation({
    mutationFn: async ({ id }) => apiFetch(`/products/${id}`, { method: "DELETE" }),
    ...opts.mutation,
  });
}

// ============================================================================
// Admin hooks
// ============================================================================

export function useGetAdminAnalytics(opts: Opts<any> = {}) {
  return useQuery({
    queryKey: getGetAdminAnalyticsQueryKey() as any,
    queryFn: async () => {
      let products: any[] = [];
      let orders: any[] = [];
      try {
        const r = await apiFetch<{ products: any[] }>(`/products`);
        products = r.products ?? [];
      } catch { /* empty */ }
      try {
        const r = await apiFetch<{ orders: any[] }>(`/order`);
        orders = r.orders ?? [];
      } catch { /* empty */ }
      const totalRevenue = orders.reduce((s, o) => s + (Number(o.totalPrice) || 0), 0);
      return {
        totalRevenue,
        totalUsers: 0,
        totalProducts: products.length,
        totalOrders: orders.length,
        pendingPartners: 0,
      };
    },
    ...opts.query,
  });
}

export function useAdminListUsers(_params?: any, opts: Opts<any[]> = {}) {
  return useQuery({
    queryKey: getAdminListUsersQueryKey() as any,
    queryFn: async () => [],
    ...opts.query,
  });
}

export function useAdminUpdateUserRole(opts: MOpts<any, { id: string | number; data: any }> = {}) {
  return useMutation({
    mutationFn: async () => {
      throw new Error("User role management is not available");
    },
    ...opts.mutation,
  });
}

export function useAdminListPartners(opts: Opts<any[]> = {}) {
  return useQuery<any[]>({
    queryKey: getAdminListPartnersQueryKey() as any,
    queryFn: async () => {
      const r = await apiFetch<{ partners: any[] }>(`/partner`);
      return (r.partners ?? []).map((p: any) => {
        const status =
          p.status ||
          (p.isApproved ? "approved" : "pending");
        return {
          id: String(p._id),
          businessName: p.businessName,
          businessEmail: p.user?.email,
          businessPhone: p.phone,
          businessAddress: p.address,
          status,
          userName: p.user?.name,
          createdAt: p.createdAt,
        };
      });
    },
    ...opts.query,
  });
}

export function useAdminUpdatePartnerStatus(opts: MOpts<any, { id: string | number; data: { status: string } }> = {}) {
  return useMutation({
    mutationFn: async ({ id, data }) => {
      if (data.status === "approved") {
        return apiFetch(`/partner/approve/${id}`, { method: "PUT" });
      }
      if (data.status === "rejected") {
        return apiFetch(`/partner/reject/${id}`, { method: "PUT" });
      }
      throw new Error(`Unsupported status: ${data.status}`);
    },
    ...opts.mutation,
  });
}

export function useAdminListOrders(_params?: any, opts: Opts<Order[]> = {}) {
  return useQuery<Order[]>({
    queryKey: getAdminListOrdersQueryKey() as any,
    queryFn: async () => {
      const r = await apiFetch<{ orders: any[] }>(`/order`);
      return (r.orders ?? []).map(adaptOrder).reverse();
    },
    ...opts.query,
  });
}

export function useAdminUpdateOrderStatus(opts: MOpts<any, { id: string | number; data: { status: string } }> = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) =>
      apiFetch(`/order/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status: data.status }),
      }),
    onSuccess: (...a) => {
      qc.invalidateQueries({ queryKey: getAdminListOrdersQueryKey() as any });
      opts.mutation?.onSuccess?.(...a);
    },
    ...opts.mutation,
  });
}

export function useAdminListProducts(_params?: any, opts: Opts<Product[]> = {}) {
  return useQuery<Product[]>({
    queryKey: getAdminListProductsQueryKey() as any,
    queryFn: async () => {
      const all = await fetchAllProducts();
      return all;
    },
    ...opts.query,
  });
}
