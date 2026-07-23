import { useState } from "react";
import { useListMenus } from "@/api-client";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Loader2, Plus, Coffee, Utensils } from "lucide-react";

export default function Menu() {
  const [filter, setFilter] = useState<string | null>(null);
  
  // Use the generated hook to fetch menus. 
  // For simplicity, we just fetch all available menus and filter client-side, 
  // or we could pass `category: filter` to the params.
  const { data: menus, isLoading } = useListMenus({ available: true });
  const { addItem } = useCart();
  const { toast } = useToast();

  const filteredMenus = filter ? menus?.filter(m => m.category === filter) : menus;

  const handleAddToCart = (menu: any) => {
    addItem({
      menuId: menu.id,
      name: menu.name,
      price: menu.price,
      imageUrl: menu.imageUrl,
    });
    
    toast({
      title: "Berhasil ditambahkan",
      description: `${menu.name} masuk ke keranjang.`,
      duration: 2000,
    });
  };

  const getImageUrl = (url: string | null) => {
    if (!url) return "https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80";
    if (url.startsWith("http")) return url;
    return `/api/storage${url}`;
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Menu Pilihan</h1>
          <p className="text-muted-foreground">Pilih minuman dan makanan favoritmu.</p>
        </div>
        
        <div className="flex bg-orange-50/50 p-1 rounded-xl">
          <Button 
            variant={filter === null ? "default" : "ghost"} 
            className="rounded-lg"
            onClick={() => setFilter(null)}
          >
            Semua
          </Button>
          <Button 
            variant={filter === "Minuman" ? "default" : "ghost"} 
            className="rounded-lg gap-2"
            onClick={() => setFilter("Minuman")}
          >
            <Coffee className="w-4 h-4" /> Minuman
          </Button>
          <Button 
            variant={filter === "Makanan" ? "default" : "ghost"} 
            className="rounded-lg gap-2"
            onClick={() => setFilter("Makanan")}
          >
            <Utensils className="w-4 h-4" /> Makanan
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : !filteredMenus || filteredMenus.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl">
          <p className="text-muted-foreground">Belum ada menu yang tersedia.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMenus.map((menu, i) => (
            <motion.div
              key={menu.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
            >
              <Card className="h-full flex flex-col overflow-hidden border-transparent shadow-sm hover:shadow-xl hover:shadow-orange-900/5 hover:-translate-y-1 transition-all duration-300 bg-white">
                <div className="relative aspect-[4/3] bg-muted overflow-hidden group">
                  <img 
                    src={getImageUrl(menu.imageUrl ?? null)} 
                    alt={menu.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge variant="secondary" className="bg-white/90 backdrop-blur text-xs shadow-sm">
                      {menu.category}
                    </Badge>
                  </div>
                </div>
                <CardHeader className="p-5 pb-0 flex-1">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <CardTitle className="text-lg font-bold leading-tight">{menu.name}</CardTitle>
                    <span className="font-bold text-primary shrink-0">
                      Rp {menu.price.toLocaleString("id-ID")}
                    </span>
                  </div>
                  {menu.description && (
                    <CardDescription className="line-clamp-2 text-sm">
                      {menu.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardFooter className="p-5 pt-4">
                  <Button 
                    className="w-full rounded-full gap-2 font-semibold" 
                    onClick={() => handleAddToCart(menu)}
                  >
                    <Plus className="w-4 h-4" /> Tambah
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
