import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useFood } from '@/context/FoodContext';
import { Home } from 'lucide-react';
import { showSuccess } from '@/utils/toast';

const CheckoutScreen = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useFood();

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleGoHome = () => {
    clearCart();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 bg-festival-cream text-festival-charcoal-gray overflow-y-auto">
      <Card className="w-full max-w-2xl bg-festival-white shadow-lg rounded-lg p-6 flex flex-col my-8 flex-grow">
        <CardHeader className="text-center flex-shrink-0">
          <CardTitle className="text-4xl font-bold mb-4 text-festival-dark-red">Thank You!</CardTitle>
        </CardHeader>
        <CardContent className="mt-6 flex flex-col flex-grow">
          <h2 className="text-2xl font-semibold mb-4 text-festival-deep-orange flex-shrink-0">Order Summary</h2>
          
          {/* Totals and Item Count */}
          <div className="flex justify-between items-center text-2xl font-bold mb-2 text-festival-charcoal-gray flex-shrink-0">
            <span>Total:</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-lg text-festival-charcoal-gray mb-4 flex-shrink-0">
            <span>Items:</span>
            <span>{totalItemCount}</span>
          </div>

          {/* Cashier Message */}
          <div className="bg-festival-golden-yellow/20 border-l-4 border-festival-golden-yellow text-festival-charcoal-gray p-4 mb-6 rounded-md text-center flex-shrink-0">
            <p className="text-xl md:text-2xl font-bold text-festival-dark-red">
              Please show this screen to a cashier to complete your order.
            </p>
          </div>

          {/* Go Home Button */}
          <div className="flex flex-col space-y-4 flex-shrink-0 mb-6">
            <Button
              variant="outline"
              onClick={handleGoHome}
              className="w-full py-3 text-lg border-festival-deep-orange text-festival-deep-orange hover:bg-festival-deep-orange/10 font-semibold"
            >
              <Home className="h-5 w-5 mr-2" /> Go to Home
            </Button>
          </div>

          <Separator className="my-4 bg-festival-golden-yellow flex-shrink-0" />

          {/* Scrollable Items List */}
          <div className="space-y-3 flex-grow overflow-y-auto pr-2">
            {cart.length === 0 ? (
              <p className="text-center text-lg text-festival-charcoal-gray mt-4">No items in your order.</p>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center border-b pb-2 border-festival-cream">
                  <p className="text-lg text-festival-charcoal-gray">{item.name} (x{item.quantity})</p>
                  <p className="text-lg font-medium text-festival-forest-green">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckoutScreen;