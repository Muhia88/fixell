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
import AiGuideChatPage from "./pages/AIGuideChatPage.jsx"
import CreateListingPage from './pages/CreateListingPage.jsx';
import MyListingsPage from './pages/MyListingsPage.jsx';
import { AuthProvider } from "./components/context/ui/authContext.jsx";
import ToastProvider from './components/common/toast.jsx';


function App() {
  return (
    <>
      <AuthProvider>
        <ToastProvider>
          <Navbar />
          <main className="flex flex-col items-center justify-center text-center py-16 px-6 min-h-[80vh]">
            <Routes>
              {/* Authentication Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />

              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/create-listing" element={<CreateListingPage />} />
              <Route path="/my-listings" element={<MyListingsPage />} />
              <Route path="/support" element={<Support />} />
              <Route path="/generate-guide" element={<AiGuideChatPage />} />
            </Routes>
          </main>
          <Footer />
        </ToastProvider>
      </AuthProvider>
    </>
  );
}

export default App
