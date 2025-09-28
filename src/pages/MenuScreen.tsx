import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { useFood, FoodItem, CartItem, DietaryTag } from '@/context/FoodContext';
import { ShoppingCart, Plus, Minus, ChevronLeft, Info, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const ITEMS_PER_PAGE = 3;

const MenuScreen = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const {
    foodItems,
    lineSide,
    dietaryRestrictions,
    cart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
  } = useFood();

  const [selectedFoodItem, setSelectedFoodItem] = useState<FoodItem | null>(null);
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
  const [isWarningDialogOpen, setIsWarningDialogOpen] = useState(false);
  const [itemToAddAfterWarning, setItemToAddAfterWarning] = useState<FoodItem | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [animationDirection, setAnimationDirection] = useState<'up' | 'down' | null>(null);

  const handleBack = () => {
    navigate(-1);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      showError("Your cart is empty. Please add some items before checking out.");
      return;
    }
    navigate('/checkout');
  };

  const displayFoodItems = useMemo(() => {
    const itemsForLine = foodItems.filter((item) => item.lineSide === lineSide);

    return itemsForLine.map((item) => {
      // An item is restricted (should be greyed out) if:
      // 1. Dietary restrictions are selected AND
      // 2. The item does NOT satisfy ALL of the selected dietary restrictions.
      const isRestricted = dietaryRestrictions.length > 0 &&
                           !dietaryRestrictions.every(selectedTag => item.dietaryTags.includes(selectedTag));
      return { ...item, isDisabled: isRestricted };
    });
  }, [foodItems, lineSide, dietaryRestrictions]);

  const totalPages = Math.ceil(displayFoodItems.length / ITEMS_PER_PAGE);

  // Effect to set initial page to the last one once totalPages is known
  useEffect(() => {
    if (totalPages > 0) {
      setCurrentPageIndex(totalPages - 1);
    } else {
      setCurrentPageIndex(0);
    }
  }, [totalPages]);

  const currentItems = useMemo(() => {
    const startIndex = currentPageIndex * ITEMS_PER_PAGE;
    return displayFoodItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [displayFoodItems, currentPageIndex]);

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);

  const handleInfoClick = (item: FoodItem) => {
    setSelectedFoodItem(item);
    setIsInfoDialogOpen(true);
  };

  const handlePageNav = (direction: 'up' | 'down') => {
    setAnimationDirection(direction); // Set animation direction
    if (direction === 'up') {
      setCurrentPageIndex((prev) => Math.max(0, prev - 1));
    } else {
      setCurrentPageIndex((prev) => Math.min(totalPages - 1, prev + 1));
    }
  };

  const handleAddItem = (item: FoodItem & { isDisabled: boolean }) => {
    if (item.isDisabled) {
      setItemToAddAfterWarning(item); // Set the item that triggered the warning
      setIsWarningDialogOpen(true);   // Open the warning dialog
    } else {
      addToCart(item);
      showSuccess(`${item.name} added to cart!`);
    }
  };

  const handleAddAnyway = () => {
    if (itemToAddAfterWarning) {
      addToCart(itemToAddAfterWarning);
      showSuccess(`${itemToAddAfterWarning.name} added to cart despite restrictions.`);
      setItemToAddAfterWarning(null);
    }
    setIsWarningDialogOpen(false);
  };

  const renderFoodItemCard = (item: FoodItem & { isDisabled: boolean }) => {
    return (
      <Card
        key={item.id}
        className={`flex flex-col bg-festival-white shadow-lg rounded-lg overflow-hidden w-full ${item.isDisabled ? 'opacity-50' : ''}`}
      >
        <CardHeader className="flex-grow-0 pb-2 pt-3 px-3">
          <CardTitle className="text-lg font-bold text-festival-deep-orange">
            {item.name}
          </CardTitle>
          <p className="text-base font-bold text-festival-forest-green">${item.price.toFixed(2)}</p>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-between p-3 space-y-2">
          <div className="flex items-center justify-between mt-auto pt-2">
            <Button
              onClick={() => handleInfoClick(item)}
              className="bg-festival-golden-yellow hover:bg-festival-golden-yellow/90 text-festival-charcoal-gray font-semibold text-sm py-1.5 h-auto rounded-full px-3"
            >
              <Info className="h-4 w-4 mr-1" /> Info
            </Button>
            <Button
              onClick={() => handleAddItem(item)}
              className="bg-festival-deep-orange hover:bg-festival-deep-orange/90 text-festival-white font-semibold text-sm py-1.5 h-auto rounded-full px-3"
            >
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderCartContent = () => (
    <div className="flex-1 flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="text-3xl font-bold text-festival-dark-red flex items-center">
          <ShoppingCart className="h-7 w-7 mr-3" /> Your Cart
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {cart.length === 0 ? (
          <p className="text-center text-lg text-festival-charcoal-gray mt-4">Your cart is empty.</p>
        ) : (
          <ScrollArea className="flex-1 pr-4 mb-4">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-3 border-b last:border-b-0 border-festival-cream">
                <div className="flex-1">
                  <p className="font-medium text-festival-charcoal-gray">{item.name}</p>
                  <p className="text-sm text-festival-forest-green">${item.price.toFixed(2)} x {item.quantity}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="h-8 w-8 border-festival-forest-green text-festival-forest-green hover:bg-festival-cream"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-16 text-center text-festival-charcoal-gray font-semibold">
                    {item.quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                    className="h-8 w-8 border-festival-forest-green text-festival-forest-green hover:bg-festival-cream"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFromCart(item.id)}
                    className="text-festival-dark-red hover:bg-festival-dark-red/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </ScrollArea>
        )}

        <Separator className="my-4 bg-festival-golden-yellow" />

        <div className="flex justify-between items-center text-2xl font-bold mb-4 text-festival-charcoal-gray">
          <span>Total:</span>
          <span>${cartTotal.toFixed(2)}</span>
        </div>

        <Button
          onClick={handleCheckout}
          className="w-full py-3 text-xl bg-festival-forest-green hover:bg-festival-forest-green/90 text-festival-white font-semibold shadow-lg mb-2"
          disabled={cart.length === 0}
        >
          Proceed to Checkout
        </Button>
        <Button
          variant="outline"
          onClick={clearCart}
          className="w-full py-3 text-lg border-festival-dark-red text-festival-dark-red hover:bg-festival-dark-red/10 font-semibold"
          disabled={cart.length === 0}
        >
          Clear Cart
        </Button>
      </CardContent>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-festival-cream text-festival-charcoal-gray overflow-hidden">
      {/* Header for Line Title */}
      <div className="p-4 flex justify-center"> {/* Centered title */}
        <h1 className="text-5xl md:text-6xl font-bold text-center text-festival-dark-red">
          {lineSide} Line
        </h1>
      </div>

      {/* Back Button - Fixed at bottom-left */}
      <Button
        onClick={handleBack}
        className="fixed bottom-4 left-4 bg-festival-forest-green hover:bg-festival-forest-green/90 text-festival-white rounded-full p-4 shadow-lg flex items-center space-x-2 z-50"
      >
        <ChevronLeft className="h-6 w-6" />
        <span className="text-lg font-semibold hidden md:inline">Back</span>
      </Button>

      {/* Main content area (Menu + Cart) */}
      <div className="flex-1 flex flex-col lg:flex-row p-4 pt-0">
        {/* Menu Content (Arrows + Food Items) */}
        <div className="flex-1 p-4 relative">
          {displayFoodItems.length === 0 ? (
            <p className="text-center text-xl text-festival-charcoal-gray">
              No food items available for your selection.
            </p>
          ) : (
            <div className="relative w-full flex justify-center">
              {/* Navigation Arrows - positioned absolutely */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col space-y-6 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handlePageNav('up')}
                  disabled={currentPageIndex === 0}
                  className={cn(
                    "h-14 w-14 rounded-md shadow-md text-festival-charcoal-gray",
                    currentPageIndex === 0 ? "bg-gray-300" : "bg-festival-cream hover:bg-festival-cream/80"
                  )}
                >
                  <ChevronUp className="h-10 w-10" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handlePageNav('down')}
                  disabled={currentPageIndex === totalPages - 1}
                  className={cn(
                    "h-14 w-14 rounded-md shadow-md text-festival-charcoal-gray",
                    currentPageIndex === totalPages - 1 ? "bg-gray-300" : "bg-festival-golden-yellow hover:bg-festival-golden-yellow/80"
                  )}
                >
                  <ChevronDown className="h-10 w-10" />
                </Button>
              </div>

              {/* Food Item Column - now takes full width */}
              <div
                key={currentPageIndex} // Key change triggers remount and animation
                className={cn(
                  "flex flex-col gap-4 w-full max-w-md ml-24 transition-opacity duration-200 ease-in-out",
                  animationDirection === 'up' && currentPageIndex !== totalPages -1 ? "animate-slide-in-down" : "", // Slide down when moving up pages
                  animationDirection === 'down' && currentPageIndex !== 0 ? "animate-slide-in-up" : "", // Slide up when moving down pages
                  animationDirection === null ? "opacity-100" : "" // Initial state or after animation
                )}
              >
                {currentItems.map((item) => renderFoodItemCard(item))}
              </div>
            </div>
          )}
        </div>

        {/* Cart Sidebar (Desktop) / Cart Drawer (Mobile) */}
        {isMobile ? (
          <Drawer>
            <DrawerTrigger asChild>
              <Button className="fixed bottom-4 right-4 bg-festival-forest-green hover:bg-festival-forest-green/90 text-white rounded-full p-4 shadow-lg">
                <ShoppingCart className="h-6 w-6" />
                {cart.length > 0 && (
                  <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-festival-deep-orange text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </Button>
            </DrawerTrigger>
            <DrawerContent className="h-[80vh] bg-festival-cream overflow-y-auto">
              <DrawerHeader>
                <DrawerTitle className="text-festival-dark-red">Your Cart</DrawerTitle>
              </DrawerHeader>
              {renderCartContent()}
            </DrawerContent>
          </Drawer>
        ) : (
          <Card className="w-full lg:w-96 mt-8 lg:mt-0 p-4 bg-festival-white shadow-lg rounded-lg flex flex-col max-h-[calc(100vh-theme(spacing.8))] overflow-y-auto">
            {renderCartContent()}
          </Card>
        )}
      </div>

      {/* Info Dialog */}
      <Dialog open={isInfoDialogOpen} onOpenChange={setIsInfoDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-festival-cream text-festival-charcoal-gray">
          <DialogHeader>
            <DialogTitle className="text-festival-dark-red">{selectedFoodItem?.name}</DialogTitle>
            <DialogDescription className="text-festival-charcoal-gray">
              Details about this food item.
            </DialogDescription>
          </DialogHeader>
          {selectedFoodItem && (
            <div className="grid gap-4 py-4">
              {selectedFoodItem.image && (
                <img src={selectedFoodItem.image} alt={selectedFoodItem.name} className="w-full h-48 object-cover rounded-md mb-2" />
              )}
              <p className="text-lg font-semibold">${selectedFoodItem.price.toFixed(2)}</p>
              <p>{selectedFoodItem.description}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedFoodItem.dietaryTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="bg-festival-golden-yellow text-festival-charcoal-gray">
                    {tag}
                  </Badge>
                ))}
                {selectedFoodItem.origin && (
                  <Badge variant="outline" className="border-festival-forest-green text-festival-forest-green">
                    Origin: {selectedFoodItem.origin}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dietary Restriction Warning Dialog */}
      <Dialog open={isWarningDialogOpen} onOpenChange={setIsWarningDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-festival-cream text-festival-charcoal-gray">
          <DialogHeader>
            <DialogTitle className="text-festival-dark-red">Dietary Restriction Warning</DialogTitle>
            <DialogDescription className="text-festival-charcoal-gray">
              This item does not meet your selected dietary restrictions. Are you sure you want to add it to your cart?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center space-x-2"> {/* Changed justify-end to justify-center */}
            <Button variant="outline" onClick={() => setIsWarningDialogOpen(false)} className="border-festival-dark-red text-festival-dark-red hover:bg-festival-dark-red/10">
              Cancel
            </Button>
            <Button
              onClick={handleAddAnyway}
              className="bg-festival-deep-orange hover:bg-festival-deep-orange/90 text-festival-white"
            >
              Add Anyway
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenuScreen;