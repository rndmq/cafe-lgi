import { Link, useLocation } from "wouter";
import { Coffee, ShoppingBag, LayoutDashboard, Utensils, ClipboardList, LogOut } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [location, setLocation] = useLocation();
  const { items } = useCart();
  
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const isAdmin = location.startsWith("/admin");
  const isAuthenticated = !!localStorage.getItem("adminToken");

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setLocation("/admin/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-90 transition-opacity">
          <Coffee className="h-6 w-6" strokeWidth={2.5} />
          <span className="font-bold text-xl tracking-tight">Lubertu</span>
        </Link>

        {isAdmin ? (
          <nav className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/admin">
                  <Button variant={location === "/admin" ? "default" : "ghost"} size="sm" className="gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/admin/menus">
                  <Button variant={location.startsWith("/admin/menus") ? "default" : "ghost"} size="sm" className="gap-2">
                    <Utensils className="h-4 w-4" />
                    Menu
                  </Button>
                </Link>
                <Link href="/admin/orders">
                  <Button variant={location.startsWith("/admin/orders") ? "default" : "ghost"} size="sm" className="gap-2">
                    <ClipboardList className="h-4 w-4" />
                    Orders
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground gap-2">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : null}
          </nav>
        ) : (
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link href="/">
              <Button variant={location === "/" ? "secondary" : "ghost"} size="sm">
                Home
              </Button>
            </Link>
            <Link href="/menu">
              <Button variant={location === "/menu" ? "secondary" : "ghost"} size="sm">
                Menu
              </Button>
            </Link>
            <Link href="/cart">
              <Button variant="outline" size="sm" className="gap-2 rounded-full relative">
                <ShoppingBag className="h-4 w-4" />
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
