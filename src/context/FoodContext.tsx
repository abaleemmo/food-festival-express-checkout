import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';

export type DietaryTag = "Vegetarian" | "Vegan" | "Gluten-Free";
export type LineSide = "Left" | "Right";

export interface FoodItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  dietaryTags: DietaryTag[];
  lineSide: LineSide;
  created_at: string;
  updated_at: string;
}

export interface CartItem extends FoodItem {
  quantity: number;
}

interface FoodContextType {
  foodItems: FoodItem[];
  lineSide: LineSide;
  dietaryRestrictions: DietaryTag[];
  cart: CartItem[];
  setLineSide: (side: LineSide) => void;
  toggleDietaryRestriction: (restriction: DietaryTag) => void;
  addToCart: (item: FoodItem) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  setFoodItems: (items: FoodItem[]) => void;
  fetchFoodItems: () => Promise<void>;
}

const FoodContext = createContext<FoodContextType | undefined>(undefined);

export const FoodProvider = ({ children }: { children: ReactNode }) => {
  console.log("FoodProvider rendering"); // Diagnostic log
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [lineSide, setLineSide] = useState<LineSide>("Left");
  const [dietaryRestrictions, setDietaryRestrictions] = useState<DietaryTag[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  const fetchFoodItems = useCallback(async () => {
    const { data, error } = await supabase.from('food_items').select('*').order('created_at', { ascending: true });
    if (error) {
      showError('Error fetching food items: ' + error.message);
      setFoodItems([]);
    } else {
      setFoodItems(data as FoodItem[]);
    }
  }, []);

  useEffect(() => {
    fetchFoodItems();
  }, [fetchFoodItems]);

  const toggleDietaryRestriction = (restriction: DietaryTag) => {
    setDietaryRestrictions((prev) =>
      prev.includes(restriction)
        ? prev.filter((r) => r !== restriction)
        : [...prev, restriction]
    );
  };

  const addToCart = (item: FoodItem) => {
    setCart((prev) => {
      const existingItem = prev.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prev.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prev, { ...item, quantity: 1 }];
      }
    });
  };

  const updateCartQuantity = (itemId: string, quantity: number) => {
    setCart((prev) =>
      prev.map((cartItem) =>
        cartItem.id === itemId ? { ...cartItem, quantity: quantity } : cartItem
      ).filter(item => item.quantity > 0)
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((cartItem) => cartItem.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <FoodContext.Provider
      value={{
        foodItems,
        lineSide,
        dietaryRestrictions,
        cart,
        setLineSide,
        toggleDietaryRestriction,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        setFoodItems,
        fetchFoodItems,
      }}
    >
      {children}
    </FoodContext.Provider>
  );
};

export const useFood = () => {
  const context = useContext(FoodContext);
  console.log("useFood called, context:", context); // Diagnostic log
  if (context === undefined) {
    throw new Error('useFood must be used within a FoodProvider');
  }
  return context;
};