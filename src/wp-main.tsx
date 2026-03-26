/**
 * WordPress entry point — mounts into #versace22-chat-root
 * Uses MemoryRouter to avoid conflicting with WordPress URLs
 */
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import "./wp-index.css";

const queryClient = new QueryClient();

const WPApp = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<Index />} />
        </Routes>
      </MemoryRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

// Mount to our scoped container
const container = document.getElementById("versace22-chat-root");
if (container) {
  createRoot(container).render(<WPApp />);
} else {
  // Fallback: create the container if it doesn't exist
  const fallback = document.createElement("div");
  fallback.id = "versace22-chat-root";
  document.body.appendChild(fallback);
  createRoot(fallback).render(<WPApp />);
}
