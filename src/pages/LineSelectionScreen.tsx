import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
// Removed useFood and LineSide imports

const LineSelectionScreen = () => {
  const navigate = useNavigate();
  // Removed setLineSide usage

  const handleContinue = () => {
    navigate('/dietary-restrictions');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-festival-cream text-festival-charcoal-gray">
      <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center text-festival-dark-red">
        Welcome to Express Checkout!
      </h1>
      <p className="text-xl md:text-2xl mb-12 text-center">
        Click below to continue to dietary restrictions.
      </p>
      <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-8 w-full max-w-md">
        <Button
          className="w-full py-6 text-2xl bg-festival-deep-orange hover:bg-festival-deep-orange/90 text-festival-white font-semibold shadow-lg"
          onClick={handleContinue}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default LineSelectionScreen;