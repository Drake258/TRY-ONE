import Link from "next/link";
import Image from "next/image";

/* eslint-disable react/no-unescaped-entities */

export const metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for RIGHTCLICK COMPUTER DIGITALS",
};

export default function PrivacyPage() {
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
        <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
        
        <div className="prose prose-invert max-w-none space-y-8">
          <section className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
            <p className="text-gray-300">
              RIGHTCLICK COMPUTER DIGITALS ("we," "our," or "us") is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
              when you visit our website or make purchases from our store.
            </p>
          </section>

          <section className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
            <div className="space-y-4 text-gray-300">
              <h3 className="text-xl font-semibold text-white">Personal Information</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Name (for order processing and delivery)</li>
                <li>Phone number (for order confirmation and delivery updates)</li>
                <li>Email address (for order confirmations and marketing - optional)</li>
                <li>Shipping/billing address (for delivery)</li>
                <li>Payment information (processed securely through our payment providers)</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-white mt-4">Automatically Collected Information</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Browser type and device information</li>
                <li>IP address and location data</li>
                <li>Pages visited and interaction patterns</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </div>
          </section>

          <section className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-300 mb-4">We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Process and fulfill your orders</li>
              <li>Communicate with you about your orders</li>
              <li>Provide customer support</li>
              <li>Send you promotional offers (with your consent)</li>
              <li>Improve our website and services</li>
              <li>Prevent fraud and ensure security</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">4. Information Sharing</h2>
            <p>We do not sell, trade, or otherwise transfer your personal information to outside parties except as described below:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li><strong>Service Providers:</strong> Third-party vendors who assist in operating our business</li>
              <li><strong>Payment Processors:</strong> Secure payment processing for transactions</li>
              <li><strong>Delivery Partners:</strong> Shipping companies for order delivery</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            </ul>
          </section>

          <section className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">5. Data Security</h2>
            <p className="text-gray-300">
              We implement appropriate technical and organizational security measures to protect your 
              personal information. However, no method of transmission over the Internet or electronic 
              storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">6. Your Rights</h2>
            <p className="text-gray-300 mb-4">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Opt-out of marketing communications</li>
              <li>Request data portability</li>
            </ul>
          </section>

          <section className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">7. Cookies</h2>
            <p className="text-gray-300">
              We use cookies to enhance your browsing experience, analyze site traffic, and understand 
              where our visitors come from. You can choose to disable cookies through your browser settings.
            </p>
          </section>

          <section className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">8. Contact Us</h2>
            <p className="text-gray-300 mb-4">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <div className="bg-gray-900/50 rounded-xl p-4 space-y-2 text-gray-300">
              <p><strong>RIGHTCLICK COMPUTER DIGITALS</strong></p>
              <p>📍 Accra, Ghana</p>
              <p>📞 +233 50 381 9000</p>
              <p>📧 info@rightclickcomputerdigitals.com</p>
            </div>
          </section>

          <section className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">9. Changes to This Policy</h2>
            <p className="text-gray-300">
              We may update this Privacy Policy from time to time. We will notify you of any changes 
              by posting the new Privacy Policy on this page and updating the "last modified" date.
            </p>
            <p className="text-gray-400 mt-4">Last modified: {new Date().toLocaleDateString()}</p>
          </section>
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
