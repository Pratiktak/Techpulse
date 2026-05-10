import { useState } from "react";
import {
  useApplyAsPartner,
  useGetPartnerProfile, getGetPartnerProfileQueryKey,
  useGetPartnerStats, getGetPartnerStatsQueryKey,
  useListPartnerProducts, getListPartnerProductsQueryKey,
  useListPartnerOrders, getListPartnerOrdersQueryKey,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useListCategories, getListCategoriesQueryKey,
  type Product,
} from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { CurrencyAmount } from "@/components/ui/CurrencyAmount";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, Package, ShoppingBag, IndianRupee, Clock } from "lucide-react";

interface ProductFormState {
  name: string;
  description: string;
  price: string;
  comparePrice: string;
  categoryId: string;
  images: string;
  inventory: string;
  isFeatured: boolean;
  isActive: boolean;
  imageFile: File | null;
}

const emptyForm: ProductFormState = {
  name: "", description: "", price: "", comparePrice: "",
  categoryId: "", images: "", inventory: "0", isFeatured: false, isActive: true,
  imageFile: null,
};

export default function Partner() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: profile, isLoading: loadingProfile } = useGetPartnerProfile({
    query: { queryKey: getGetPartnerProfileQueryKey(), retry: false }
  });

  // Apply form
  const [businessName, setBusinessName] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [description, setDescription] = useState("");

  const apply = useApplyAsPartner({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetPartnerProfileQueryKey() });
        toast({ title: "Application submitted", description: "We'll review it shortly." });
      },
      onError: (e) => toast({ title: "Failed", description: e.message, variant: "destructive" })
    }
  });

  // No partner profile → show apply form
  if (loadingProfile) {
    return <div className="container mx-auto px-4 py-10"><Skeleton className="h-96 rounded-xl" /></div>;
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2">— Sell with us</p>
        <h1 className="font-serif text-4xl lg:text-5xl font-light tracking-tight mb-2">Become a <span className="italic">partner.</span></h1>
        <p className="text-muted-foreground mb-8">Sell your tech products to thousands of customers on TechPulse.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            apply.mutate({ data: { businessName, businessEmail, businessPhone, businessAddress, description } });
          }}
          className="border rounded-xl bg-card p-6 space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="bn">Business Name *</Label>
            <Input id="bn" required value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="be">Business Email</Label>
              <Input id="be" type="email" value={businessEmail} onChange={(e) => setBusinessEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bp">Business Phone</Label>
              <Input id="bp" value={businessPhone} onChange={(e) => setBusinessPhone(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ba">Business Address</Label>
            <Input id="ba" value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bd">About your business</Label>
            <Textarea id="bd" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
          </div>
          <Button type="submit" disabled={apply.isPending}>
            {apply.isPending ? "Submitting..." : "Submit Application"}
          </Button>
        </form>
      </div>
    );
  }

  if (profile.status === "pending") {
    return (
      <div className="container mx-auto px-4 py-20 max-w-xl text-center">
        <Clock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="font-serif text-3xl font-light mb-2">Application <span className="italic">pending.</span></h2>
        <p className="text-muted-foreground">
          Your partner application is being reviewed. We'll notify you once it's approved.
        </p>
      </div>
    );
  }

  if (profile.status === "rejected") {
    return (
      <div className="container mx-auto px-4 py-20 max-w-xl text-center">
        <h2 className="font-serif text-3xl font-light mb-2">Application <span className="italic">rejected.</span></h2>
        <p className="text-muted-foreground">Please contact support for more information.</p>
      </div>
    );
  }

  return <PartnerDashboard businessName={profile.businessName} />;
}

