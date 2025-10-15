
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Button from './Button'

import React from "react";
import Navbar from "./components/common/navbar/navbar";
import Footer from "./components/common/footer/footer";



function App() {
  return (
    <>

      {/* Navbar at the top */}
      <Navbar />

      {/* Main content (temporary placeholder) */}
      <main className="flex flex-col items-center justify-center text-center py-16 px-6">
        <p className="text-gray-600 max-w-xl mb-8">
          Your code goes here.
        </p>
      
        <Button onClick={() => setCount((count) => count + 1)}>
         count is {count}
        </Button>
      </main>

      {/* Footer at the bottom */}
      <Footer />
    </>
  );
}

export default App;
