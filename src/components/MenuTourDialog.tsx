import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface TourStep {
  title: string;
  description: React.ReactNode;
  targetId?: string; // Optional ID for the element to highlight (for future use)
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
        Tap the <span className="font-semibold text-festival-golden-yellow">"Info"</span> button on each card to see more details like description, dietary tags, and origin.
      </>
    ),
    targetId: "info-button",
  },
  {
    title: "Adding to Your Cart",
    description: (
      <>
        Ready to order? Tap the <span className="font-semibold text-festival-deep-orange">"Add"</span> button on each item card to add it to your cart.
        You can add multiple quantities of the same item.
      </>
    ),
    targetId: "add-to-cart-button",
  },
  {
    title: "Navigating Through Items",
    description: (
      <>
        If there are many items, tap the large{' '}
        <span className="font-semibold text-festival-golden-yellow">Up</span> and{' '}
        <span className="font-semibold text-festival-cream">Down</span> arrow buttons on the left side of the screen to browse through different pages of food items.
      </>
    ),
    targetId: "page-navigation-arrows",
  },
  {
    title: "Your Shopping Cart",
    description: (
      <>
        Your cart is accessible by tapping the{' '}
        <span className="font-semibold text-festival-forest-green">shopping cart icon</span> at the bottom right of your screen. Tap it to open your cart and review your selections.
      </>
    ),
    targetId: "mobile-cart-trigger",
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
    targetId: "cart-actions",
  },
  {
    title: "Proceed to Checkout",
    description: (
      <>
        When you're done, tap the{' '}
        <span className="font-semibold text-festival-forest-green">"Proceed to Checkout"</span> button in your cart.
        You'll get an order summary to show the cashier.
      </>
    ),
    targetId: "proceed-to-checkout-button",
  },
  {
    title: "Go Back",
    description: (
      <>
        Need to change your line or dietary restrictions? Tap the{' '}
        <span className="font-semibold text-festival-forest-green">"Back"</span> button at the bottom left of your screen.
      </>
    ),
    targetId: "back-button",
  },
];

interface MenuTourDialogProps {
  isOpen: boolean;
  currentStepIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
}

const MenuTourDialog: React.FC<MenuTourDialogProps> = ({
  isOpen,
  currentStepIndex,
  onClose,
  onNext,
  onPrevious,
  onSkip,
}) => {
  const currentTourStep = tourSteps[currentStepIndex];
  const isLastStep = currentStepIndex === tourSteps.length - 1;
  const isFirstStep = currentStepIndex === 0;

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
            onClick={onSkip}
            className="border-festival-dark-red text-festival-dark-red hover:bg-festival-dark-red/10"
          >
            {isLastStep ? "Close" : "Skip Tour"}
          </Button>
          <div className="flex gap-2">
            <Button
              onClick={onPrevious}
              disabled={isFirstStep}
              className="bg-festival-golden-yellow hover:bg-festival-golden-yellow/90 text-festival-charcoal-gray"
            >
              Previous
            </Button>
            <Button
              onClick={onNext}
              className="bg-festival-deep-orange hover:bg-festival-deep-orange/90 text-festival-white"
            >
              {isLastStep ? "Got It!" : "Next"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MenuTourDialog;