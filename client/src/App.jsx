import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/common/Navbar.jsx";
import Footer from "./components/common/footer.jsx";
import Button from "./components/common/Button.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import { AuthProvider } from "./components/context/ui/authContext.jsx";


function App() {
  const [count, setCount] = useState(0);


  return (
    <>
      {/* AuthProvider wraps the entire application to provide context */}
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <Button onClick={() => setCount(c => c + 1)}>
            Example Count: {count}
          </Button>
          <main className="flex flex-col items-center justify-center text-center py-16 px-6 min-h-[80vh]">
            <Routes>
              {/* Public Routes */}
              <Route 
                path="/" 
                element={
                  <h1 className="text-3xl font-bold text-gray-800">
                    Welcome to the Landing Page!
                  </h1>
                }
              />
              {/* Authentication Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
            </Routes>
          </main>
          <Footer />
        </BrowserRouter>
      </AuthProvider>
    </>
  );
}

export default App;
