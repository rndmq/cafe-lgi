import { Link, useLocation } from "wouter";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, Tag } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Cart() {
  const { items, updateQty, removeItem, totalPrice, discountRate, finalPrice, voucherCode, setVoucherCode } = useCart();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [voucherInput, setVoucherInput] = useState(voucherCode || "");

  const getImageUrl = (url: string | null) => {
    if (!url) return "https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80";
    if (url.startsWith("http")) return url;
    return `/api/storage${url}`;
  };

  const applyVoucher = () => {
    const code = voucherInput.trim().toUpperCase();
    if (!code) {
      setVoucherCode(null);
      return;
    }
    
    if (code === "HEMAT10" || code === "HEMAT20") {
      setVoucherCode(code);
      toast({
        title: "Voucher Berhasil",
        description: `Diskon ${code === "HEMAT20" ? "20%" : "10%"} telah diaplikasikan.`,
      });
    } else {
      toast({
        title: "Voucher tidak valid",
        description: "Kode voucher tidak ditemukan.",
        variant: "destructive"
      });
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-6 text-primary">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Keranjang Kosong</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          Kamu belum memilih minuman atau makanan. Yuk jelajahi menu kami dan temukan rasa favoritmu!
        </p>
        <Link href="/menu">
          <Button size="lg" className="rounded-full">Mulai Pesan</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Keranjang Pesanan</h1>
      
      <div className="grid lg:grid-cols-3 gap-10">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.menuId} className="overflow-hidden bg-white">
              <CardContent className="p-0 flex items-center">
                <img 
                  src={getImageUrl(item.imageUrl)} 
                  alt={item.name}
                  className="w-28 h-28 object-cover shrink-0"
                />
                <div className="p-4 flex-1 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="font-bold text-lg leading-tight mb-1">{item.name}</h3>
                    <p className="text-primary font-semibold">Rp {item.price.toLocaleString("id-ID")}</p>
                  </div>
                  
                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    <div className="flex items-center bg-gray-50 rounded-full border p-1">
                      <button 
                        onClick={() => updateQty(item.menuId, item.quantity - 1)}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white hover:shadow-sm transition-all"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button 
                        onClick={() => updateQty(item.menuId, item.quantity + 1)}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white hover:shadow-sm transition-all text-primary"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeItem(item.menuId)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-24 bg-orange-50/30 border-orange-100">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-6">Ringkasan Pesanan</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Kode Promo (HEMAT10)" 
                      value={voucherInput}
                      onChange={(e) => setVoucherInput(e.target.value)}
                      className="pl-9 bg-white"
                    />
                  </div>
                  <Button variant="secondary" onClick={applyVoucher}>Pakai</Button>
                </div>
                {voucherCode && (
                  <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                    Kode {voucherCode} aktif! Diskon {discountRate}%
                  </p>
                )}
              </div>

              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">Rp {totalPrice.toLocaleString("id-ID")}</span>
                </div>
                {discountRate > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Diskon ({discountRate}%)</span>
                    <span>- Rp {(totalPrice * discountRate / 100).toLocaleString("id-ID")}</span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">Rp {finalPrice.toLocaleString("id-ID")}</span>
                </div>
              </div>

              <Button 
                size="lg" 
                className="w-full rounded-full gap-2 text-base"
                onClick={() => setLocation("/checkout")}
              >
                Lanjut Pembayaran <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
