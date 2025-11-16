import { Link } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  BookOpenIcon, 
  RocketLaunchIcon,
  HeartIcon,
  UserGroupIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  BellIcon
} from '@heroicons/react/24/outline';

const Documentation = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link 
          to="/" 
          className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-8 font-semibold"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Home
        </Link>

        <div className="mb-12">
          <div className="flex items-center mb-4">
            <BookOpenIcon className="h-12 w-12 text-emerald-600 mr-4" />
            <h1 className="text-5xl font-extrabold text-gray-900">Documentation</h1>
          </div>
          <p className="text-xl text-gray-700">
            Complete guide to using the Donation Management System
          </p>
        </div>

        {/* Quick Start Guide */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-green-lg p-8 mb-8 border border-emerald-200">
          <div className="flex items-center mb-6">
            <RocketLaunchIcon className="h-8 w-8 text-emerald-600 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">Quick Start Guide</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-xl border-2 border-emerald-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">For Donors</h3>
              <ol className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="font-bold text-emerald-600 mr-3">1.</span>
                  <span><Link to="/register" className="text-emerald-600 hover:underline font-semibold">Create an account</Link> or <Link to="/login" className="text-emerald-600 hover:underline font-semibold">sign in</Link></span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-emerald-600 mr-3">2.</span>
                  <span><Link to="/campaigns" className="text-emerald-600 hover:underline font-semibold">Browse campaigns</Link> and find causes you care about</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-emerald-600 mr-3">3.</span>
                  <span>Click "Donate" and enter your donation amount</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-emerald-600 mr-3">4.</span>
                  <span>Complete payment securely through our payment gateway</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-emerald-600 mr-3">5.</span>
                  <span>Receive instant confirmation and receipt via email</span>
                </li>
              </ol>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-teal-50 p-6 rounded-xl border-2 border-green-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">For Campaign Creators</h3>
              <ol className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="font-bold text-green-600 mr-3">1.</span>
                  <span><Link to="/register" className="text-green-600 hover:underline font-semibold">Sign up</Link> and verify your university email</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-green-600 mr-3">2.</span>
                  <span>Navigate to your dashboard and click "Create Campaign"</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-green-600 mr-3">3.</span>
                  <span>Fill in campaign details: title, description, goal, duration</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-green-600 mr-3">4.</span>
                  <span>Upload compelling images and set campaign category</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-green-600 mr-3">5.</span>
                  <span>Submit for review and await admin approval</span>
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* Features Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="card-green p-6">
            <HeartIcon className="h-10 w-10 text-emerald-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-3">Donation Processing</h3>
            <p className="text-gray-700 mb-4">
              Secure, fast donation processing with multiple payment options including credit/debit cards, mobile banking, and online payment gateways.
            </p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>✓ SSL/TLS encryption</li>
              <li>✓ Instant confirmation</li>
              <li>✓ Automated receipts</li>
              <li>✓ Multiple currencies</li>
            </ul>
          </div>

          <div className="card-green p-6">
            <UserGroupIcon className="h-10 w-10 text-emerald-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-3">Campaign Management</h3>
            <p className="text-gray-700 mb-4">
              Create and manage fundraising campaigns with goal tracking, progress monitoring, and donor engagement tools.
            </p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>✓ Campaign dashboard</li>
              <li>✓ Real-time progress</li>
              <li>✓ Donor list management</li>
              <li>✓ Update posting</li>
            </ul>
          </div>

          <div className="card-green p-6">
            <ChartBarIcon className="h-10 w-10 text-emerald-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-3">Analytics & Reports</h3>
            <p className="text-gray-700 mb-4">
              Comprehensive analytics dashboard with donation trends, campaign performance, and detailed financial reports.
            </p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>✓ Visual charts</li>
              <li>✓ Export reports</li>
              <li>✓ Donation history</li>
              <li>✓ Performance metrics</li>
            </ul>
          </div>

          <div className="card-green p-6">
            <ShieldCheckIcon className="h-10 w-10 text-emerald-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-3">Security & Privacy</h3>
            <p className="text-gray-700 mb-4">
              Bank-level security with encrypted data storage, secure authentication, and full GDPR compliance.
            </p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>✓ Two-factor authentication</li>
              <li>✓ Data encryption</li>
              <li>✓ Privacy controls</li>
              <li>✓ Secure backups</li>
            </ul>
          </div>

          <div className="card-green p-6">
            <CreditCardIcon className="h-10 w-10 text-emerald-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-3">Payment Methods</h3>
            <p className="text-gray-700 mb-4">
              Support for multiple payment methods including cards, mobile wallets, and bank transfers.
            </p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>✓ Credit/Debit cards</li>
              <li>✓ bKash & Nagad</li>
              <li>✓ Bank transfer</li>
              <li>✓ International payments</li>
            </ul>
          </div>

          <div className="card-green p-6">
            <BellIcon className="h-10 w-10 text-emerald-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-3">Notifications</h3>
            <p className="text-gray-700 mb-4">
              Stay updated with real-time notifications for donations, campaign milestones, and important updates.
            </p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>✓ Email notifications</li>
              <li>✓ SMS alerts</li>
              <li>✓ In-app messages</li>
              <li>✓ Custom preferences</li>
            </ul>
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-green-lg p-8 mb-8 border border-emerald-200">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div className="border-l-4 border-emerald-500 pl-6 py-2">
              <h3 className="text-lg font-bold text-gray-900 mb-2">How do I create a campaign?</h3>
              <p className="text-gray-700">
                After signing in, navigate to your dashboard and click "Create Campaign". Fill in all required information including title, description, goal amount, end date, and category. Upload images to make your campaign more appealing. Submit for admin approval.
              </p>
            </div>

            <div className="border-l-4 border-emerald-500 pl-6 py-2">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Is my donation secure?</h3>
              <p className="text-gray-700">
                Yes! All donations are processed through secure, PCI-compliant payment gateways with SSL/TLS encryption. We never store your complete payment card information on our servers.
              </p>
            </div>

            <div className="border-l-4 border-emerald-500 pl-6 py-2">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Can I get a receipt for tax purposes?</h3>
              <p className="text-gray-700">
                Yes! You'll receive an automated receipt via email immediately after your donation is processed. You can also download receipts anytime from your donation history in your dashboard.
              </p>
            </div>

            <div className="border-l-4 border-emerald-500 pl-6 py-2">
              <h3 className="text-lg font-bold text-gray-900 mb-2">How long does it take for a campaign to be approved?</h3>
              <p className="text-gray-700">
                Campaign approval typically takes 1-2 business days. Our admin team reviews each campaign to ensure it meets university guidelines and platform standards.
              </p>
            </div>

            <div className="border-l-4 border-emerald-500 pl-6 py-2">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Can I edit my campaign after it's approved?</h3>
              <p className="text-gray-700">
                Yes, you can edit campaign descriptions and add updates. However, changes to goal amount or end date require admin approval to maintain transparency with donors.
              </p>
            </div>

            <div className="border-l-4 border-emerald-500 pl-6 py-2">
              <h3 className="text-lg font-bold text-gray-900 mb-2">What payment methods are accepted?</h3>
              <p className="text-gray-700">
                We accept Visa, Mastercard, American Express, mobile wallets (bKash, Nagad), and bank transfers. International donors can also contribute using their local payment methods.
              </p>
            </div>

            <div className="border-l-4 border-emerald-500 pl-6 py-2">
              <h3 className="text-lg font-bold text-gray-900 mb-2">How do I withdraw collected funds?</h3>
              <p className="text-gray-700">
                Campaign creators can request fund withdrawal from their dashboard. Provide your bank account details and funds will be transferred within 3-5 business days after verification.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl shadow-green-xl p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Need More Help?</h2>
          <p className="text-emerald-50 text-lg mb-6">
            Our support team is here to assist you with any questions or issues.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:khanramjan001@gmail.com"
              className="bg-white text-emerald-700 px-8 py-3 rounded-xl font-bold hover:bg-emerald-50 transition-colors"
            >
              📧 Email Support
            </a>
            <a 
              href="https://wa.me/8801518686883"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-800 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-900 transition-colors"
            >
              💬 WhatsApp Chat
            </a>
          </div>
          <div className="mt-6 text-emerald-100 text-sm">
            <p>Email: khanramjan001@gmail.com</p>
            <p>WhatsApp: +880 1518-686883</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation;
