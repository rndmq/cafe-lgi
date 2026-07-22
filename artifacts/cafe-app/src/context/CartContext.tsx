import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type CartItem = {
  menuId: number;
  name: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (menuId: number) => void;
  updateQty: (menuId: number, quantity: number) => void;
  clearCart: () => void;
  totalPrice: number;
  voucherCode: string | null;
  setVoucherCode: (code: string | null) => void;
  discountRate: number;
  finalPrice: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem("cafe_cart");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [voucherCode, setVoucherCode] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem("cafe_cart", JSON.stringify(items));
  }, [items]);

  const addItem = (newItem: Omit<CartItem, 'quantity'>) => {
    setItems(current => {
      const existing = current.find(i => i.menuId === newItem.menuId);
      if (existing) {
        return current.map(i =>
          i.menuId === newItem.menuId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...current, { ...newItem, quantity: 1 }];
    });
  };

  const removeItem = (menuId: number) => {
    setItems(current => current.filter(i => i.menuId !== menuId));
  };

  const updateQty = (menuId: number, quantity: number) => {
    if (quantity < 1) {
      removeItem(menuId);
      return;
    }
    setItems(current =>
      current.map(i => (i.menuId === menuId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    setVoucherCode(null);
  };

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  let discountRate = 0;
  if (voucherCode === "HEMAT10") discountRate = 10;
  if (voucherCode === "HEMAT20") discountRate = 20;

  const finalPrice = Math.round(totalPrice * (1 - discountRate / 100));

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        totalPrice,
        voucherCode,
        setVoucherCode,
        discountRate,
        finalPrice
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
