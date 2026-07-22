import { useLocation } from "wouter";
import { useEffect } from "react";
import { useGetMenuSummary, useGetOrderRevenue } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, DollarSign, ShoppingBag, Percent, TrendingUp, Coffee, Utensils } from "lucide-react";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    if (!localStorage.getItem("adminToken")) {
      setLocation("/admin/login");
    }
  }, [setLocation]);

  const { data: revenue, isLoading: revLoading } = useGetOrderRevenue();
  const { data: menuSummary, isLoading: menuLoading } = useGetMenuSummary();

  if (revLoading || menuLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 tracking-tight">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pendapatan</CardTitle>
            <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              Rp {revenue?.totalRevenue.toLocaleString("id-ID") || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pesanan</CardTitle>
            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {revenue?.totalOrders || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Diskon</CardTitle>
            <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              Rp {revenue?.totalDiscount.toLocaleString("id-ID") || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pesanan dgn Voucher</CardTitle>
            <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {revenue?.ordersWithVoucher || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mb-6 tracking-tight">Katalog Menu</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <Utensils className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-xl">{menuSummary?.total || 0}</CardTitle>
              <p className="text-sm text-muted-foreground">Total Item Menu</p>
            </div>
          </CardHeader>
        </Card>
        
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 text-gray-600 rounded-xl flex items-center justify-center">
              <Coffee className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-xl">{menuSummary?.byCategory.Minuman || 0}</CardTitle>
              <p className="text-sm text-muted-foreground">Item Minuman</p>
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 text-gray-600 rounded-xl flex items-center justify-center">
              <Utensils className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-xl">{menuSummary?.byCategory.Makanan || 0}</CardTitle>
              <p className="text-sm text-muted-foreground">Item Makanan</p>
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
