import Link from "next/link";
import Image from "next/image";

/* eslint-disable react/no-unescaped-entities */

export const metadata = {
  title: "Refund Policy",
  description: "Refund Policy for RIGHTCLICK COMPUTER DIGITALS",
};

export default function RefundPage() {
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
        <h1 className="text-4xl font-bold text-white mb-8">Refund Policy</h1>
        
        <div className="prose prose-invert max-w-none space-y-8">
          <section className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">1. Our Commitment</h2>
            <p className="text-gray-300">
              At RIGHTCLICK COMPUTER DIGITALS, we are committed to ensuring customer satisfaction. 
              We understand that sometimes a product may not meet your expectations, and we want to 
              make the return and refund process as smooth as possible.
            </p>
          </section>

          <section className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">2. Eligibility for Refund</h2>
            <p className="text-gray-300 mb-4">
              You may request a refund within the following timeframes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li><strong>Physical Products:</strong> 7 days from date of delivery</li>
              <li><strong>Digital Products/Software:</strong> Non-refundable once downloaded or activated</li>
              <li><strong>Services (Repairs):</strong> 30 days from service completion</li>
              <li><strong>Custom Orders:</strong> Non-refundable unless defective</li>
            </ul>
          </section>

          <section className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">3. Conditions for Returns</h2>
            <p className="text-gray-300 mb-4">
              To be eligible for a return, your item must meet the following conditions:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Product must be unused and in the same condition you received it</li>
              <li>Product must be in the original packaging with all accessories included</li>
              <li>Proof of purchase (receipt or order confirmation) must be provided</li>
              <li>Product must not be damaged due to misuse or negligence</li>
            </ul>
          </section>

          <section className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">4. Items Not Eligible for Refund</h2>
            <p className="text-gray-300 mb-4">
              The following items cannot be returned:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Software and digital licenses (once activated)</li>
              <li>Products damaged by misuse, accidents, or unauthorized modifications</li>
              <li>Consumable items (ink cartridges, batteries, etc.)</li>
              <li>Products with missing serial numbers or altered packaging</li>
              <li>Gift cards and promotional vouchers</li>
              <li>Custom-built or customized computers</li>
            </ul>
          </section>

          <section className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">5. Refund Process</h2>
            <div className="space-y-4 text-gray-300">
              <h3 className="text-xl font-semibold text-white">Step 1: Request a Return</h3>
              <p>
                Contact our customer support team at +233 50 381 9000 or email 
                info@rightclickcomputerdigitals.com with your order number and reason for return.
              </p>
              
              <h3 className="text-xl font-semibold text-white">Step 2: Inspection</h3>
              <p>
                Once we receive your return request, our team will inspect the product to ensure 
                it meets our return conditions.
              </p>
              
              <h3 className="text-xl font-semibold text-white">Step 3: Refund Processing</h3>
              <p>
                Approved refunds will be processed within 14 business days. The refund will be 
                credited to your original payment method or Mobile Money account.
              </p>
            </div>
          </section>

          <section className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">6. Refund Methods</h2>
            <p className="text-gray-300 mb-4">
              Refunds will be issued using the original payment method:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li><strong>Mobile Money:</strong> Refund to the same Mobile Money number used for payment</li>
              <li><strong>Card Payment:</strong> Refund to the same card used for payment</li>
              <li><strong>Cash:</strong> Cash refunds available for pickup at our store</li>
              <li><strong>Store Credit:</strong> Option to receive credit for future purchases</li>
            </ul>
          </section>

          <section className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">7. Shipping Costs</h2>
            <p className="text-gray-300 mb-4">
              Shipping costs are handled as follows:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li><strong>Defective Products:</strong> We will cover return shipping costs</li>
              <li><strong>Changed Mind:</strong> Customer is responsible for return shipping costs</li>
              <li><strong>Wrong Item Shipped:</strong> We will cover all shipping costs</li>
            </ul>
          </section>

          <section className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">8. Exchanges</h2>
            <p className="text-gray-300">
              If you prefer to exchange your product for a different item, we offer exchanges 
              of equal or greater value. Contact our support team to arrange an exchange. 
              The same return conditions apply to exchanges.
            </p>
          </section>

          <section className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">9. Warranty Claims</h2>
            <p className="text-gray-300 mb-4">
              Products covered under manufacturer warranty are handled according to the specific 
              warranty terms. Warranty claims do not constitute a refund but may result in:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Product repair</li>
              <li>Product replacement</li>
              <li>Partial refund (pro-rated based on use time)</li>
              <li>Store credit</li>
            </ul>
          </section>

          <section className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">10. Late or Missing Refunds</h2>
            <p className="text-gray-300">
              If you haven't received your refund within 14 business days, please check your 
              bank account again. Then contact your Mobile Money provider or bank. If the 
              issue persists, contact us at info@rightclickcomputerdigitals.com.
            </p>
          </section>

          <section className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">11. Contact Us</h2>
            <p className="text-gray-300 mb-4">
              If you have any questions about our Refund Policy, please contact us:
            </p>
            <div className="bg-gray-900/50 rounded-xl p-4 space-y-2 text-gray-300">
              <p><strong>RIGHTCLICK COMPUTER DIGITALS</strong></p>
              <p>📍 Accra, Ghana</p>
              <p>📞 +233 50 381 9000</p>
              <p>📧 info@rightclickcomputerdigitals.com</p>
            </div>
          </section>

          <section className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">12. Policy Changes</h2>
            <p className="text-gray-300">
              We reserve the right to modify this Refund Policy at any time. Any changes will 
              be posted on this page and will take effect immediately upon posting.
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
