import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import SiswaList from "./pages/SiswaList.tsx";
import SiswaForm from "./pages/SiswaForm.tsx";
import SKLDetail from "./pages/SKLDetail.tsx";
import Verifikasi from "./pages/Verifikasi.tsx";
import Pengaturan from "./pages/Pengaturan.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/siswa" element={<SiswaList />} />
          <Route path="/siswa/baru" element={<SiswaForm />} />
          <Route path="/skl/:id" element={<SKLDetail />} />
          <Route path="/verifikasi" element={<Verifikasi />} />
          <Route path="/verifikasi/:id" element={<Verifikasi />} />
          <Route path="/pengaturan" element={<Pengaturan />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
