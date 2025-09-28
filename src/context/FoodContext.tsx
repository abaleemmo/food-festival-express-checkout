import React, { createContext, useState, useContext, ReactNode } from 'react';

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
}

export interface CartItem extends FoodItem {
  quantity: number;
}

interface FoodContextType {
  foodItems: FoodItem[];
  lineSide: LineSide | null;
  dietaryRestrictions: DietaryTag[];
  cart: CartItem[];
  setLineSide: (side: LineSide) => void;
  toggleDietaryRestriction: (restriction: DietaryTag) => void;
  addToCart: (item: FoodItem) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  setFoodItems: (items: FoodItem[]) => void; // For admin panel
}

const FoodContext = createContext<FoodContextType | undefined>(undefined);

const initialFoodItems: FoodItem[] = [
  {
    id: "1",
    name: "Spicy Tofu Stir-fry",
    price: 12.50,
    description: "Wok-fried tofu with fresh vegetables in a spicy Szechuan sauce. (Contains soy)",
    image: "/placeholder.svg",
    dietaryTags: ["Vegetarian", "Vegan"],
    lineSide: "Left",
  },
  {
    id: "2",
    name: "Chicken Tikka Masala",
    price: 15.00,
    description: "Creamy tomato-based curry with tender chicken pieces, served with basmati rice. (Contains dairy)",
    image: "/placeholder.svg",
    dietaryTags: ["Gluten-Free"],
    lineSide: "Left",
  },
  {
    id: "3",
    name: "Lentil Soup",
    price: 8.00,
    description: "Hearty and flavorful lentil soup, seasoned with traditional herbs and spices. (Naturally gluten-free)",
    image: "/placeholder.svg",
    dietaryTags: ["Vegetarian", "Vegan", "Gluten-Free"],
    lineSide: "Left",
  },
  {
    id: "4",
    name: "Beef Bulgogi Bowl",
    price: 16.00,
    description: "Marinated grilled beef with rice, kimchi, and fresh vegetables. (Contains soy, sesame)",
    image: "/placeholder.svg",
    dietaryTags: [],
    lineSide: "Left",
  },
  {
    id: "5",
    name: "Vegetable Spring Rolls",
    price: 7.50,
    description: "Crispy fried spring rolls filled with mixed vegetables, served with sweet chili sauce. (Contains gluten)",
    image: "/placeholder.svg",
    dietaryTags: ["Vegetarian", "Vegan"],
    lineSide: "Left",
  },
  {
    id: "6",
    name: "Fish Tacos",
    price: 14.00,
    description: "Crispy battered fish in soft tortillas with cabbage slaw and a zesty crema. (Contains fish, dairy, gluten)",
    image: "/placeholder.svg",
    dietaryTags: [],
    lineSide: "Right",
  },
  {
    id: "7",
    name: "Quinoa Salad",
    price: 11.00,
    description: "Refreshing salad with quinoa, cucumber, tomatoes, bell peppers, and a lemon-herb dressing. (Naturally gluten-free)",
    image: "/placeholder.svg",
    dietaryTags: ["Vegetarian", "Vegan", "Gluten-Free"],
    lineSide: "Right",
  },
  {
    id: "8",
    name: "Pork Belly Bao Buns",
    price: 13.50,
    description: "Steamed bao buns filled with tender braised pork belly, pickled vegetables, and hoisin sauce. (Contains gluten, soy)",
    image: "/placeholder.svg",
    dietaryTags: [],
    lineSide: "Right",
  },
  {
    id: "9",
    name: "Mango Sticky Rice",
    price: 9.00,
    description: "Sweet sticky rice with fresh mango slices and a drizzle of coconut milk. (Naturally gluten-free)",
    image: "/placeholder.svg",
    dietaryTags: ["Vegetarian", "Vegan", "Gluten-Free"],
    lineSide: "Right",
  },
  {
    id: "10",
    name: "Beef Pho",
    price: 14.50,
    description: "Traditional Vietnamese noodle soup with tender beef slices, rice noodles, and aromatic broth. (Contains fish sauce)",
    image: "/placeholder.svg",
    dietaryTags: ["Gluten-Free"],
    lineSide: "Right",
  },
];

export const FoodProvider = ({ children }: { children: ReactNode }) => {
  const [foodItems, setFoodItems] = useState<FoodItem[]>(initialFoodItems);
  const [lineSide, setLineSide] = useState<LineSide | null>(null);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<DietaryTag[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

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
      ).filter(item => item.quantity > 0) // Remove if quantity drops to 0
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
      }}
    >
      {children}
    </FoodContext.Provider>
  );
};

export const useFood = () => {
  const context = useContext(FoodContext);
  if (context === undefined) {
    throw new Error('useFood must be used within a FoodProvider');
  }
  return context;
};