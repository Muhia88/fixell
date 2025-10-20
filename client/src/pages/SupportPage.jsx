import React, { useState } from "react";
import ContactForm from "../components/common/ContactForm";
import Modal from "../components/common/modal";
const faqs = [
  {
    question: "How do I sell my items on Fixell?",
    answer:
      "To sell your items, sign in and go to the Marketplace page. Click 'List Item' and fill in the required details such as title, description, price, and upload photos.",
  },
  {
    question: "What is Fixell’s return policy?",
    answer:
      "Fixell allows returns within 7 days of purchase for defective items. The buyer must provide proof and contact the seller directly for resolution.",
  },
  {
    question: "Are there any fees for listing items?",
    answer:
      "Listing is free! However, a small service fee applies once an item is sold to maintain the platform and provide better service.",
  },
];

const Support = () => {
  const [openFAQ, setOpenFAQ] = useState(null);
  const [showContact, setShowContact] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        <h1 className="text-3xl font-bold mb-2">Support</h1>
        <p className="text-gray-600 mb-8">
          We're here to help you with any questions you may have.
        </p>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
 
          <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-2">Support</h2>
            <p className="text-gray-600">Use the contact form to reach our support team and find answers in the FAQ below.</p>
          </div>

          <div className="space-y-6">
  
            {/* Troubleshooting guides removed per request */}

            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-semibold mb-2">Contact Us</h3>
              <p className="text-gray-500 mb-3">
                Can’t find an answer? Fill out the form below.
              </p>
              <button
                onClick={() => setShowContact(true)}
                className="w-full bg-green-600 text-white py-2 rounded-full hover:bg-green-700"
              >
                Contact Form
              </button>
            </div>
          </div>
        </div>


        <div>
          <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm border border-gray-100"
              >
                <button
                  onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                  className="w-full flex justify-between items-center px-4 py-3 font-medium"
                >
                  {faq.question}
                  <span>{openFAQ === i ? "−" : "+"}</span>
                </button>
                {openFAQ === i && (
                  <div className="px-4 pb-3 text-gray-600">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>

          <Modal isOpen={showContact} onClose={() => setShowContact(false)} title="Contact Support">
            <ContactForm />
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default Support;
