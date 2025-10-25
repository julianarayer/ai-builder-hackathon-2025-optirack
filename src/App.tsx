import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import SKUsAnalysis from "./pages/SKUsAnalysis";
import AnalysisHistory from "./pages/AnalysisHistory";
import AnalysisDetails from "./pages/AnalysisDetails";
import ABCDistribution from "./pages/ABCDistribution";
import Inventory from "./pages/Inventory";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/skus" element={<SKUsAnalysis />} />
          <Route path="/historico" element={<AnalysisHistory />} />
          <Route path="/historico/:analysisId" element={<AnalysisDetails />} />
          <Route path="/distribuicao-abc" element={<ABCDistribution />} />
          <Route path="/estoque" element={<Inventory />} />
          <Route path="/perfil" element={<Profile />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
