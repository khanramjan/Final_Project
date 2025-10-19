import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, CreditCardIcon, DevicePhoneMobileIcon, BanknotesIcon, BuildingLibraryIcon } from '@heroicons/react/24/outline';

interface Campaign {
  id: number;
  title: string;
  goalAmount: number;
  currentAmount: number;
}

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign | null;
}

const DonationModal = ({ isOpen, onClose, campaign }: DonationModalProps) => {
  const [step, setStep] = useState<'amount' | 'details' | 'processing'>('amount');
  const [amount, setAmount] = useState<number>(500);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('bkash');
  const [donorName, setDonorName] = useState<string>('');
  const [donorEmail, setDonorEmail] = useState<string>('');
  const [donorPhone, setDonorPhone] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const presetAmounts = [100, 250, 500, 1000, 2500, 5000];

  const paymentMethods = [
    { id: 'bkash', name: 'bKash', icon: '💳', description: 'Mobile Banking' },
    { id: 'nagad', name: 'Nagad', icon: '📱', description: 'Mobile Banking' },
    { id: 'rocket', name: 'Rocket', icon: '🚀', description: 'Mobile Banking' },
    { id: 'card', name: 'Credit/Debit Card', icon: '💳', description: 'Visa, Mastercard' },
    { id: 'bank', name: 'Bank Transfer', icon: '🏦', description: 'Direct Transfer' },
  ];

  const handleAmountSelect = (value: number) => {
    setAmount(value);
    setCustomAmount('');
    setError('');
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setAmount(numValue);
      setError('');
    }
  };

  const handleNextStep = () => {
    if (amount < 10) {
      setError('Minimum donation amount is ৳10');
      return;
    }
    setError('');
    setStep('details');
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!isAnonymous && !donorName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (amount < 10) {
      setError('Minimum donation amount is ৳10');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/payment/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId: campaign?.id,
          amount: amount,
          paymentMethod: paymentMethod,
          donorName: isAnonymous ? 'Anonymous' : donorName,
          donorEmail: donorEmail || null,
          donorPhone: donorPhone || null,
          isAnonymous: isAnonymous,
        }),
      });

      const data = await response.json();

      if (data.success && data.gatewayUrl) {
        // Redirect to payment gateway
        window.location.href = data.gatewayUrl;
      } else {
        setError(data.message || 'Failed to initiate payment. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      setError('Network error. Please check if the backend is running.');
      setLoading(false);
    }
  };

  const resetModal = () => {
    setStep('amount');
    setAmount(500);
    setCustomAmount('');
    setPaymentMethod('bkash');
    setDonorName('');
    setDonorEmail('');
    setDonorPhone('');
    setIsAnonymous(false);
    setError('');
    setLoading(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title as="h3" className="text-2xl font-bold text-gray-900">
                    {step === 'amount' && 'Choose Donation Amount'}
                    {step === 'details' && 'Donor Information'}
                    {step === 'processing' && 'Processing...'}
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={loading}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {campaign && (
                  <div className="bg-primary-50 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-gray-900 mb-1">{campaign.title}</h4>
                    <p className="text-sm text-gray-600">
                      ৳{campaign.currentAmount.toLocaleString()} raised of ৳{campaign.goalAmount.toLocaleString()} goal
                    </p>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                {/* Step 1: Amount Selection */}
                {step === 'amount' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Select an amount or enter custom:
                      </label>
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        {presetAmounts.map((preset) => (
                          <button
                            key={preset}
                            onClick={() => handleAmountSelect(preset)}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              amount === preset && !customAmount
                                ? 'border-primary-600 bg-primary-50 text-primary-700 font-semibold'
                                : 'border-gray-300 hover:border-primary-300 text-gray-700'
                            }`}
                          >
                            ৳{preset.toLocaleString()}
                          </button>
                        ))}
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                          ৳
                        </span>
                        <input
                          type="number"
                          placeholder="Enter custom amount"
                          value={customAmount}
                          onChange={(e) => handleCustomAmountChange(e.target.value)}
                          className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          min="10"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Minimum donation: ৳10</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Payment Method:
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {paymentMethods.map((method) => (
                          <button
                            key={method.id}
                            onClick={() => setPaymentMethod(method.id)}
                            className={`p-4 rounded-lg border-2 transition-all text-left ${
                              paymentMethod === method.id
                                ? 'border-primary-600 bg-primary-50'
                                : 'border-gray-300 hover:border-primary-300'
                            }`}
                          >
                            <div className="flex items-center">
                              <span className="text-2xl mr-3">{method.icon}</span>
                              <div>
                                <p className="font-semibold text-gray-900">{method.name}</p>
                                <p className="text-xs text-gray-500">{method.description}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t">
                      <div>
                        <p className="text-sm text-gray-600">You're donating</p>
                        <p className="text-2xl font-bold text-primary-600">৳{amount.toLocaleString()}</p>
                      </div>
                      <button
                        onClick={handleNextStep}
                        className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Donor Details */}
                {step === 'details' && (
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-600">Donation Amount</p>
                          <p className="text-xl font-bold text-gray-900">৳{amount.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Payment Method</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {paymentMethods.find(m => m.id === paymentMethod)?.name}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center mb-4">
                      <input
                        type="checkbox"
                        id="anonymous"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="anonymous" className="ml-2 text-sm text-gray-700">
                        Make this donation anonymous
                      </label>
                    </div>

                    {!isAnonymous && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            value={donorName}
                            onChange={(e) => setDonorName(e.target.value)}
                            placeholder="Enter your full name"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address (Optional)
                          </label>
                          <input
                            type="email"
                            value={donorEmail}
                            onChange={(e) => setDonorEmail(e.target.value)}
                            placeholder="your@email.com"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                          <p className="text-xs text-gray-500 mt-1">For donation receipt</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number (Optional)
                          </label>
                          <input
                            type="tel"
                            value={donorPhone}
                            onChange={(e) => setDonorPhone(e.target.value)}
                            placeholder="01XXXXXXXXX"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>
                      </>
                    )}

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800">
                        🔒 <strong>Secure Payment:</strong> You'll be redirected to SSLCommerz payment gateway to complete your donation securely.
                      </p>
                    </div>

                    <div className="flex space-x-3 pt-4 border-t">
                      <button
                        onClick={() => setStep('amount')}
                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                        disabled={loading}
                      >
                        Back
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </span>
                        ) : (
                          `Donate ৳${amount.toLocaleString()}`
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default DonationModal;
