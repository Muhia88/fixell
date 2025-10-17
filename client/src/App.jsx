import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Marketplace from './pages/MarketplacePage';
import AiGuideGeneratorPage from "./pages/AiGuideGeneratorPage";
import SavedGuidesPage from "./pages/SavedGuidesPage";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/marketplace" element={<Marketplace />} />
      <Route path="/generate-guide" element={<AiGuideGeneratorPage />} />
      <Route path="/saved-guides" element={<SavedGuidesPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
