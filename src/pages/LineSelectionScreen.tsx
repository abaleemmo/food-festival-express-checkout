import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useFood, LineSide } from '@/context/FoodContext';

const LineSelectionScreen = () => {
  const navigate = useNavigate();
  const { setLineSide } = useFood();

  const handleLineSelect = (side: LineSide) => {
    setLineSide(side);
    navigate('/dietary-restrictions');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-festival-cream text-festival-charcoal-gray">
      <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center text-festival-dark-red">
        Welcome to Express Checkout!
      </h1>
      <p className="text-xl md:text-2xl mb-12 text-center">
        Please select your line to begin.
      </p>
      <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-8 w-full max-w-md">
        <Button
          className="w-full py-6 text-2xl bg-festival-deep-orange hover:bg-festival-deep-orange/90 text-festival-white font-semibold shadow-lg"
          onClick={() => handleLineSelect("Left")}
        >
          Left Line
        </Button>
        <Button
          className="w-full py-6 text-2xl bg-festival-forest-green hover:bg-festival-forest-green/90 text-festival-white font-semibold shadow-lg"
          onClick={() => handleLineSelect("Right")}
        >
          Right Line
        </Button>
      </div>
      <div className="absolute bottom-4 text-center text-sm text-gray-600">
        <a
          href="https://abaleemmo.github.io"
          target="_blank"
          rel="noopener noreferrer"
          className="text-festival-deep-orange hover:underline"
        >
          Abdul-Aleem Mohammed
        </a>
      </div>
    </div>
  );
};

export default LineSelectionScreen;