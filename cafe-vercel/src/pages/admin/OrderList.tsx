import { useLocation } from "wouter";
import { useEffect } from "react";
import { useListOrders } from "@/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function OrderList() {
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    if (!localStorage.getItem("adminToken")) setLocation("/admin/login");
  }, [setLocation]);

  const { data: orders, isLoading } = useListOrders();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Riwayat Pesanan</h1>
        <p className="text-muted-foreground">Lihat daftar pesanan pelanggan</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Tanggal</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>Item Pesanan</TableHead>
                  <TableHead>Metode</TableHead>
                  <TableHead className="text-right">Total Tagihan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders?.map(order => {
                  let items = [];
                  try {
                    items = JSON.parse(order.items);
                  } catch (e) {}

                  return (
                    <TableRow key={order.id}>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(order.createdAt), "dd MMM yyyy HH:mm")}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{order.customerName}</div>
                        <div className="text-xs text-muted-foreground">{order.customerPhone}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm max-w-[250px]">
                          {items.map((it: any, i: number) => (
                            <span key={i} className="inline-block mr-2">
                              {it.qty}x {it.name}{i < items.length-1 ? "," : ""}
                            </span>
                          ))}
                        </div>
                        {order.notes && (
                          <div className="text-xs text-orange-600 mt-1">Catatan: {order.notes}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{order.paymentMethod}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-bold text-primary">
                          Rp {order.finalPrice.toLocaleString("id-ID")}
                        </div>
                        {order.discountRate > 0 && (
                          <div className="text-xs text-green-600">Diskon {order.discountRate}%</div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {orders?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                      Belum ada pesanan masuk.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
