import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Lessons from "./pages/Lessons";
import Quiz from "./pages/Quiz";
import MiniGames from "./pages/MiniGames";
import MemoryRecap from "./pages/MemoryRecap";
import FlagQuiz from "./pages/FlagQuiz";
import ContinentMatch from "./pages/ContinentMatch";
import LetterMatch from "./pages/LetterMatch";
import LearnTopic from "./pages/LearnTopic";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/lessons" element={<Lessons />} />
          <Route path="/quiz/:lessonId" element={<Quiz />} />
          <Route path="/mini-games" element={<MiniGames />} />
          <Route path="/memory-recap" element={<MemoryRecap />} />
          <Route path="/flag-quiz" element={<FlagQuiz />} />
          <Route path="/continent-match" element={<ContinentMatch />} />
          <Route path="/letter-match" element={<LetterMatch />} />
          <Route path="/learn-topic" element={<LearnTopic />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
