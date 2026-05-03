import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import SiswaList from "./pages/SiswaList.tsx";
import SiswaForm from "./pages/SiswaForm.tsx";
import SKLDetail from "./pages/SKLDetail.tsx";
import Verifikasi from "./pages/Verifikasi.tsx";
import Pengaturan from "./pages/Pengaturan.tsx";
import Login from "./pages/Login.tsx";
import MasterData from "./pages/MasterData.tsx";

const queryClient = new QueryClient();

function RequireAdmin({ children }: { children: JSX.Element }) {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <div className="p-10 text-center text-sm text-muted-foreground">Memuat…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verifikasi" element={<Verifikasi />} />
            <Route path="/verifikasi/:id" element={<Verifikasi />} />
            <Route path="/dashboard" element={<RequireAdmin><Dashboard /></RequireAdmin>} />
            <Route path="/siswa" element={<RequireAdmin><SiswaList /></RequireAdmin>} />
            <Route path="/siswa/baru" element={<RequireAdmin><SiswaForm /></RequireAdmin>} />
            <Route path="/skl/:id" element={<RequireAdmin><SKLDetail /></RequireAdmin>} />
            <Route path="/pengaturan" element={<RequireAdmin><Pengaturan /></RequireAdmin>} />
            <Route path="/master" element={<RequireAdmin><MasterData /></RequireAdmin>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
