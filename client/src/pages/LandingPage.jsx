import React from 'react'
import Navbar from '../components/common/navbar'
import Footer from '../components/common/footer'

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to Fixell</h1>
          <p className="text-gray-600">Buy and sell refurbished items in your community.</p>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default LandingPage
