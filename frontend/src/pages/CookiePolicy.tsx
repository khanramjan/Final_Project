import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link 
          to="/" 
          className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-8 font-semibold"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Home
        </Link>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-green-lg p-8 md:p-12 border border-emerald-200">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Cookie Policy</h1>
          <p className="text-gray-600 mb-8">Last updated: November 16, 2025</p>

          <div className="prose prose-emerald max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. What Are Cookies?</h2>
            <p className="text-gray-700 mb-6">
              Cookies are small text files that are placed on your device when you visit our website. They help us provide 
              you with a better experience by remembering your preferences and understanding how you use our platform.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. How We Use Cookies</h2>
            <p className="text-gray-700 mb-4">We use cookies for the following purposes:</p>
            
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">2.1 Essential Cookies</h3>
            <p className="text-gray-700 mb-4">These cookies are necessary for the platform to function:</p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Authentication and session management</li>
              <li>Security and fraud prevention</li>
              <li>Load balancing and performance</li>
              <li>Shopping cart and transaction processing</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">2.2 Performance Cookies</h3>
            <p className="text-gray-700 mb-4">These help us understand how visitors use our platform:</p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Analyzing page visits and navigation patterns</li>
              <li>Measuring platform performance</li>
              <li>Identifying and fixing errors</li>
              <li>Testing new features</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">2.3 Functional Cookies</h3>
            <p className="text-gray-700 mb-4">These enhance your experience:</p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Remembering your preferences and settings</li>
              <li>Personalizing content and recommendations</li>
              <li>Saving your language preference</li>
              <li>Maintaining your login session</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">2.4 Analytics Cookies</h3>
            <p className="text-gray-700 mb-4">These help us improve our services:</p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Understanding user behavior and trends</li>
              <li>Measuring campaign effectiveness</li>
              <li>Optimizing user experience</li>
              <li>Generating usage statistics</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Types of Cookies We Use</h2>
            
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-6 mb-6">
              <h4 className="font-bold text-gray-900 mb-2">Session Cookies</h4>
              <p className="text-gray-700">Temporary cookies that expire when you close your browser</p>
            </div>

            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-6 mb-6">
              <h4 className="font-bold text-gray-900 mb-2">Persistent Cookies</h4>
              <p className="text-gray-700">Remain on your device for a set period or until you delete them</p>
            </div>

            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-6 mb-6">
              <h4 className="font-bold text-gray-900 mb-2">First-Party Cookies</h4>
              <p className="text-gray-700">Set directly by our platform</p>
            </div>

            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-6 mb-6">
              <h4 className="font-bold text-gray-900 mb-2">Third-Party Cookies</h4>
              <p className="text-gray-700">Set by external services like analytics providers</p>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Managing Cookies</h2>
            <p className="text-gray-700 mb-4">You can control and manage cookies in several ways:</p>
            
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">4.1 Browser Settings</h3>
            <p className="text-gray-700 mb-4">Most browsers allow you to:</p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>View and delete cookies</li>
              <li>Block third-party cookies</li>
              <li>Block cookies from specific websites</li>
              <li>Block all cookies</li>
              <li>Delete all cookies when you close your browser</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">4.2 Platform Settings</h3>
            <p className="text-gray-700 mb-6">
              You can manage your cookie preferences through our platform settings. However, disabling certain cookies 
              may affect the functionality and features available to you.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Third-Party Cookies</h2>
            <p className="text-gray-700 mb-4">We use services from trusted third parties that may set cookies:</p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li><strong>Google Analytics:</strong> For website analytics and performance measurement</li>
              <li><strong>Payment Processors:</strong> For secure transaction processing</li>
              <li><strong>Content Delivery Networks:</strong> For faster content delivery</li>
            </ul>
            <p className="text-gray-700 mb-6">
              These third parties have their own privacy policies and cookie policies. We recommend reviewing their 
              policies to understand how they use cookies.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Cookie Retention</h2>
            <p className="text-gray-700 mb-6">
              Different cookies have different lifespans. Session cookies are deleted when you close your browser, 
              while persistent cookies remain for a specified period (typically from a few days to several years) 
              or until you manually delete them.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Updates to This Policy</h2>
            <p className="text-gray-700 mb-6">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for legal 
              and regulatory reasons. Please check this page regularly for updates.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Contact Us</h2>
            <p className="text-gray-700 mb-6">
              If you have questions about our use of cookies, please contact us through our support channels or 
              at your university's administration office.
            </p>

            <div className="mt-12 p-6 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl">
              <p className="text-gray-700 font-semibold mb-4">
                🍪 Cookie Notice
              </p>
              <p className="text-gray-700">
                By continuing to use our platform, you consent to our use of cookies as described in this policy. 
                You can change your cookie settings at any time through your browser or platform preferences.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
