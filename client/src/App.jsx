import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import common layout components
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";

// Import all page components
// import LandingPage from "./pages/LandingPage";
// import AboutPage from "./pages/AboutPage";
// import MarketplacePage from "./pages/MarketplacePage";
import AiGuideGeneratorPage from "./pages/AiGuideGeneratorPage";
import SavedGuidesPage from "./pages/SavedGuidesPage";
// import SupportPage from "./pages/SupportPage";
// import LoginPage from "./pages/LoginPage";
// import RegisterPage from "./pages/RegisterPage";
// Add other pages as you create them
// import DashboardPage from "./pages/DashboardPage"; 
// import ProfilePage from "./pages/ProfilePage";

function App() {
  return (
    // The Router component wraps your entire application to enable routing
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50">
        {/* Navbar appears on every page */}
        <Navbar />

        {/* The `main` content area will render the component for the current route */}
        <main className="flex-grow">
          {/* The Routes component defines all possible navigation paths */}
          <Routes>
            {/* Each Route maps a URL path to a specific page component */}
            {/* <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/marketplace" element={<MarketplacePage />} /> */}
            <Route path="/generate-guide" element={<AiGuideGeneratorPage />} />
            <Route path="/saved-guides" element={<SavedGuidesPage />} />
            {/* <Route path="/support" element={<SupportPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} /> */}
            {/* Add routes for dashboard, profile, etc. when they are created */}
            {/* <Route path="/dashboard" element={<DashboardPage />} /> */}
            {/* <Route path="/profile" element={<ProfilePage />} /> */}
          </Routes>
        </main>

        {/* Footer appears on every page */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
