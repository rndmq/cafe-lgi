import { useState } from "react";
import { useLocation } from "wouter";
import { useCart } from "@/context/CartContext";
import { useCreateOrder } from "@/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CheckCircle2, Loader2, CreditCard, Wallet, Banknote } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export default function Checkout() {
  const { items, finalPrice, totalPrice, discountRate, voucherCode, clearCart } = useCart();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [success, setSuccess] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Transfer Bank");

  const createOrder = useCreateOrder();

  if (items.length === 0 && !success) {
    setLocation("/cart");
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !customerAddress) {
      toast({ title: "Error", description: "Lengkapi data pengiriman.", variant: "destructive" });
      return;
    }

    createOrder.mutate({
      data: {
        customerName,
        customerPhone,
        customerAddress,
        notes,
        paymentMethod,
        totalPrice,
        finalPrice,
        discountRate,
        voucherCode: voucherCode || undefined,
        items: JSON.stringify(items.map(i => ({ id: i.menuId, name: i.name, qty: i.quantity, price: i.price }))),
      }
    }, {
      onSuccess: () => {
        setSuccess(true);
        clearCart();
        window.scrollTo(0, 0);
      },
      onError: () => {
        toast({ title: "Gagal", description: "Terjadi kesalahan saat memproses pesanan.", variant: "destructive" });
      }
    });
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center text-center max-w-lg">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Pesanan Berhasil!</h1>
        <p className="text-muted-foreground mb-8 text-lg">
          Terima kasih, <b>{customerName}</b>. Pesanan Anda sedang kami siapkan dan akan segera dikirim.
        </p>
        <Button size="lg" className="rounded-full w-full" onClick={() => setLocation("/")}>
          Kembali ke Beranda
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
      <Button variant="ghost" className="mb-6 gap-2" onClick={() => setLocation("/cart")}>
        <ArrowLeft className="w-4 h-4" /> Kembali
      </Button>

      <h1 className="text-3xl font-bold tracking-tight mb-8">Pembayaran</h1>

      <div className="grid lg:grid-cols-2 gap-10">
        <form onSubmit={handleSubmit} className="space-y-8">
          <Card>
            <CardContent className="p-6 space-y-6">
              <h2 className="font-bold text-xl border-b pb-4">Data Pengiriman</h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nama Lengkap</Label>
                  <Input 
                    placeholder="Budi Santoso" 
                    value={customerName} 
                    onChange={e => setCustomerName(e.target.value)} 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Nomor WhatsApp</Label>
                  <Input 
                    type="tel" 
                    placeholder="08123456789" 
                    value={customerPhone} 
                    onChange={e => setCustomerPhone(e.target.value)} 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Alamat Lengkap</Label>
                  <Textarea 
                    placeholder="Jl. Sudirman No. 123, RT 01/RW 02..." 
                    value={customerAddress} 
                    onChange={e => setCustomerAddress(e.target.value)} 
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label>Catatan (Opsional)</Label>
                  <Input 
                    placeholder="Kopi kurang manis, es sedikit..." 
                    value={notes} 
                    onChange={e => setNotes(e.target.value)} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-6">
              <h2 className="font-bold text-xl border-b pb-4">Metode Pembayaran</h2>
              
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih pembayaran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Transfer Bank">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-primary" /> Transfer Bank
                    </div>
                  </SelectItem>
                  <SelectItem value="Dompet Digital">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-primary" /> Dompet Digital (QRIS, OVO, GoPay)
                    </div>
                  </SelectItem>
                  <SelectItem value="COD">
                    <div className="flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-primary" /> Cash on Delivery (COD)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Button 
            type="submit" 
            size="lg" 
            className="w-full rounded-full text-lg h-14"
            disabled={createOrder.isPending}
          >
            {createOrder.isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            Bayar Rp {finalPrice.toLocaleString("id-ID")}
          </Button>
        </form>

        <div>
          <Card className="bg-orange-50/50 border-orange-100 sticky top-24">
            <CardContent className="p-6">
              <h2 className="font-bold text-xl mb-6 border-b border-orange-200 pb-4">Pesanan Anda</h2>
              
              <div className="space-y-4 mb-6">
                {items.map(item => (
                  <div key={item.menuId} className="flex justify-between text-sm">
                    <div className="flex gap-2">
                      <span className="font-medium">{item.quantity}x</span>
                      <span>{item.name}</span>
                    </div>
                    <span>Rp {(item.price * item.quantity).toLocaleString("id-ID")}</span>
                  </div>
                ))}
              </div>
              
              <Separator className="my-4 bg-orange-200" />
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>Rp {totalPrice.toLocaleString("id-ID")}</span>
                </div>
                {discountRate > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Diskon ({discountRate}%)</span>
                    <span>- Rp {(totalPrice * discountRate / 100).toLocaleString("id-ID")}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-orange-200 mt-2">
                  <span>Total Tagihan</span>
                  <span className="text-primary">Rp {finalPrice.toLocaleString("id-ID")}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
