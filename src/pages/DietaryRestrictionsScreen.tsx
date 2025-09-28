import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useFood, DietaryTag } from '@/context/FoodContext';
import { ChevronLeft } from 'lucide-react'; // Import the back icon

const DietaryRestrictionsScreen = () => {
  const navigate = useNavigate();
  const { dietaryRestrictions, toggleDietaryRestriction } = useFood();

  const handleContinue = () => {
    navigate('/menu');
  };

  const handleBack = () => {
    navigate(-1); // Go back to the previous page
  };

  const restrictions: DietaryTag[] = ["Vegetarian", "Vegan", "Gluten-Free"];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-festival-cream text-festival-charcoal-gray">
      <div className="absolute top-4 left-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="text-festival-charcoal-gray hover:bg-festival-cream/50"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
      </div>
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center text-festival-dark-red">
        Any Dietary Restrictions?
      </h1>
      <p className="text-lg md:text-xl mb-10 text-center">
        Select all that apply. Items not matching will be grayed out.
      </p>
      <div className="flex flex-col space-y-6 mb-12 w-full max-w-sm">
        {restrictions.map((restriction) => (
          <div key={restriction} className="flex items-center space-x-4 p-4 bg-festival-white rounded-lg shadow-md">
            <Checkbox
              id={restriction}
              checked={dietaryRestrictions.includes(restriction)}
              onCheckedChange={() => toggleDietaryRestriction(restriction)}
              className="h-6 w-6 border-festival-forest-green data-[state=checked]:bg-festival-forest-green data-[state=checked]:text-festival-white"
            />
            <Label htmlFor={restriction} className="text-xl font-medium text-festival-charcoal-gray cursor-pointer">
              {restriction}
            </Label>
          </div>
        ))}
      </div>
      <Button
        className="w-full max-w-xs py-4 text-xl bg-festival-deep-orange hover:bg-festival-deep-orange/90 text-festival-white font-semibold shadow-lg"
        onClick={handleContinue}
      >
        Continue to Menu
      </Button>
    </div>
  );
};

export default DietaryRestrictionsScreen;