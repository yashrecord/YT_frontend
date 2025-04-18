import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { AuthProvider } from "@/context/auth-context";
import { useAuth } from "@/context/auth-context";
import Navigation from "./components/Navigation";
import Index from "./pages/Index";
import Login from "./pages/Login";
import MainApp from "./pages/MainApp";
import Library from "./pages/Library";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import YouTubeThumbnail from "./pages/YouTubeThumbnail";
import CustomThumbnail from "./pages/CustomThumbnail";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
            <Navigation />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/about" element={<About />} />
              <Route 
                path="/app" 
                element={
                  <ProtectedRoute>
                    <MainApp />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/youtube-thumbnail" 
                element={
                  <ProtectedRoute>
                    <YouTubeThumbnail />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/custom-thumbnail" 
                element={
                  <ProtectedRoute>
                    <CustomThumbnail />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/library" 
                element={
                  <ProtectedRoute>
                    <Library />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
