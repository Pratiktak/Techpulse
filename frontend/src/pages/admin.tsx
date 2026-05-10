import { useState } from "react";
import {
  useGetAdminAnalytics, getGetAdminAnalyticsQueryKey,
  useAdminListUsers, getAdminListUsersQueryKey,
  useAdminUpdateUserRole,
  useAdminListPartners, getAdminListPartnersQueryKey,
  useAdminUpdatePartnerStatus,
  useAdminListOrders, getAdminListOrdersQueryKey,
  useAdminUpdateOrderStatus,
  useAdminListProducts, getAdminListProductsQueryKey,
  useDeleteProduct,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { CurrencyAmount } from "@/components/ui/CurrencyAmount";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { IndianRupee, Users, Package, ShoppingBag, UserCheck, Trash2 } from "lucide-react";

export default function Admin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: analytics, isLoading: loadingAnalytics } = useGetAdminAnalytics({
    query: { queryKey: getGetAdminAnalyticsQueryKey() }
  });

  const statCards = [
    { label: "Total Revenue", value: <CurrencyAmount amount={analytics?.totalRevenue || 0} />, icon: IndianRupee },
    { label: "Users", value: analytics?.totalUsers || 0, icon: Users },
    { label: "Products", value: analytics?.totalProducts || 0, icon: Package },
    { label: "Orders", value: analytics?.totalOrders || 0, icon: ShoppingBag },
    { label: "Pending Partners", value: analytics?.pendingPartners || 0, icon: UserCheck },
  ];

  return (
    <div className="container mx-auto px-4 py-10">
      <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2">— Admin</p>
      <h1 className="font-serif text-4xl lg:text-5xl font-light tracking-tight mb-2">Dashboard <span className="italic">overview.</span></h1>
      <p className="text-muted-foreground mb-8">Manage users, products, orders, and partners.</p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {loadingAnalytics ? (
          Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
        ) : (
          statCards.map(({ label, value, icon: Icon }) => (
            <div key={label} className="border rounded-xl bg-card p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{label}</p>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="font-serif text-3xl font-medium mt-2">{value}</p>
            </div>
          ))
        )}
      </div>

      <Tabs defaultValue="partners">
        <TabsList className="mb-6">
          <TabsTrigger value="partners">Partner Applications</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>

        <TabsContent value="orders"><OrdersTab /></TabsContent>
        <TabsContent value="users"><UsersTab /></TabsContent>
        <TabsContent value="partners"><PartnersTab /></TabsContent>
        <TabsContent value="products"><ProductsTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function OrdersTab() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: orders, isLoading } = useAdminListOrders(undefined, { query: { queryKey: getAdminListOrdersQueryKey() } });

  const updateStatus = useAdminUpdateOrderStatus({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListOrdersQueryKey() });
        toast({ title: "Order updated" });
      },
      onError: (e) => toast({ title: "Failed", description: e.message, variant: "destructive" })
    }
  });

  const list: any[] = Array.isArray(orders) ? orders : ((orders as any)?.orders || []);

  return (
    <div className="border rounded-xl bg-card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left">
          <tr>
            <th className="p-3">ID</th>
            <th className="p-3">User</th>
            <th className="p-3">Total</th>
            <th className="p-3">Payment</th>
            <th className="p-3">Date</th>
            <th className="p-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
          ) : list.length === 0 ? (
            <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No orders.</td></tr>
          ) : (
            list.map((o) => (
              <tr key={o.id} className="border-t">
                <td className="p-3 font-medium">#{o.id}</td>
                <td className="p-3">User #{o.userId}</td>
                <td className="p-3"><CurrencyAmount amount={o.total} /></td>
                <td className="p-3 capitalize">{o.paymentMethod} • {o.paymentStatus}</td>
                <td className="p-3">{new Date(o.createdAt).toLocaleDateString()}</td>
                <td className="p-3">
                  <Select value={o.status} onValueChange={(v) => updateStatus.mutate({ id: o.id, data: { status: v } })}>
                    <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["pending", "processing", "shipped", "delivered", "cancelled"].map((s) =>
                        <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function UsersTab() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data, isLoading } = useAdminListUsers(undefined, { query: { queryKey: getAdminListUsersQueryKey() } });

  const updateRole = useAdminUpdateUserRole({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListUsersQueryKey() });
        toast({ title: "Role updated" });
      },
      onError: (e) => toast({ title: "Failed", description: e.message, variant: "destructive" })
    }
  });

  const list: any[] = Array.isArray(data) ? data : ((data as any)?.users || []);

  return (
    <div className="border rounded-xl bg-card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left">
          <tr>
            <th className="p-3">Name</th>
            <th className="p-3">Email</th>
            <th className="p-3">Joined</th>
            <th className="p-3">Role</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
          ) : list.length === 0 ? (
            <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No users.</td></tr>
          ) : (
            list.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-3 font-medium">{u.name}</td>
                <td className="p-3 text-muted-foreground">{u.email}</td>
                <td className="p-3">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="p-3">
                  <Select value={u.role} onValueChange={(v) => updateRole.mutate({ id: u.id, data: { role: v } })}>
                    <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="partner">Partner</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function PartnersTab() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data, isLoading } = useAdminListPartners({ query: { queryKey: getAdminListPartnersQueryKey() } });

  const updateStatus = useAdminUpdatePartnerStatus({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListPartnersQueryKey() });
        toast({ title: "Partner status updated" });
      },
      onError: (e) => toast({ title: "Failed", description: e.message, variant: "destructive" })
    }
  });

  return (
    <div className="border rounded-xl bg-card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left">
          <tr>
            <th className="p-3">Business</th>
            <th className="p-3">Email</th>
            <th className="p-3">Phone</th>
            <th className="p-3">Status</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
          ) : !data || data.length === 0 ? (
            <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No partners.</td></tr>
          ) : (
            data.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3 font-medium">{p.businessName}</td>
                <td className="p-3 text-muted-foreground">{p.businessEmail || "—"}</td>
                <td className="p-3">{p.businessPhone || "—"}</td>
                <td className="p-3">
                  <Badge variant={p.status === "approved" ? "default" : p.status === "rejected" ? "destructive" : "secondary"} className="capitalize">
                    {p.status}
                  </Badge>
                </td>
                <td className="p-3 text-right">
                  {p.status === "pending" && (
                    <div className="flex justify-end gap-2">
                      <Button size="sm" onClick={() => updateStatus.mutate({ id: p.id, data: { status: "approved" } })}>Approve</Button>
                      <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: p.id, data: { status: "rejected" } })}>Reject</Button>
                    </div>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function ProductsTab() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data, isLoading } = useAdminListProducts(undefined, { query: { queryKey: getAdminListProductsQueryKey() } });

  const deleteProduct = useDeleteProduct({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListProductsQueryKey() });
        toast({ title: "Product deleted" });
      },
      onError: (e) => toast({ title: "Failed", description: e.message, variant: "destructive" })
    }
  });

  const list: any[] = Array.isArray(data) ? data : ((data as any)?.products || []);

  return (
    <div className="border rounded-xl bg-card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left">
          <tr>
            <th className="p-3">Product</th>
            <th className="p-3">Category</th>
            <th className="p-3">Price</th>
            <th className="p-3">Stock</th>
            <th className="p-3">Status</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
          ) : list.length === 0 ? (
            <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No products.</td></tr>
          ) : (
            list.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <img src={p.images?.[0] || "https://placehold.co/40x40/png"} alt="" className="w-10 h-10 rounded border object-cover" />
                    <span className="font-medium">{p.name}</span>
                  </div>
                </td>
                <td className="p-3">{p.categoryName}</td>
                <td className="p-3"><CurrencyAmount amount={p.price} /></td>
                <td className="p-3">{p.inventory}</td>
                <td className="p-3">
                  <Badge variant={p.isActive ? "default" : "secondary"}>{p.isActive ? "Active" : "Inactive"}</Badge>
                </td>
                <td className="p-3 text-right">
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteProduct.mutate({ id: p.id })}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
