import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, HeartIcon, SparklesIcon, LockClosedIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useAppSelector } from '../store/hooks';

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
  const { user } = useAppSelector((state) => state.auth);
  const [step, setStep] = useState<'amount' | 'details'>('amount');
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

  const [paymentTab, setPaymentTab] = useState<'mobile' | 'cards' | 'netbanking'>('mobile');

  const paymentMethods = {
    mobile: [
      { id: 'bkash', name: 'bKash', logo: '💸', bgColor: 'bg-pink-50', borderColor: 'border-pink-300' },
      { id: 'nagad', name: 'Nagad', logo: '💰', bgColor: 'bg-orange-50', borderColor: 'border-orange-300' },
      { id: 'rocket', name: 'Rocket', logo: '🚀', bgColor: 'bg-purple-50', borderColor: 'border-purple-300' },
      { id: 'okwallet', name: 'OK Wallet', logo: '🔵', bgColor: 'bg-blue-50', borderColor: 'border-blue-300' },
      { id: 'cellfin', name: 'Cellfin', logo: '📱', bgColor: 'bg-teal-50', borderColor: 'border-teal-300' },
      { id: 'upay', name: 'Upay', logo: '💵', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-300' },
    ],
    cards: [
      { id: 'visa', name: 'Visa', logo: '💳', bgColor: 'bg-blue-50', borderColor: 'border-blue-300' },
      { id: 'mastercard', name: 'Mastercard', logo: '💳', bgColor: 'bg-red-50', borderColor: 'border-red-300' },
      { id: 'amex', name: 'American Express', logo: '💳', bgColor: 'bg-blue-50', borderColor: 'border-blue-300' },
      { id: 'visa-debit', name: 'Visa Debit', logo: '💳', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-300' },
      { id: 'master-debit', name: 'Master Debit', logo: '💳', bgColor: 'bg-purple-50', borderColor: 'border-purple-300' },
    ],
    netbanking: [
      { id: 'citybank', name: 'City Bank', logo: '🏦', bgColor: 'bg-blue-50', borderColor: 'border-blue-300' },
      { id: 'dbbl', name: 'DBBL', logo: '🏦', bgColor: 'bg-green-50', borderColor: 'border-green-300' },
      { id: 'brac', name: 'BRAC Bank', logo: '🏦', bgColor: 'bg-orange-50', borderColor: 'border-orange-300' },
      { id: 'eastern', name: 'Eastern Bank', logo: '🏦', bgColor: 'bg-purple-50', borderColor: 'border-purple-300' },
      { id: 'islamibank', name: 'Islami Bank', logo: '🏦', bgColor: 'bg-teal-50', borderColor: 'border-teal-300' },
      { id: 'scb', name: 'Standard Chartered', logo: '🏦', bgColor: 'bg-blue-50', borderColor: 'border-blue-300' },
    ],
  };

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
      const requestBody = {
        campaignId: campaign?.id,
        amount: amount,
        paymentMethod: paymentMethod,
        donorName: isAnonymous ? 'Anonymous' : donorName,
        donorEmail: donorEmail || null,
        donorPhone: donorPhone || null,
        isAnonymous: isAnonymous,
        userId: user?.id || null,
      };
      
      console.log('💳 Payment request body:', requestBody);
      
      const response = await fetch('http://localhost:5000/api/payment/initiate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log('💳 Payment response:', response.status, data);

      if (data.success && data.gatewayUrl) {
        window.location.href = data.gatewayUrl;
      } else {
        setError(data.message || 'Failed to initiate payment. Please try again.');
        setLoading(false);
      }
    } catch {
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
                {/* Modern Gradient Header */}
                <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-purple-700 px-8 py-6 overflow-hidden">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
                  </div>
                  <div className="relative flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                        {step === 'amount' ? (
                          <SparklesIcon className="h-7 w-7 text-white" />
                        ) : (
                          <HeartIcon className="h-7 w-7 text-white" />
                        )}
                      </div>
                      <div>
                        <Dialog.Title as="h3" className="text-2xl font-bold text-white">
                          {step === 'amount' ? 'Make a Difference' : 'Almost There!'}
                        </Dialog.Title>
                        <p className="text-primary-100 text-sm mt-1">
                          {step === 'amount' ? 'Every contribution counts' : 'Just a few more details'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleClose}
                      className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all"
                      disabled={loading}
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Campaign Info Card */}
                {campaign && (
                  <div className="mx-8 -mt-4 relative z-10">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 text-lg mb-2">{campaign.title}</h4>
                          <div className="flex items-center space-x-4 text-sm">
                            <div>
                              <span className="text-gray-500">Raised: </span>
                              <span className="font-bold text-primary-600">৳{campaign.currentAmount.toLocaleString()}</span>
                            </div>
                            <span className="text-gray-300">•</span>
                            <div>
                              <span className="text-gray-500">Goal: </span>
                              <span className="font-semibold text-gray-700">৳{campaign.goalAmount.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-primary-600">
                            {Math.round((campaign.currentAmount / campaign.goalAmount) * 100)}%
                          </div>
                          <div className="text-xs text-gray-500 uppercase tracking-wide">Funded</div>
                        </div>
                      </div>
                      <div className="mt-3 w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-primary-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((campaign.currentAmount / campaign.goalAmount) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="px-8 py-6">
                  {error && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6 flex items-start">
                      <span className="text-red-500 text-xl mr-3">⚠️</span>
                      <p className="text-sm text-red-800 font-medium">{error}</p>
                    </div>
                  )}

                  {/* Step 1: Amount */}
                  {step === 'amount' && (
                    <div className="space-y-6">
                      <div>
                        <label className="flex items-center text-base font-semibold text-gray-800 mb-4">
                          <span className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold mr-3 text-sm">1</span>
                          Choose Your Impact
                        </label>
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          {presetAmounts.map((preset) => (
                            <button
                              key={preset}
                              onClick={() => handleAmountSelect(preset)}
                              className={`relative p-5 rounded-2xl border-2 transition-all duration-200 ${
                                amount === preset && !customAmount
                                  ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-purple-50 shadow-lg scale-105'
                                  : 'border-gray-200 hover:border-primary-300 hover:shadow-md bg-white'
                              }`}
                            >
                              <div className="text-2xl font-bold text-gray-900">৳{preset.toLocaleString()}</div>
                              {amount === preset && !customAmount && (
                                <CheckCircleIcon className="absolute top-2 right-2 h-5 w-5 text-primary-600" />
                              )}
                            </button>
                          ))}
                        </div>
                        <div className="relative">
                          <span className="absolute left-5 top-1/2 transform -translate-y-1/2 text-xl font-bold text-gray-400">৳</span>
                          <input
                            type="number"
                            placeholder="Or enter custom amount"
                            value={customAmount}
                            onChange={(e) => handleCustomAmountChange(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl text-lg font-semibold focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                            min="10"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-2 flex items-center">
                          <LockClosedIcon className="h-3 w-3 mr-1" />
                          Minimum ৳10 • 100% secure payment
                        </p>
                      </div>

                      <div>
                        <label className="flex items-center text-base font-semibold text-gray-800 mb-4">
                          <span className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold mr-3 text-sm">2</span>
                          Payment Method
                        </label>
                        
                        {/* Payment Tabs */}
                        <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-4">
                          <button
                            onClick={() => setPaymentTab('mobile')}
                            className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
                              paymentTab === 'mobile'
                                ? 'bg-white text-primary-600 shadow-md'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            📱 MOBILE BANKING
                          </button>
                          <button
                            onClick={() => setPaymentTab('cards')}
                            className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
                              paymentTab === 'cards'
                                ? 'bg-white text-primary-600 shadow-md'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            💳 CARDS
                          </button>
                          <button
                            onClick={() => setPaymentTab('netbanking')}
                            className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
                              paymentTab === 'netbanking'
                                ? 'bg-white text-primary-600 shadow-md'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            🏦 NET BANKING
                          </button>
                        </div>

                        {/* Payment Options Grid */}
                        <div className="grid grid-cols-3 gap-4 max-h-72 overflow-y-auto p-2">
                          {paymentMethods[paymentTab].map((method) => (
                            <button
                              key={method.id}
                              onClick={() => setPaymentMethod(method.id)}
                              className={`relative p-6 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                                paymentMethod === method.id
                                  ? `${method.borderColor} ${method.bgColor} shadow-lg ring-2 ring-primary-300`
                                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md bg-white'
                              }`}
                            >
                              <div className="flex flex-col items-center justify-center space-y-2">
                                <div className="text-4xl">
                                  {method.logo}
                                </div>
                                <div className="text-sm font-bold text-gray-800 text-center">{method.name}</div>
                              </div>
                              {paymentMethod === method.id && (
                                <div className="absolute top-2 right-2 h-6 w-6 bg-primary-600 rounded-full flex items-center justify-center">
                                  <CheckCircleIcon className="h-5 w-5 text-white" />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-6 border-t-2 border-gray-100">
                        <div className="flex items-center space-x-4">
                          <div className="h-16 w-16 bg-gradient-to-br from-primary-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                            <HeartIcon className="h-8 w-8 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Your Donation</p>
                            <p className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                              ৳{amount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleNextStep}
                          className="px-8 py-4 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-2xl font-bold hover:from-primary-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                          Continue →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Details */}
                  {step === 'details' && (
                    <div className="space-y-6">
                      <div className="bg-gradient-to-r from-primary-50 to-purple-50 rounded-2xl p-5 border-2 border-primary-100">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Amount</p>
                            <p className="text-2xl font-bold text-gray-900">৳{amount.toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-600">Method</p>
                            <p className="text-lg font-bold text-gray-900 capitalize">
                              {(() => {
                                const allMethods = [...paymentMethods.mobile, ...paymentMethods.cards, ...paymentMethods.netbanking];
                                const selected = allMethods.find(m => m.id === paymentMethod);
                                return selected ? `${selected.logo} ${selected.name}` : paymentMethod;
                              })()}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center p-4 bg-purple-50 rounded-2xl border-2 border-purple-100">
                        <input
                          type="checkbox"
                          id="anonymous"
                          checked={isAnonymous}
                          onChange={(e) => setIsAnonymous(e.target.checked)}
                          className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor="anonymous" className="ml-3 text-sm font-semibold text-gray-700">
                          🎭 Make this donation anonymous
                        </label>
                      </div>

                      {!isAnonymous && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                            <input
                              type="text"
                              value={donorName}
                              onChange={(e) => setDonorName(e.target.value)}
                              placeholder="Enter your name"
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email (Optional)</label>
                            <input
                              type="email"
                              value={donorEmail}
                              onChange={(e) => setDonorEmail(e.target.value)}
                              placeholder="your@email.com"
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                            />
                            <p className="text-xs text-gray-500 mt-1">For donation receipt</p>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone (Optional)</label>
                            <input
                              type="tel"
                              value={donorPhone}
                              onChange={(e) => setDonorPhone(e.target.value)}
                              placeholder="01XXXXXXXXX"
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                            />
                          </div>
                        </div>
                      )}

                      <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 flex items-start">
                        <LockClosedIcon className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-green-900">Secure Payment</p>
                          <p className="text-xs text-green-700 mt-1">
                            You'll be redirected to SSLCommerz payment gateway
                          </p>
                        </div>
                      </div>

                      <div className="flex space-x-3 pt-4">
                        <button
                          onClick={() => setStep('amount')}
                          className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                          disabled={loading}
                        >
                          ← Back
                        </button>
                        <button
                          onClick={handleSubmit}
                          disabled={loading}
                          className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-bold hover:from-primary-700 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50"
                        >
                          {loading ? '⏳ Processing...' : `Donate ৳${amount.toLocaleString()}`}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default DonationModal;
