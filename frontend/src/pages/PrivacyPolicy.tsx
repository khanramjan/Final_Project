import { Link } from 'react-router-dom';
import { ArrowLeftIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const PrivacyPolicy = () => {
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
          <div className="flex items-center mb-4">
            <ShieldCheckIcon className="h-10 w-10 text-emerald-600 mr-4" />
            <h1 className="text-4xl font-extrabold text-gray-900">Privacy Policy</h1>
          </div>
          <p className="text-gray-600 mb-8">Last updated: November 16, 2025</p>

          <div className="prose prose-emerald max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Introduction</h2>
            <p className="text-gray-700 mb-6">
              The Donation Management System ("we", "our", or "us") is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">2.1 Personal Information</h3>
            <p className="text-gray-700 mb-4">We collect information that you provide directly to us:</p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Name and contact information (email address, phone number)</li>
              <li>University affiliation and student/staff ID</li>
              <li>Payment information (processed securely through third-party providers)</li>
              <li>Profile information and preferences</li>
              <li>Campaign information and updates</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">2.2 Automatically Collected Information</h3>
            <p className="text-gray-700 mb-4">When you use our platform, we automatically collect:</p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Device information (IP address, browser type, operating system)</li>
              <li>Usage data (pages visited, time spent, features used)</li>
              <li>Cookies and similar tracking technologies</li>
              <li>Log data and error reports</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">We use the collected information for:</p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Processing and managing donations and campaigns</li>
              <li>Providing, maintaining, and improving our services</li>
              <li>Sending you transaction confirmations and receipts</li>
              <li>Communicating campaign updates and platform notifications</li>
              <li>Analyzing platform usage and generating analytics</li>
              <li>Detecting and preventing fraud and security threats</li>
              <li>Complying with legal obligations</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Information Sharing and Disclosure</h2>
            <p className="text-gray-700 mb-4">We may share your information with:</p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li><strong>Campaign Creators:</strong> When you donate to a campaign, your name and donation amount may be visible</li>
              <li><strong>University Administration:</strong> For verification and compliance purposes</li>
              <li><strong>Payment Processors:</strong> To process secure transactions</li>
              <li><strong>Service Providers:</strong> Who assist in platform operations</li>
              <li><strong>Legal Authorities:</strong> When required by law or to protect rights and safety</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Data Security</h2>
            <p className="text-gray-700 mb-6">
              We implement appropriate technical and organizational security measures to protect your personal information, including:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Encryption of sensitive data in transit and at rest</li>
              <li>Secure authentication and access controls</li>
              <li>Regular security audits and updates</li>
              <li>Employee training on data protection</li>
              <li>Incident response procedures</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Your Rights and Choices</h2>
            <p className="text-gray-700 mb-4">You have the right to:</p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Access and review your personal information</li>
              <li>Correct inaccurate or incomplete data</li>
              <li>Request deletion of your data (subject to legal requirements)</li>
              <li>Opt-out of marketing communications</li>
              <li>Disable cookies through your browser settings</li>
              <li>Export your data in a portable format</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Data Retention</h2>
            <p className="text-gray-700 mb-6">
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, 
              comply with legal obligations, resolve disputes, and enforce our agreements. Donation records are maintained 
              for accounting and tax purposes as required by law.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Children's Privacy</h2>
            <p className="text-gray-700 mb-6">
              Our platform is intended for university community members who are 18 years or older. We do not knowingly 
              collect personal information from individuals under 18. If we become aware of such collection, we will 
              take steps to delete the information.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Cookies and Tracking</h2>
            <p className="text-gray-700 mb-6">
              We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized 
              content. You can control cookie preferences through your browser settings, though some features may not 
              function properly if cookies are disabled.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Third-Party Links</h2>
            <p className="text-gray-700 mb-6">
              Our platform may contain links to third-party websites. We are not responsible for the privacy practices 
              of these sites. We encourage you to review their privacy policies before providing any personal information.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">11. Changes to This Policy</h2>
            <p className="text-gray-700 mb-6">
              We may update this Privacy Policy from time to time. We will notify you of significant changes by posting 
              the new policy on this page and updating the "Last updated" date. Your continued use of the platform 
              constitutes acceptance of the updated policy.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">12. Contact Us</h2>
            <p className="text-gray-700 mb-6">
              If you have questions or concerns about this Privacy Policy or our data practices, please contact us at:
            </p>
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-6 mb-6">
              <p className="text-gray-700 mb-2"><strong>Email:</strong> privacy@donationmanagement.edu</p>
              <p className="text-gray-700 mb-2"><strong>Phone:</strong> University Administration Office</p>
              <p className="text-gray-700"><strong>Address:</strong> Your University Campus</p>
            </div>

            <div className="mt-12 p-6 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl">
              <p className="text-gray-700 font-semibold">
                🔒 Your privacy is important to us. We are committed to protecting your personal information and 
                being transparent about our data practices.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
