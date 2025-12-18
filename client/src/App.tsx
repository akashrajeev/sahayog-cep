import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DisasterProvider } from "./context/DisasterContext";
import "./i18n/config";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Report from "./pages/Report";
import RealDisasterMap from './pages/RealDisasterMap';
import Hospitals from "./pages/Hospitals";
import NGOs from "./pages/NGOs";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import FloatingChatbot from "./components/FloatingChatbot";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <DisasterProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/report" element={<Report />} />
              <Route path="/map" element={<RealDisasterMap />} />
              <Route path="/hospitals" element={<Hospitals />} />
              <Route path="/ngos" element={<NGOs />} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <FloatingChatbot />
        </BrowserRouter>
      </TooltipProvider>
    </DisasterProvider>
  </QueryClientProvider>
);

export default App;
