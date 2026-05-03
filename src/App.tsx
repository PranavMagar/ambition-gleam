import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ResumeProvider } from "@/context/ResumeContext";
import AuthPage from "./pages/AuthPage";
import UploadPage from "./pages/UploadPage";
import ProfessionPage from "./pages/ProfessionPage";
import JobLevelPage from "./pages/JobLevelPage";
import AnalyzingPage from "./pages/AnalyzingPage";
import ResultsPage from "./pages/ResultsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ResumeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/auth" replace />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/profession" element={<ProfessionPage />} />
            <Route path="/job-level" element={<JobLevelPage />} />
            <Route path="/analyzing" element={<AnalyzingPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ResumeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
