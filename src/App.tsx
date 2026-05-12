import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Landing from "./pages/Landing";
import ResetPassword from "./pages/ResetPassword";
import Admin from "./pages/Admin";
import OnboardingPreview from "./pages/OnboardingPreview";
import Estate from "./pages/Estate";
import NotFound from "./pages/NotFound";
import Policies from "./pages/Policies";
import PartnersApply from "./pages/PartnersApply";
import PartnerDashboard from "./pages/PartnerDashboard";
import { Navigate } from "react-router-dom";
import Unsubscribe from "./pages/Unsubscribe";
import { captureReferralFromUrl } from "@/lib/affiliate-tracking";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => { captureReferralFromUrl(); }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <PaymentTestModeBanner />
            <Routes>
              <Route path="/landing" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/partners/apply" element={<PartnersApply />} />
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
              <Route path="/admin/affiliates" element={<Navigate to="/partner-dashboard" replace />} />
              <Route path="/admin/onboarding-preview" element={<ProtectedRoute><OnboardingPreview /></ProtectedRoute>} />
              <Route path="/partner-dashboard" element={<ProtectedRoute><PartnerDashboard /></ProtectedRoute>} />
              <Route path="/estate" element={<ProtectedRoute><Estate /></ProtectedRoute>} />
              <Route path="/policies" element={<Policies />} />
              <Route path="/unsubscribe" element={<Unsubscribe />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
