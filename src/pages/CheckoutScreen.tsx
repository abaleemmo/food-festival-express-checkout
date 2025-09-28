import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useFood } from '@/context/FoodContext';
import { Download, Home } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { showSuccess } from '@/utils/toast';

const CheckoutScreen = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useFood();

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const handleGoHome = () => {
    clearCart(); // Clear cart when going back to home
    navigate('/');
  };

  const downloadReceipt = () => {
    const doc = new jsPDF();
    const startY = 20;
    let currentY = startY;

    doc.setFontSize(22);
    doc.text("Express Checkout Receipt", 105, currentY, { align: 'center' });
    currentY += 10;

    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleString()}`, 10, currentY);
    currentY += 10;

    doc.autoTable({
      startY: currentY,
      head: [['Item', 'Quantity', 'Price', 'Total']],
      body: cart.map(item => [
        item.name,
        item.quantity,
        `$${item.price.toFixed(2)}`,
        `$${(item.price * item.quantity).toFixed(2)}`
      ]),
      theme: 'grid',
      styles: { fillColor: [255, 255, 255] },
      headStyles: { fillColor: [241, 181, 52], textColor: [51, 51, 51] }, // Golden Yellow
      alternateRowStyles: { fillColor: [249, 245, 231] }, // Cream
      didDrawPage: (data) => {
        currentY = data.cursor ? data.cursor.y : currentY;
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;

    doc.setFontSize(16);
    doc.text(`Subtotal: $${cartTotal.toFixed(2)}`, 10, currentY);
    currentY += 7;
    doc.text(`Tax: $0.00 (Nonprofit)`, 10, currentY);
    currentY += 7;
    doc.text(`Total: $${cartTotal.toFixed(2)}`, 10, currentY);
    currentY += 15;

    doc.setFontSize(18);
    doc.text("Thank you for your purchase!", 105, currentY, { align: 'center' });

    doc.save('receipt.pdf');
    showSuccess('Receipt downloaded successfully!');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-festival-cream text-festival-charcoal-gray">
      <Card className="w-full max-w-2xl bg-festival-white shadow-lg rounded-lg p-6">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold mb-4 text-festival-dark-red">Thank You!</CardTitle>
          <p className="text-xl text-festival-charcoal-gray">Your order has been placed successfully.</p>
        </CardHeader>
        <CardContent className="mt-6">
          <h2 className="text-2xl font-semibold mb-4 text-festival-deep-orange">Order Summary</h2>
          <div className="space-y-3 mb-6">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center border-b pb-2 border-festival-cream">
                <p className="text-lg text-festival-charcoal-gray">{item.name} (x{item.quantity})</p>
                <p className="text-lg font-medium text-festival-forest-green">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <Separator className="my-4 bg-festival-golden-yellow" />
          <div className="flex justify-between items-center text-2xl font-bold mb-4 text-festival-charcoal-gray">
            <span>Total:</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          <p className="text-sm text-gray-500 text-center mb-6">No tax added (nonprofit organization).</p>

          <div className="flex flex-col space-y-4">
            <Button
              onClick={downloadReceipt}
              className="w-full py-3 text-xl bg-festival-forest-green hover:bg-festival-forest-green/90 text-festival-white font-semibold shadow-lg"
            >
              <Download className="h-5 w-5 mr-2" /> Download Receipt (PDF)
            </Button>
            <Button
              variant="outline"
              onClick={handleGoHome}
              className="w-full py-3 text-lg border-festival-deep-orange text-festival-deep-orange hover:bg-festival-deep-orange/10 font-semibold"
            >
              <Home className="h-5 w-5 mr-2" /> Go to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckoutScreen;