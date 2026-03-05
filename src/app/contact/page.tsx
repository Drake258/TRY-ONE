"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Contact Us",
  description: "Contact RIGHTCLICK COMPUTER DIGITALS",
};

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    // In production, this would send to an API endpoint
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setSuccess(true);
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navigation */}
      <nav className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo-icon.svg"
                alt="RightClick Computer Digitals"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <div>
                <div className="text-white font-bold text-sm leading-tight">RIGHTCLICK</div>
                <div className="text-orange-400 text-xs tracking-widest">COMPUTER DIGITALS</div>
              </div>
            </Link>
            <Link
              href="/"
              className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-white mb-4 text-center">Contact Us</h1>
        <p className="text-gray-400 text-center mb-12">
          Have questions? We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Get in Touch</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">📍</span>
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Address</h3>
                    <p className="text-gray-400">Accra, Ghana</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">📞</span>
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Phone</h3>
                    <p className="text-gray-400">+233 50 381 9000</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">📧</span>
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Email</h3>
                    <p className="text-gray-400">info@rightclickcomputerdigitals.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">🕐</span>
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Business Hours</h3>
                    <p className="text-gray-400">Mon - Sat: 8:00 AM - 6:00 PM</p>
                    <p className="text-gray-400">Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Quick Links</h2>
              <div className="space-y-2">
                <Link
                  href="/products"
                  className="block text-orange-400 hover:text-orange-300 transition"
                >
                  → Browse Products
                </Link>
                <Link
                  href="/track-order"
                  className="block text-orange-400 hover:text-orange-300 transition"
                >
                  → Track Your Order
                </Link>
                <Link
                  href="/privacy"
                  className="block text-orange-400 hover:text-orange-300 transition"
                >
                  → Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="block text-orange-400 hover:text-orange-300 transition"
                >
                  → Terms & Conditions
                </Link>
                <Link
                  href="/refund"
                  className="block text-orange-400 hover:text-orange-300 transition"
                >
                  → Refund Policy
                </Link>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Send us a Message</h2>
            
            {success && (
              <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl mb-4">
                ✓ Message sent successfully! We&apos;ll get back to you soon.
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                  placeholder="Your name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Phone *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                    placeholder="+233 XX XXX XXXX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Subject *</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="">Select a topic</option>
                  <option value="sales">Sales Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="repairs">Repair Services</option>
                  <option value="orders">Order Status</option>
                  <option value="feedback">Feedback</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Message *</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={5}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 resize-none"
                  placeholder="How can we help you?"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-800 text-white font-semibold py-3 rounded-xl transition"
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-8 px-4 mt-12">
        <div className="max-w-4xl mx-auto text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} RIGHTCLICK COMPUTER DIGITALS. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
