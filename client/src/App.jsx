import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/common/navbar/navbar";
import Footer from "./components/common/footer/footer";
import Login from "./Pages/Auth/Login";
import Register from "./Pages/Auth/Register";
import { AuthProvider } from "./components/context/ui/authContext.jsx";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main className="flex flex-col items-center justify-center text-center py-16 px-6">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <p className="text-gray-600 max-w-xl mb-8">
                  Your code goes here.
                </p>
              }
            />
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;