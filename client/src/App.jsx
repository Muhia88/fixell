import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/common/Navbar.jsx";
import Footer from "./components/common/Footer.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import LandingPage from './pages/LandingPage';
import ProfilePage from "./pages/ProfilePage.jsx";
import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import Marketplace from './pages/MarketplacePage';
import Support from './pages/SupportPage';
import AiGuideChatPage from "./pages/AIGuideChatPage.jsx";
import CreateListingPage from './pages/CreateListingPage.jsx';
import MyListingsPage from './pages/MyListingsPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import { AuthProvider } from "./components/context/ui/authContext.jsx";
import ToastProvider from './components/common/toast.jsx';
import ImpactDashboardPage from "./pages/ImpactDashboardPage.jsx";
import ViewListingPage from "./pages/ViewListingPage.jsx"; 
import SoldListingsPage from "./pages/SoldListingsPage.jsx"; 


function App() {
  return (
    <>
      <AuthProvider>
        <ToastProvider>
          <Navbar />
          <main className="flex flex-col items-center justify-center text-center min-h-[calc(100vh-128px)]"> 
            <Routes>
              {/* Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

              {/* Protected Routes */}
              <Route path="/impact" element={<ProtectedRoute><ImpactDashboardPage /></ProtectedRoute>} />
              <Route path="/create-listing" element={<ProtectedRoute><CreateListingPage /></ProtectedRoute>} />
              <Route path="/my-listings" element={<ProtectedRoute><MyListingsPage /></ProtectedRoute>} />
              <Route path="/my-listings/sold" element={<ProtectedRoute><SoldListingsPage /></ProtectedRoute>} />

              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/listing/:id" element={<ViewListingPage />} />
              <Route path="/support" element={<Support />} />
              <Route path="/generate-guide" element={<ProtectedRoute><AiGuideChatPage /></ProtectedRoute>} /> 
            </Routes>
          </main>
          <Footer />
        </ToastProvider>
      </AuthProvider>
    </>
  );
}

export default App;