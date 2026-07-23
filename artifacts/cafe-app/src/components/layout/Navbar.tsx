import { Link, useLocation } from "wouter";
import { Coffee, ShoppingBag, LayoutDashboard, Utensils, ClipboardList, LogOut } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { CreditsEasterEgg, useCreditsEasterEgg } from "@/components/layout/CreditsEasterEgg";

export function Navbar() {
  const [location, setLocation] = useLocation();
  const { items } = useCart();
  
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const isAdmin = location.startsWith("/admin");
  const isAuthenticated = !!localStorage.getItem("adminToken");
  const { open: creditsOpen, setOpen: setCreditsOpen, registerClick } = useCreditsEasterEgg();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setLocation("/admin/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href="/"
          onClick={registerClick}
          className="flex items-center gap-2 text-primary hover:opacity-90 transition-opacity shrink-0 select-none"
        >
          <Coffee className="h-6 w-6" strokeWidth={2.5} />
          <span className="font-bold text-lg sm:text-xl tracking-tight">Lubertu</span>
        </Link>
        <CreditsEasterEgg open={creditsOpen} onClose={() => setCreditsOpen(false)} />

        {isAdmin ? (
          <nav className="flex items-center gap-1 sm:gap-4 overflow-x-auto">
            {isAuthenticated ? (
              <>
                <Link href="/admin">
                  <Button variant={location === "/admin" ? "default" : "ghost"} size="sm" className="gap-2 px-2 sm:px-3">
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Button>
                </Link>
                <Link href="/admin/menus">
                  <Button variant={location.startsWith("/admin/menus") ? "default" : "ghost"} size="sm" className="gap-2 px-2 sm:px-3">
                    <Utensils className="h-4 w-4" />
                    <span className="hidden sm:inline">Menu</span>
                  </Button>
                </Link>
                <Link href="/admin/orders">
                  <Button variant={location.startsWith("/admin/orders") ? "default" : "ghost"} size="sm" className="gap-2 px-2 sm:px-3">
                    <ClipboardList className="h-4 w-4" />
                    <span className="hidden sm:inline">Orders</span>
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground gap-2 px-2 sm:px-3">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
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
