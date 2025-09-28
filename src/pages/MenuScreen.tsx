import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useFood, FoodItem, CartItem, DietaryTag } from '@/context/FoodContext';
import { ShoppingCart, Plus, Minus, Trash2, ChevronLeft } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

const MenuScreen = () => {
  const navigate = useNavigate();
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

  const handleBack = () => {
    navigate(-1);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      showError("Your cart is empty. Please add some items before checking out.");
      return;
    }
    // For now, just show a success message.
    // In a real app, this would navigate to a checkout page.
    showSuccess("Proceeding to checkout!");
    console.log("Checkout initiated with cart:", cart);
    // navigate('/checkout'); // Uncomment when a checkout page exists
  };

  const filteredFoodItems = useMemo(() => {
    return foodItems.filter((item) => {
      // Filter by line side
      if (item.lineSide !== lineSide) {
        return false;
      }

      // Filter by dietary restrictions
      if (dietaryRestrictions.length > 0) {
        // An item is excluded if it has *any* of the selected restrictions
        const hasRestriction = item.dietaryTags.some((tag) =>
          dietaryRestrictions.includes(tag)
        );
        return !hasRestriction;
      }
      return true;
    });
  }, [foodItems, lineSide, dietaryRestrictions]);

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row p-4 bg-festival-cream text-festival-charcoal-gray">
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-10">
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
      <div className="flex-1 p-4 lg:pr-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center text-festival-dark-red">
          Our Menu ({lineSide} Line)
        </h1>
        <p className="text-lg md:text-xl mb-6 text-center">
          Selected Restrictions: {dietaryRestrictions.length > 0 ? dietaryRestrictions.join(', ') : 'None'}
        </p>

        <ScrollArea className="h-[calc(100vh-200px)] pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFoodItems.length === 0 ? (
              <p className="text-center text-xl text-festival-charcoal-gray md:col-span-2 lg:col-span-3">
                No food items available for your selection.
              </p>
            ) : (
              filteredFoodItems.map((item) => (
                <Card key={item.id} className="bg-festival-white shadow-lg rounded-lg overflow-hidden flex flex-col">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <CardHeader className="pb-2">
                    <CardTitle className="text-2xl font-semibold text-festival-deep-orange">
                      {item.name}
                    </CardTitle>
                    <p className="text-xl font-bold text-festival-forest-green">${item.price.toFixed(2)}</p>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <p className="text-festival-charcoal-gray text-sm mb-3">{item.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.dietaryTags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="bg-festival-golden-yellow text-festival-charcoal-gray">
                          {tag}
                        </Badge>
                      ))}
                      {item.origin && (
                        <Badge variant="outline" className="border-festival-forest-green text-festival-forest-green">
                          Origin: {item.origin}
                        </Badge>
                      )}
                    </div>
                    <Button
                      onClick={() => {
                        addToCart(item);
                        showSuccess(`${item.name} added to cart!`);
                      }}
                      className="w-full bg-festival-deep-orange hover:bg-festival-deep-orange/90 text-festival-white font-semibold"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Cart Sidebar */}
      <Card className="w-full lg:w-96 mt-8 lg:mt-0 p-4 bg-festival-white shadow-lg rounded-lg flex flex-col">
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
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => {
                        const newQuantity = parseInt(e.target.value);
                        if (!isNaN(newQuantity) && newQuantity >= 0) {
                          updateCartQuantity(item.id, newQuantity);
                        }
                      }}
                      className="w-16 text-center bg-festival-cream border-festival-forest-green"
                    />
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
      </Card>
    </div>
  );
};

export default MenuScreen;