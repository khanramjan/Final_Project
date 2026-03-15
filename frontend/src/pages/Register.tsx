import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { register } from '../store/slices/authSlice';
import { 
  HeartIcon, 
  UsersIcon, 
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  DocumentIcon,
  PhotoIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline';

type UserType = 'donor' | 'volunteer';

const Register = () => {
  const [userType, setUserType] = useState<UserType>('donor');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    organization: '', // for volunteers
    skills: '', // for volunteers
    interests: '', // for donors
    agreeToTerms: false
  });
  const [volunteerFiles, setVolunteerFiles] = useState({
    nidPhoto: null as File | null,
    volunteerPhoto: null as File | null,
    utilityBill: null as File | null
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: keyof typeof volunteerFiles) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, [fileType]: 'File size must be less than 5MB' }));
        return;
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, [fileType]: 'Only JPG, PNG, and PDF files are allowed' }));
        return;
      }

      setVolunteerFiles(prev => ({ ...prev, [fileType]: file }));
      // Clear error
      if (errors[fileType]) {
        setErrors(prev => ({ ...prev, [fileType]: '' }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms and conditions';

    // Type-specific validations
    if (userType === 'volunteer') {
      if (!formData.organization.trim()) newErrors.organization = 'Organization is required for volunteers';
      if (!formData.skills.trim()) newErrors.skills = 'Skills/expertise is required for volunteers';
      
      // File validations for volunteers
      if (!volunteerFiles.nidPhoto) newErrors.nidPhoto = 'NID photo is required for volunteers';
      if (!volunteerFiles.volunteerPhoto) newErrors.volunteerPhoto = 'Your photo is required for volunteers';
      if (!volunteerFiles.utilityBill) newErrors.utilityBill = 'Utility bill is required for volunteers';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      // Prepare registration data
      const registrationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        userType: userType,
        phone: formData.phone,
        address: formData.address,
        ...(userType === 'volunteer' && {
          organization: formData.organization,
          skills: formData.skills,
          nidPhoto: volunteerFiles.nidPhoto || undefined,
          volunteerPhoto: volunteerFiles.volunteerPhoto || undefined,
          utilityBill: volunteerFiles.utilityBill || undefined
        }),
        ...(userType === 'donor' && {
          interests: formData.interests
        })
      };

      await dispatch(register(registrationData)).unwrap();
      navigate('/dashboard');
      
    } catch (error) {
      const message = (error as { message?: string })?.message;
      setErrors({ general: message || 'Registration failed. Please try again.' });
    }
  };

  return (
    <div className="min-h-screen bg-luxury-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <div className="h-10 w-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                <HeartIcon className="h-6 w-6 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Donation Management System
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="text-gray-600 hover:text-gray-900 px-4 py-2 text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Registration Content */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div>
          <div className="flex justify-center">
            <div className="h-12 w-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
              <HeartIcon className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join Donation Management System
          </p>
          <p className="mt-1 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Sign in here
            </Link>
          </p>
        </div>

        {/* User Type Selection */}
        <div className="space-y-4">
          <p className="text-sm font-medium text-gray-700">I want to register as:</p>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setUserType('donor')}
              className={`relative p-4 rounded-lg border-2 transition-all ${
                userType === 'donor'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex flex-col items-center space-y-2">
                <HeartIcon className={`h-8 w-8 ${userType === 'donor' ? 'text-primary-600' : 'text-gray-400'}`} />
                <span className={`font-medium ${userType === 'donor' ? 'text-primary-600' : 'text-gray-600'}`}>
                  Donor
                </span>
                <span className="text-xs text-gray-500 text-center">
                  Make donations and support causes
                </span>
              </div>
              {userType === 'donor' && (
                <CheckCircleIcon className="absolute top-2 right-2 h-5 w-5 text-primary-600" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setUserType('volunteer')}
              className={`relative p-4 rounded-lg border-2 transition-all ${
                userType === 'volunteer'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex flex-col items-center space-y-2">
                <UsersIcon className={`h-8 w-8 ${userType === 'volunteer' ? 'text-primary-600' : 'text-gray-400'}`} />
                <span className={`font-medium ${userType === 'volunteer' ? 'text-primary-600' : 'text-gray-600'}`}>
                  Volunteer
                </span>
                <span className="text-xs text-gray-500 text-center">
                  Offer time and skills to help
                </span>
              </div>
              {userType === 'volunteer' && (
                <CheckCircleIcon className="absolute top-2 right-2 h-5 w-5 text-primary-600" />
              )}
            </button>
          </div>
        </div>

        {/* Registration Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {(errors.general || error) && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{errors.general || error}</div>
            </div>
          )}

          <div className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                    errors.firstName ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                    errors.lastName ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleInputChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                  errors.phone ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                      errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <textarea
                id="address"
                name="address"
                rows={3}
                value={formData.address}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Type-specific fields */}
            {userType === 'volunteer' && (
              <>
                <div>
                  <label htmlFor="organization" className="block text-sm font-medium text-gray-700">
                    Organization/Institution
                  </label>
                  <input
                    id="organization"
                    name="organization"
                    type="text"
                    required
                    value={formData.organization}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                      errors.organization ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.organization && <p className="mt-1 text-sm text-red-600">{errors.organization}</p>}
                </div>
                <div>
                  <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
                    Skills & Expertise
                  </label>
                  <textarea
                    id="skills"
                    name="skills"
                    rows={3}
                    required
                    value={formData.skills}
                    onChange={handleInputChange}
                    placeholder="Describe your skills, expertise, and how you'd like to help..."
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                      errors.skills ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.skills && <p className="mt-1 text-sm text-red-600">{errors.skills}</p>}
                </div>

                {/* Document Upload Section for Volunteers */}
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                  <h3 className="text-sm font-medium text-gray-900 flex items-center">
                    <DocumentIcon className="h-5 w-5 mr-2 text-primary-600" />
                    Required Documents
                  </h3>
                  <p className="text-xs text-gray-600">
                    Please upload the following documents for verification (Max 5MB each, JPG/PNG/PDF)
                  </p>

                  {/* NID Photo */}
                  <div>
                    <label htmlFor="nidPhoto" className="block text-sm font-medium text-gray-700">
                      National ID Photo <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 flex items-center">
                      <input
                        id="nidPhoto"
                        name="nidPhoto"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileChange(e, 'nidPhoto')}
                        className="hidden"
                      />
                      <label
                        htmlFor="nidPhoto"
                        className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus-within:ring-2 focus-within:ring-primary-500"
                      >
                        <PhotoIcon className="h-5 w-5 mr-2" />
                        Choose File
                      </label>
                      {volunteerFiles.nidPhoto && (
                        <span className="ml-3 text-sm text-gray-600 flex items-center">
                          <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                          {volunteerFiles.nidPhoto.name}
                        </span>
                      )}
                    </div>
                    {errors.nidPhoto && <p className="mt-1 text-sm text-red-600">{errors.nidPhoto}</p>}
                  </div>

                  {/* Volunteer Photo */}
                  <div>
                    <label htmlFor="volunteerPhoto" className="block text-sm font-medium text-gray-700">
                      Your Photo <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 flex items-center">
                      <input
                        id="volunteerPhoto"
                        name="volunteerPhoto"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'volunteerPhoto')}
                        className="hidden"
                      />
                      <label
                        htmlFor="volunteerPhoto"
                        className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus-within:ring-2 focus-within:ring-primary-500"
                      >
                        <PhotoIcon className="h-5 w-5 mr-2" />
                        Choose File
                      </label>
                      {volunteerFiles.volunteerPhoto && (
                        <span className="ml-3 text-sm text-gray-600 flex items-center">
                          <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                          {volunteerFiles.volunteerPhoto.name}
                        </span>
                      )}
                    </div>
                    {errors.volunteerPhoto && <p className="mt-1 text-sm text-red-600">{errors.volunteerPhoto}</p>}
                  </div>

                  {/* Utility Bill */}
                  <div>
                    <label htmlFor="utilityBill" className="block text-sm font-medium text-gray-700">
                      Utility Bill (Address Verification) <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 flex items-center">
                      <input
                        id="utilityBill"
                        name="utilityBill"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileChange(e, 'utilityBill')}
                        className="hidden"
                      />
                      <label
                        htmlFor="utilityBill"
                        className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus-within:ring-2 focus-within:ring-primary-500"
                      >
                        <PaperClipIcon className="h-5 w-5 mr-2" />
                        Choose File
                      </label>
                      {volunteerFiles.utilityBill && (
                        <span className="ml-3 text-sm text-gray-600 flex items-center">
                          <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                          {volunteerFiles.utilityBill.name}
                        </span>
                      )}
                    </div>
                    {errors.utilityBill && <p className="mt-1 text-sm text-red-600">{errors.utilityBill}</p>}
                  </div>
                </div>
              </>
            )}

            {userType === 'donor' && (
              <div>
                <label htmlFor="interests" className="block text-sm font-medium text-gray-700">
                  Donation Interests (Optional)
                </label>
                <textarea
                  id="interests"
                  name="interests"
                  rows={2}
                  value={formData.interests}
                  onChange={handleInputChange}
                  placeholder="What causes or types of organizations are you interested in supporting?"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            )}

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="agreeToTerms" className="text-gray-700">
                  I agree to the{' '}
                  <a href="#" className="text-primary-600 hover:text-primary-500">
                    Terms and Conditions
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-primary-600 hover:text-primary-500">
                    Privacy Policy
                  </a>
                </label>
                {errors.agreeToTerms && <p className="mt-1 text-red-600">{errors.agreeToTerms}</p>}
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center btn-primary py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : `Register as ${userType === 'donor' ? 'Donor' : 'Volunteer'}`}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
