import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index"; // This will be LineSelectionScreen
import DietaryRestrictionsScreen from "./pages/DietaryRestrictionsScreen";
import MenuScreen from "./pages/MenuScreen";
import AdminDashboard from "./pages/AdminDashboard";
import CheckoutScreen from "./pages/CheckoutScreen";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login"; // Import Login page
import { FoodProvider } from "@/context/FoodContext";
import RedirectOnReload from "./components/RedirectOnReload";
import { SessionContextProvider, useSession } from "@/context/SessionContext"; // Import SessionContextProvider and useSession
import React from "react";

const queryClient = new QueryClient();

// ProtectedRoute component to guard routes
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useSession();

  if (loading) {
    return <div>Loading authentication...</div>; // Or a spinner component
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" />
      <BrowserRouter>
        <SessionContextProvider> {/* Wrap with SessionContextProvider */}
          <FoodProvider>
            <RedirectOnReload>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/dietary-restrictions" element={<DietaryRestrictionsScreen />} />
                <Route path="/menu" element={<MenuScreen />} />
                <Route path="/login" element={<Login />} /> {/* Add Login route */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="/checkout" element={<CheckoutScreen />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </RedirectOnReload>
          </FoodProvider>
        </SessionContextProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;