function PartnerDashboard({ businessName }: { businessName: string }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: stats } = useGetPartnerStats({ query: { queryKey: getGetPartnerStatsQueryKey() } });
  const { data: products, isLoading: loadingProducts } = useListPartnerProducts({ query: { queryKey: getListPartnerProductsQueryKey() } });
  const { data: orders } = useListPartnerOrders({ query: { queryKey: getListPartnerOrdersQueryKey() } });
  const { data: categories } = useListCategories({ query: { queryKey: getListCategoriesQueryKey() } });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormState>(emptyForm);

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      comparePrice: p.comparePrice ? String(p.comparePrice) : "",
      categoryId: String(p.categoryId),
      images: p.images.join("\n"),
      inventory: String(p.inventory),
      isFeatured: p.isFeatured,
      isActive: p.isActive,
      imageFile: null,
    });
    setDialogOpen(true);
  };

  const refreshProducts = () => {
    queryClient.invalidateQueries({ queryKey: getListPartnerProductsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetPartnerStatsQueryKey() });
  };

  const createMut = useCreateProduct({
    mutation: {
      onSuccess: () => {
        refreshProducts();
        setDialogOpen(false);
        toast({ title: "Product created" });
      },
      onError: (e) => toast({ title: "Failed", description: e.message, variant: "destructive" })
    }
  });

  const updateMut = useUpdateProduct({
    mutation: {
      onSuccess: () => {
        refreshProducts();
        setDialogOpen(false);
        toast({ title: "Product updated" });
      },
      onError: (e) => toast({ title: "Failed", description: e.message, variant: "destructive" })
    }
  });

  const deleteMut = useDeleteProduct({
    mutation: {
      onSuccess: () => { refreshProducts(); toast({ title: "Product deleted" }); },
      onError: (e) => toast({ title: "Failed", description: e.message, variant: "destructive" })
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      comparePrice: form.comparePrice ? Number(form.comparePrice) : undefined,
      categoryId: form.categoryId,
      category: form.categoryId,
      images: form.images.split("\n").map(s => s.trim()).filter(Boolean),
      inventory: Number(form.inventory),
      isFeatured: form.isFeatured,
      isActive: form.isActive,
      imageFile: form.imageFile,
    };
    if (editing) {
      updateMut.mutate({ id: editing.id, data });
    } else {
      createMut.mutate({ data });
    }
  };

  const statCards = [
    { label: "Total Revenue", value: <CurrencyAmount amount={stats?.totalRevenue || 0} />, icon: IndianRupee },
    { label: "Total Products", value: stats?.totalProducts || 0, icon: Package },
    { label: "Total Orders", value: stats?.totalOrders || 0, icon: ShoppingBag },
    { label: "Pending Orders", value: stats?.pendingOrders || 0, icon: Clock },
  ];

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-8">
        <div>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-1">— Partner dashboard</p>
            <h1 className="font-serif text-4xl lg:text-5xl font-light tracking-tight">{businessName}</h1>
          </div>
          <p className="text-muted-foreground mt-1">Partner Dashboard</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="border rounded-xl bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{label}</p>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="font-serif text-3xl font-medium mt-2">{value}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="products">
        <TabsList className="mb-6">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-semibold">Your Products</h2>
            <Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" /> Add Product</Button>
          </div>

          <div className="border rounded-xl bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="p-3">Product</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingProducts ? (
                  <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
                ) : !products || products.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No products yet. Click "Add Product" to get started.</td></tr>
                ) : (
                  products.map((p) => (
                    <tr key={p.id} className="border-t">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <img src={p.images[0] || "https://placehold.co/40x40/png"} alt="" className="w-10 h-10 rounded border object-cover" />
                          <div>
                            <p className="font-medium">{p.name}</p>
                            <p className="text-xs text-muted-foreground">{p.categoryName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3"><CurrencyAmount amount={p.price} /></td>
                      <td className="p-3">{p.inventory}</td>
                      <td className="p-3">
                        <Badge variant={p.isActive ? "default" : "secondary"}>
                          {p.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" onClick={() => openEdit(p)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="ghost" className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete this product?</AlertDialogTitle>
                                <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteMut.mutate({ id: p.id })}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="orders">
          <div className="border rounded-xl bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="p-3">Order</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {!orders || orders.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No orders yet.</td></tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o.id} className="border-t">
                      <td className="p-3 font-medium">#{o.id}</td>
                      <td className="p-3">{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td className="p-3"><CurrencyAmount amount={o.total} /></td>
                      <td className="p-3"><Badge variant="secondary" className="capitalize">{o.status}</Badge></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Product Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price (₹) *</Label>
                <Input type="number" min="0" step="0.01" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Compare Price (₹)</Label>
                <Input type="number" min="0" step="0.01" value={form.comparePrice} onChange={(e) => setForm({ ...form, comparePrice: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Inventory *</Label>
                <Input type="number" min="0" required value={form.inventory} onChange={(e) => setForm({ ...form, inventory: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {categories?.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Product image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setForm({ ...form, imageFile: e.target.files?.[0] ?? null })}
              />
              <p className="text-xs text-muted-foreground">Or paste an image URL below (file takes priority)</p>
              <Textarea
                rows={2}
                placeholder="https://..."
                value={form.images}
                onChange={(e) => setForm({ ...form, images: e.target.value })}
              />
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
                Featured
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                Active
              </label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>
                {editing ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
