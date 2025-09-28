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

const ITEMS_PER_PAGE = 4; // Always display 4 items in a 2x2 grid

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
  const [currentPageIndex, setCurrentPageIndex] = useState(0); // Controls which set of 4 items is shown

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
      const isRestricted = dietaryRestrictions.length > 0 && item.dietaryTags.some((tag) =>
        dietaryRestrictions.includes(tag)
      );
      return { ...item, isDisabled: isRestricted };
    });
  }, [foodItems, lineSide, dietaryRestrictions]);

  const totalPages = Math.ceil(displayFoodItems.length / ITEMS_PER_PAGE);

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
    if (direction === 'up') {
      setCurrentPageIndex((prev) => Math.max(0, prev - 1));
    } else {
      setCurrentPageIndex((prev) => Math.min(totalPages - 1, prev + 1));
    }
  };

  const handleAddItem = (item: FoodItem & { isDisabled: boolean }) => {
    if (item.isDisabled) {
      setItemToAddAfterWarning(item);
      setIsWarningDialogOpen(true);
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
    const cartItem = cart.find((ci) => ci.id === item.id);
    const quantity = cartItem ? cartItem.quantity : 0;

    const [animateQuantity, setAnimateQuantity] = useState(false);

    useEffect(() => {
      if (quantity > 0) {
        setAnimateQuantity(true);
        const timer = setTimeout(() => setAnimateQuantity(false), 300); // Match animation duration
        return () => clearTimeout(timer);
      }
    }, [quantity]);

    return (
      <Card
        key={item.id}
        className={`flex flex-col bg-festival-white shadow-lg rounded-lg overflow-hidden ${item.isDisabled ? 'opacity-50' : ''}
          w-[calc(50%-0.5rem)] sm:w-[calc(50%-0.75rem)] // Adjust for gap on mobile/small screens
          aspect-[1/1.3] // Fixed aspect ratio for equal height/width
        `}
      >
        {item.image && (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-2/5 object-cover" // Image takes 40% height of the card
          />
        )}
        <CardHeader className="flex-grow-0 pb-1 pt-2 px-3">
          <CardTitle className="text-base font-bold text-festival-deep-orange truncate">
            {item.name}
          </CardTitle>
          <p className="text-sm font-bold text-festival-forest-green">${item.price.toFixed(2)}</p>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-between p-3 pt-0 space-y-2">
          <div className="flex flex-wrap gap-1">
            {item.dietaryTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="bg-festival-golden-yellow text-festival-white text-xs px-2 py-1">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="flex items-center justify-between mt-auto"> {/* Aligned at bottom */}
            <Button
              onClick={() => handleInfoClick(item)}
              className="bg-festival-golden-yellow hover:bg-festival-golden-yellow/90 text-festival-charcoal-gray font-semibold text-xs py-1.5 h-auto rounded-full px-3"
            >
              <Info className="h-3 w-3 mr-1" /> Info
            </Button>
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => updateCartQuantity(item.id, quantity - 1)}
                disabled={quantity === 0}
                className="h-7 w-7 border-festival-forest-green text-festival-forest-green hover:bg-festival-cream rounded-full"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className={`text-lg font-bold text-festival-charcoal-gray w-6 text-center ${animateQuantity ? 'animate-scale-bounce-once' : ''}`}>
                {quantity}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleAddItem(item)} // Use handleAddItem to respect restrictions
                className="h-7 w-7 border-festival-forest-green text-festival-forest-green hover:bg-festival-cream rounded-full"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
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
    <div className="min-h-screen flex flex-col lg:flex-row p-4 bg-festival-cream text-festival-charcoal-gray">
      {/* Back Button */}
      <div className={`z-10 ${isMobile ? 'fixed bottom-4 left-4' : 'absolute top-4 left-4'}`}>
        <Button
          variant="default"
          size="lg"
          onClick={handleBack}
          className="bg-festival-forest-green hover:bg-festival-forest-green/90 text-festival-white px-6 py-3 rounded-lg shadow-md flex items-center space-x-2"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="text-lg font-semibold">Back</span>
        </Button>
      </div>

      {/* Main Menu Content */}
      <div className="flex-1 p-4 lg:pl-28 lg:pr-8"> {/* Adjusted padding for back button */}
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center text-festival-dark-red">
          {lineSide} Line
        </h1>

        {displayFoodItems.length === 0 ? (
          <p className="text-center text-xl text-festival-charcoal-gray md:col-span-2 lg:col-span-4">
            No food items available for your selection.
          </p>
        ) : (
          <div className="flex w-full h-full items-center justify-center"> {/* Centering container */}
            {/* Navigation Arrows */}
            <div className="flex flex-col space-y-6 mr-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handlePageNav('up')}
                disabled={currentPageIndex === 0}
                className="text-festival-charcoal-gray hover:bg-festival-golden-yellow/50 h-14 w-14 bg-festival-golden-yellow/40 rounded-md shadow-md"
              >
                <ChevronUp className="h-10 w-10" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handlePageNav('down')}
                disabled={currentPageIndex === totalPages - 1}
                className="text-festival-charcoal-gray hover:bg-festival-golden-yellow/50 h-14 w-14 bg-festival-golden-yellow/40 rounded-md shadow-md"
              >
                <ChevronDown className="h-10 w-10" />
              </Button>
            </div>

            {/* Food Item Grid */}
            <div
              key={currentPageIndex} // Key change triggers re-render and animation
              className="grid grid-cols-2 gap-4 flex-1 transition-opacity duration-200 ease-in-out opacity-100"
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
          <DrawerContent className="h-[80vh] bg-festival-cream">
            <DrawerHeader>
              <DrawerTitle className="text-festival-dark-red">Your Cart</DrawerTitle>
            </DrawerHeader>
            {renderCartContent()}
          </DrawerContent>
        </Drawer>
      ) : (
        <Card className="w-full lg:w-96 mt-8 lg:mt-0 p-4 bg-festival-white shadow-lg rounded-lg flex flex-col">
          {renderCartContent()}
        </Card>
      )}

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
              This item does not meet your selected dietary restrictions (
              {itemToAddAfterWarning?.dietaryTags.join(', ') || 'None specified for item'}). Are you sure you want to add it to your cart?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
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