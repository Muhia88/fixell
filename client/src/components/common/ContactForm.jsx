import React, { useState } from "react";
import axios from "axios";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

   
    if (!formData.name || !formData.email || !formData.message) {
      setStatus({ type: "error", message: "Please fill in all required fields." });
      return;
    }

    try {
      setIsLoading(true);
      setStatus({ type: "", message: "" });

      await axios.post("http://localhost:3000/contact", formData);

      setStatus({ type: "success", message: "Message sent successfully!" });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setStatus({ type: "error", message: "Failed to send message. Try again later." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-md rounded-2xl p-6 max-w-lg mx-auto border border-gray-100"
    >
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Contact Us</h3>

      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-lg p-2 mt-1 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
        />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-lg p-2 mt-1 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
        />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700">Subject</label>
        <input
          type="text"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          placeholder="Optional"
          className="w-full border border-gray-300 rounded-lg p-2 mt-1 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Message</label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows="4"
          className="w-full border border-gray-300 rounded-lg p-2 mt-1 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
        ></textarea>
      </div>

      {status.message && (
        <p
          className={`text-sm mb-3 ${
            status.type === "error" ? "text-red-500" : "text-green-600"
          }`}
        >
          {status.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg py-2 font-medium transition disabled:bg-gray-300"
      >
        {isLoading ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
};

export default ContactForm;
