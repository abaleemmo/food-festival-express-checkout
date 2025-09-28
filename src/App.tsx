import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index"; // This will be LineSelectionScreen
import DietaryRestrictionsScreen from "./pages/DietaryRestrictionsScreen";
import MenuScreen from "./pages/MenuScreen";
import AdminDashboard from "./pages/AdminDashboard";
import CheckoutScreen from "./pages/CheckoutScreen"; // Import the new CheckoutScreen
import NotFound from "./pages/NotFound";
import { FoodProvider } from "@/context/FoodContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <FoodProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dietary-restrictions" element={<DietaryRestrictionsScreen />} />
            <Route path="/menu" element={<MenuScreen />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/checkout" element={<CheckoutScreen />} /> {/* New Checkout Screen Route */}
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </FoodProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;