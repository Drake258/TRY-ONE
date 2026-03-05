import Link from "next/link";
import Image from "next/image";

/* eslint-disable react/no-unescaped-entities */

export const metadata = {
  title: "Terms & Conditions",
  description: "Terms and Conditions for RIGHTCLICK COMPUTER DIGITALS",
};

export default function TermsPage() {
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
        <h1 className="text-4xl font-bold text-white mb-8">Terms & Conditions</h1>
        
        <div className="prose prose-invert max-w-none space-y-8">
          <section className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-300">
              By accessing and using the RIGHTCLICK COMPUTER DIGITALS website ("the Site"), you accept 
              and agree to be bound by the terms and provision of this agreement. If you do not agree 
              to these terms, you should not use our services.
            </p>
          </section>

          <section className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">2. Products and Services</h2>
            <p className="text-gray-300 mb-4">
              RIGHTCLICK COMPUTER DIGITALS offers the following products and services:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Sale of computers, laptops, and accessories</li>
              <li>Computer repair and maintenance services</li>
              <li>Professional tech consultation</li>
              <li>Product delivery and installation</li>
            </ul>
          </section>

          <section className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">3. Ordering and Payment</h2>
            <div className="space-y-4 text-gray-300">
              <h3 className="text-xl font-semibold text-white">Order Process</h3>
              <p>
                When you place an order through our Site, you are making an offer to purchase products 
                at the prices indicated. We will confirm receipt of your order and process payment 
                before fulfilling the order.
              </p>
              
              <h3 className="text-xl font-semibold text-white mt-4">Payment Methods</h3>
              <p>We accept the following payment methods:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Mobile Money (MTN, Telecel, AirtelTigo)</li>
                <li>Visa/MasterCard</li>
                <li>Cash on Delivery (selected areas)</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-white mt-4">Pricing</h3>
              <p>
                All prices are in Ghana Cedis (₵) and include applicable taxes. We reserve the right 
                to modify prices at any time without prior notice.
              </p>
            </div>
          </section>

          <section className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">4. Shipping and Delivery</h2>
            <p className="text-gray-300 mb-4">
              We provide delivery services within Ghana. Delivery times may vary based on location 
              and product availability. Standard delivery takes 3-7 business days.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Delivery charges may apply for certain locations</li>
              <li>Customers must provide accurate delivery addresses</li>
              <li>Someone must be available to receive the delivery</li>
              <li>Order tracking is available through our tracking system</li>
            </ul>
          </section>

          <section className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">5. Returns and Exchanges</h2>
            <p className="text-gray-300 mb-4">
              We want you to be completely satisfied with your purchase. If you're not happy with 
              your product, you may return it within 7 days of delivery subject to the following conditions:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Product must be unused and in original packaging</li>
              <li>Proof of purchase is required</li>
Certain products (              <li>such as software) may not be eligible for return</li>
              <li>Refunds will be processed within 14 business days</li>
            </ul>
          </section>

          <section className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">6. Warranty</h2>
            <p className="text-gray-300 mb-4">
              All new products come with manufacturer warranty as specified by the manufacturer. 
              Our repair services include a 30-day warranty on workmanship.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Warranty periods vary by product manufacturer</li>
              <li>Warranty does not cover physical damage or misuse</li>
              <li>Extended warranty options are available for purchase</li>
            </ul>
          </section>

          <section className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">7. User Accounts</h2>
            <p className="text-gray-300 mb-4">
              For staff access to our admin panel, users must maintain the confidentiality of 
              their account credentials. We reserve the right to suspend or terminate accounts 
              that violate our policies.
            </p>
          </section>

          <section className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">8. Intellectual Property</h2>
            <p className="text-gray-300">
              All content on this website, including logos, images, product descriptions, and 
              software, is the property of RIGHTCLICK COMPUTER DIGITALS and is protected by 
              copyright and intellectual property laws.
            </p>
          </section>

          <section className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">9. Limitation of Liability</h2>
            <p className="text-gray-300">
              RIGHTCLICK COMPUTER DIGITALS shall not be liable for any indirect, incidental, special, 
              or consequential damages arising out of the use or inability to use our services. 
              Our liability is limited to the maximum extent permitted by law.
            </p>
          </section>

          <section className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">10. Governing Law</h2>
            <p className="text-gray-300">
              These Terms and Conditions shall be governed by and construed in accordance with 
              the laws of Ghana. Any disputes arising from these terms shall be subject to the 
              exclusive jurisdiction of the courts of Ghana.
            </p>
          </section>

          <section className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">11. Contact Information</h2>
            <p className="text-gray-300 mb-4">
              For questions about these Terms and Conditions, please contact us:
            </p>
            <div className="bg-gray-900/50 rounded-xl p-4 space-y-2 text-gray-300">
              <p><strong>RIGHTCLICK COMPUTER DIGITALS</strong></p>
              <p>📍 Accra, Ghana</p>
              <p>📞 +233 50 381 9000</p>
              <p>📧 info@rightclickcomputerdigitals.com</p>
            </div>
          </section>

          <section className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">12. Changes to Terms</h2>
            <p className="text-gray-300">
              We reserve the right to modify these Terms and Conditions at any time. Changes will 
              be effective immediately upon posting to the website. Your continued use of the site 
              constitutes acceptance of any modified terms.
            </p>
            <p className="text-gray-400 mt-4">Last updated: {new Date().toLocaleDateString()}</p>
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
