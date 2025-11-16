import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const TermsOfService = () => {
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
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-gray-600 mb-8">Last updated: November 16, 2025</p>

          <div className="prose prose-emerald max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-6">
              By accessing and using the Donation Management System, you accept and agree to be bound by the terms and provisions of this agreement. 
              If you do not agree to these terms, please do not use our platform.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Use of Platform</h2>
            <p className="text-gray-700 mb-6">
              This platform is designed for university community members to create and manage donation campaigns for legitimate causes. 
              You agree to use this service only for lawful purposes and in accordance with university guidelines.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. User Accounts</h2>
            <p className="text-gray-700 mb-4">
              When you create an account with us, you must provide accurate, complete, and current information. 
              You are responsible for:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use</li>
              <li>Ensuring your contact information is up to date</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Donations</h2>
            <p className="text-gray-700 mb-4">
              All donations made through this platform are:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Voluntary and non-refundable unless required by law</li>
              <li>Subject to verification and approval processes</li>
              <li>Processed securely through authorized payment gateways</li>
              <li>Acknowledged with automated receipts for record-keeping</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Campaign Creation</h2>
            <p className="text-gray-700 mb-4">
              Campaign creators agree to:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Provide accurate and truthful information about their campaigns</li>
              <li>Use donated funds solely for stated campaign purposes</li>
              <li>Provide regular updates on campaign progress</li>
              <li>Comply with all university policies and applicable laws</li>
              <li>Not misrepresent the purpose or beneficiary of the campaign</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Prohibited Activities</h2>
            <p className="text-gray-700 mb-4">
              You may not use this platform to:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Engage in fraudulent or deceptive practices</li>
              <li>Violate any local, state, national, or international law</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Upload malicious code or attempt to breach security</li>
              <li>Create campaigns for illegal purposes or activities</li>
              <li>Impersonate another person or organization</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Data Protection</h2>
            <p className="text-gray-700 mb-6">
              We take data protection seriously. Your personal information is handled in accordance with our Privacy Policy. 
              We implement appropriate security measures to protect your data from unauthorized access, alteration, or disclosure.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Intellectual Property</h2>
            <p className="text-gray-700 mb-6">
              The platform and its original content, features, and functionality are owned by the university and are protected by 
              international copyright, trademark, and other intellectual property laws.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Termination</h2>
            <p className="text-gray-700 mb-6">
              We reserve the right to terminate or suspend your account and access to the platform immediately, without prior notice, 
              for conduct that violates these Terms of Service or is harmful to other users, us, or third parties.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Limitation of Liability</h2>
            <p className="text-gray-700 mb-6">
              In no event shall the Donation Management System, its directors, employees, or agents be liable for any indirect, 
              incidental, special, consequential, or punitive damages arising from your use of the platform.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">11. Changes to Terms</h2>
            <p className="text-gray-700 mb-6">
              We reserve the right to modify these terms at any time. We will notify users of any changes by updating the 
              "Last updated" date. Your continued use of the platform after changes constitutes acceptance of the new terms.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">12. Contact Information</h2>
            <p className="text-gray-700 mb-6">
              If you have any questions about these Terms of Service, please contact us through the platform's support channels 
              or at your university's administration office.
            </p>

            <div className="mt-12 p-6 bg-emerald-50 border-2 border-emerald-200 rounded-xl">
              <p className="text-gray-700 font-semibold">
                By using the Donation Management System, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
