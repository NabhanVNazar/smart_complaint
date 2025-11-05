import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext.jsx";
import Navbar from "@/components/Navbar.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";
import DepartmentDashboard from "./pages/DepartmentDashboard.jsx";
import UserRegister from "./pages/UserRegister.jsx";
import DepartmentRegister from "./pages/DepartmentRegister.jsx";
import Login from "./pages/Login.jsx";
import About from "./pages/About.jsx";
import NotFound from "./pages/NotFound.jsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={
              <>
                <Navbar />
                <LandingPage />
              </>
            } />
            <Route path="/user-dashboard" element={<UserDashboard />} />
            <Route path="/department-dashboard" element={<DepartmentDashboard />} />
            <Route path="/user-register" element={
              <>
                <Navbar />
                <UserRegister />
              </>
            } />
            <Route path="/department-register" element={
              <>
                <Navbar />
                <DepartmentRegister />
              </>
            } />
            <Route path="/login" element={
              <>
                <Navbar />
                <Login />
              </>
            } />
            <Route path="/about" element={
              <>
                <Navbar />
                <About />
              </>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
