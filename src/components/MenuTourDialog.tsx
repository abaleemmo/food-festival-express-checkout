import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface TourStep {
  title: string;
  description: React.ReactNode;
}

const tourSteps: TourStep[] = [
  {
    title: "Welcome to the Menu!",
    description: (
      <>
        This is where you'll find all the delicious food items available at the{' '}
        <span className="font-semibold text-festival-deep-orange">Express Checkout</span>.
        Let's take a quick tour!
      </>
    ),
  },
  {
    title: "Browsing Food Items",
    description: (
      <>
        Each card represents a food item. You'll see its name and price.
        Click the <span className="font-semibold text-festival-golden-yellow">"Info"</span> button to see more details like description, dietary tags, and origin.
      </>
    ),
  },
  {
    title: "Adding to Your Cart",
    description: (
      <>
        Ready to order? Use the <span className="font-semibold text-festival-deep-orange">"Add"</span> button on each item card to add it to your cart.
        You can add multiple quantities of the same item.
      </>
    ),
  },
  {
    title: "Navigating Through Items",
    description: (
      <>
        If there are many items, use the <span className="font-semibold text-festival-golden-yellow">Up</span> and{' '}
        <span className="font-semibold text-festival-cream">Down</span> arrows on the left to browse through different pages of food items.
      </>
    ),
  },
  {
    title: "Your Shopping Cart",
    description: (
      <>
        On desktop, your cart is on the right. On mobile, tap the{' '}
        <span className="font-semibold text-festival-forest-green">shopping cart icon</span> at the bottom right to open it.
        Here you can review your selections, adjust quantities, or remove items.
      </>
    ),
  },
  {
    title: "Cart Actions",
    description: (
      <>
        Inside the cart, you can use the <span className="font-semibold text-festival-forest-green">"+"</span> and{' '}
        <span className="font-semibold text-festival-forest-green">"-"</span> buttons to change quantities, or the{' '}
        <span className="font-semibold text-festival-dark-red">trash icon</span> to remove an item.
        The <span className="font-semibold text-festival-dark-red">"Clear Cart"</span> button empties everything.
      </>
    ),
  },
  {
    title: "Proceed to Checkout",
    description: (
      <>
        When you're done, click the{' '}
        <span className="font-semibold text-festival-forest-green">"Proceed to Checkout"</span> button in your cart.
        You'll get an order summary to show the cashier.
      </>
    ),
  },
  {
    title: "Go Back",
    description: (
      <>
        Need to change your line or dietary restrictions? Use the{' '}
        <span className="font-semibold text-festival-forest-green">"Back"</span> button at the bottom left.
      </>
    ),
  },
  {
    title: "Enjoy Your Meal!",
    description: (
      <>
        That's it for the tour! We hope you have a great experience with{' '}
        <span className="font-semibold text-festival-deep-orange">Express Checkout</span>.
      </>
    ),
  },
];

interface MenuTourDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const MenuTourDialog: React.FC<MenuTourDialogProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose(); // End of tour
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const currentTourStep = tourSteps[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-festival-cream text-festival-charcoal-gray">
        <DialogHeader>
          <DialogTitle className="text-festival-dark-red">{currentTourStep.title}</DialogTitle>
          <DialogDescription className="text-festival-charcoal-gray text-base">
            {currentTourStep.description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2 mt-4">
          <Button
            variant="outline"
            onClick={handleSkip}
            className="border-festival-dark-red text-festival-dark-red hover:bg-festival-dark-red/10"
          >
            {currentStep === tourSteps.length - 1 ? "Close" : "Skip Tour"}
          </Button>
          <Button
            onClick={handleNext}
            className="bg-festival-deep-orange hover:bg-festival-deep-orange/90 text-festival-white"
          >
            {currentStep < tourSteps.length - 1 ? "Next" : "Got It!"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MenuTourDialog;