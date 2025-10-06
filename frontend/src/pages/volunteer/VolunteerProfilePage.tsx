import { useState, useEffect } from 'react';
import {
  UserIcon,
  MapPinIcon,
  CalendarDaysIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  TrashIcon,
  BellIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import volunteerService from '../../services/volunteerService';
import type {
  VolunteerProfile,
  CreateVolunteerProfile,
  UpdateVolunteerProfile,
  CertificationDto,
  TimeSlotPreferences,
} from '../../types/volunteer.types';

export default function VolunteerProfilePage() {
  const [profile, setProfile] = useState<VolunteerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [formData, setFormData] = useState<UpdateVolunteerProfile>({
    skills: [],
    interests: [],
    experienceLevel: 'beginner',
    yearsOfExperience: 0,
    certifications: [],
    availableDays: [],
    preferredTimeSlots: { morning: false, afternoon: false, evening: false },
    hoursPerWeek: 10,
    location: '',
    latitude: undefined,
    longitude: undefined,
    emergencyContactName: '',
    emergencyContactPhone: '',
    acceptSmsNotifications: true,
    acceptEmailNotifications: true,
    isProfilePublic: true,
  });

  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');
  
  // Certification form
  const [showCertForm, setShowCertForm] = useState(false);
  const [newCert, setNewCert] = useState<CertificationDto>({
    name: '',
    issuedBy: '',
    issuedDate: '',
    expiryDate: '',
    certificateNumber: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await volunteerService.getMyProfile();
      setProfile(data);
      if (data) {
        populateFormData(data);
      } else {
        setIsEditing(true); // New profile, start in edit mode
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load profile';
      console.error('Error fetching profile:', err);
      
      // If profile not found, enable edit mode to create new profile (this is expected for new volunteers)
      if (errorMessage.toLowerCase().includes('not found') || 
          errorMessage.includes('404') || 
          errorMessage.toLowerCase().includes('volunteer profile not found')) {
        setIsEditing(true);
        setError(null); // Clear error since this is expected for new users
      } else {
        // For other errors, show the error message
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const populateFormData = (p: VolunteerProfile) => {
    setFormData({
      skills: p.skills || [],
      interests: p.interests || [],
      experienceLevel: p.experienceLevel || 'beginner',
      yearsOfExperience: p.yearsOfExperience || 0,
      certifications: p.certifications || [],
      availableDays: p.availableDays || [],
      preferredTimeSlots: p.preferredTimeSlots || { morning: false, afternoon: false, evening: false },
      hoursPerWeek: p.hoursPerWeek || 10,
      location: p.location || '',
      latitude: p.latitude,
      longitude: p.longitude,
      emergencyContactName: p.emergencyContactName || '',
      emergencyContactPhone: p.emergencyContactPhone || '',
      acceptSmsNotifications: p.acceptSmsNotifications ?? true,
      acceptEmailNotifications: p.acceptEmailNotifications ?? true,
      isProfilePublic: p.isProfilePublic ?? true,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'number') {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDayToggle = (day: string) => {
    setFormData((prev) => {
      const days = prev.availableDays || [];
      if (days.includes(day)) {
        return { ...prev, availableDays: days.filter((d) => d !== day) };
      } else {
        return { ...prev, availableDays: [...days, day] };
      }
    });
  };

  const handleTimeSlotChange = (slot: keyof TimeSlotPreferences) => {
    setFormData((prev) => ({
      ...prev,
      preferredTimeSlots: {
        ...prev.preferredTimeSlots!,
        [slot]: !prev.preferredTimeSlots![slot],
      },
    }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills?.includes(newSkill.trim())) {
      setFormData((prev) => ({ ...prev, skills: [...(prev.skills || []), newSkill.trim()] }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData((prev) => ({ ...prev, skills: prev.skills?.filter((s) => s !== skill) }));
  };

  const addInterest = () => {
    if (newInterest.trim() && !formData.interests?.includes(newInterest.trim())) {
      setFormData((prev) => ({ ...prev, interests: [...(prev.interests || []), newInterest.trim()] }));
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setFormData((prev) => ({ ...prev, interests: prev.interests?.filter((i) => i !== interest) }));
  };

  const addCertification = () => {
    if (newCert.name.trim() && newCert.issuedBy.trim()) {
      setFormData((prev) => ({
        ...prev,
        certifications: [...(prev.certifications || []), newCert],
      }));
      setNewCert({ name: '', issuedBy: '', issuedDate: '', expiryDate: '', certificateNumber: '' });
      setShowCertForm(false);
    }
  };

  const removeCertification = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications?.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      if (profile) {
        // Update existing profile
        await volunteerService.updateProfile(formData);
        setSuccess('Profile updated successfully!');
      } else {
        // Create new profile
        const createData: CreateVolunteerProfile = {
          ...formData,
          yearsOfExperience: formData.yearsOfExperience || 0,
          hoursPerWeek: formData.hoursPerWeek || 10,
        };
        await volunteerService.createProfile(createData);
        setSuccess('Profile created successfully!');
      }

      await fetchProfile();
      setIsEditing(false);

      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
      console.error('Error saving profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    if (profile) {
      populateFormData(profile);
      setIsEditing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Volunteer Profile</h1>
            <p className="mt-2 text-gray-600">
              {profile ? 'Manage your volunteer profile and preferences' : 'Create your volunteer profile'}
            </p>
          </div>
          {profile && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <XCircleIcon className="h-5 w-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Stats (if exists) */}
          {profile && (
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              {/* Rank Badge and Progress */}
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`inline-flex items-center px-5 py-3 rounded-full font-bold border-2 shadow-lg ${volunteerService.getRankBadgeColor(profile.rank)}`}>
                    <span className="text-3xl mr-3">{volunteerService.getRankIcon(profile.rank)}</span>
                    <span className="text-xl">{profile.rank} Rank</span>
                  </div>
                  {profile.lastRankUpgradeAt && (
                    <div className="text-sm text-blue-100">
                      <p>Last upgraded:</p>
                      <p className="font-semibold">{new Date(profile.lastRankUpgradeAt).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
                
                {/* Rank Progress */}
                {profile.rank !== 'Platinum' && (
                  <div className="w-64">
                    {(() => {
                      const progress = volunteerService.getRankProgress(profile.completedCampaigns, profile.rank);
                      const nextRank = volunteerService.getNextRank(profile.rank);
                      const remaining = nextRank.campaignsNeeded - profile.completedCampaigns;
                      return (
                        <>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-blue-100">Progress to {nextRank.rank}</span>
                            <span className="text-white font-bold">{progress.toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-blue-800 rounded-full h-3">
                            <div 
                              className="bg-white h-3 rounded-full transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-blue-100 mt-1 text-right">
                            {remaining} more {remaining === 1 ? 'campaign' : 'campaigns'}
                          </p>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <p className="text-blue-100 text-sm">Hours</p>
                  <p className="text-2xl font-bold">{profile.totalHoursVolunteered}</p>
                </div>
                <div className="text-center">
                  <p className="text-blue-100 text-sm">Tasks</p>
                  <p className="text-2xl font-bold">{profile.totalTasksCompleted}</p>
                </div>
                <div className="text-center">
                  <p className="text-blue-100 text-sm">Completed</p>
                  <p className="text-2xl font-bold">{profile.completedCampaigns}</p>
                  <p className="text-xs text-blue-100 mt-1">For rank upgrade</p>
                </div>
                <div className="text-center">
                  <p className="text-blue-100 text-sm">Rating</p>
                  <p className="text-2xl font-bold">{profile.rating.toFixed(1)} ⭐</p>
                </div>
              </div>
              {profile.isVerified && (
                <div className="mt-4 flex items-center justify-center gap-2 bg-white bg-opacity-20 rounded-lg py-2">
                  <ShieldCheckIcon className="h-5 w-5" />
                  <span className="font-medium">Verified Volunteer</span>
                </div>
              )}
            </div>
          )}

          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <UserIcon className="h-6 w-6 text-blue-600" />
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profile && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={profile.userName || 'N/A'}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="text"
                      value={profile.userEmail || 'N/A'}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
                <select
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="experienced">Experienced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                <input
                  type="number"
                  name="yearsOfExperience"
                  value={formData.yearsOfExperience}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  min="0"
                  max="50"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <MapPinIcon className="h-6 w-6 text-blue-600" />
              Location
            </h2>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location / Address</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="e.g., Downtown, City Name, or Full Address"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">This helps match you with nearby volunteer opportunities</p>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <UserIcon className="h-6 w-6 text-blue-600" />
              Emergency Contact
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name</label>
                <input
                  type="text"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                <input
                  type="tel"
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <AcademicCapIcon className="h-6 w-6 text-blue-600" />
              Skills
            </h2>

            {isEditing && (
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  placeholder="Add a skill (e.g., First Aid, Driving, Cooking)"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <PlusIcon className="h-5 w-5" />
                  Add
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {!formData.skills || formData.skills.length === 0 ? (
                <p className="text-gray-500">No skills added yet</p>
              ) : (
                formData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {skill}
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="hover:text-blue-600"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Interests */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Interests</h2>

            {isEditing && (
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                  placeholder="Add an interest (e.g., Community Service, Education)"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={addInterest}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <PlusIcon className="h-5 w-5" />
                  Add
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {!formData.interests || formData.interests.length === 0 ? (
                <p className="text-gray-500">No interests added yet</p>
              ) : (
                formData.interests.map((interest) => (
                  <span
                    key={interest}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                  >
                    {interest}
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => removeInterest(interest)}
                        className="hover:text-purple-600"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Certifications */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Certifications</h2>

            {isEditing && !showCertForm && (
              <button
                type="button"
                onClick={() => setShowCertForm(true)}
                className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <PlusIcon className="h-5 w-5" />
                Add Certification
              </button>
            )}

            {isEditing && showCertForm && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">New Certification</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      value={newCert.name}
                      onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
                      placeholder="e.g., CPR Certification"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Issued By *</label>
                    <input
                      type="text"
                      value={newCert.issuedBy}
                      onChange={(e) => setNewCert({ ...newCert, issuedBy: e.target.value })}
                      placeholder="e.g., Red Cross"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Issue Date</label>
                    <input
                      type="date"
                      value={newCert.issuedDate}
                      onChange={(e) => setNewCert({ ...newCert, issuedDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Expiry Date</label>
                    <input
                      type="date"
                      value={newCert.expiryDate}
                      onChange={(e) => setNewCert({ ...newCert, expiryDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Certificate Number</label>
                    <input
                      type="text"
                      value={newCert.certificateNumber}
                      onChange={(e) => setNewCert({ ...newCert, certificateNumber: e.target.value })}
                      placeholder="Optional"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    onClick={addCertification}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCertForm(false);
                      setNewCert({ name: '', issuedBy: '', issuedDate: '', expiryDate: '', certificateNumber: '' });
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {!formData.certifications || formData.certifications.length === 0 ? (
                <p className="text-gray-500">No certifications added yet</p>
              ) : (
                formData.certifications.map((cert, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-green-900">{cert.name}</h4>
                      <p className="text-sm text-green-700">Issued by: {cert.issuedBy}</p>
                      {cert.issuedDate && (
                        <p className="text-xs text-green-600">Issued: {cert.issuedDate}</p>
                      )}
                      {cert.expiryDate && (
                        <p className="text-xs text-green-600">Expires: {cert.expiryDate}</p>
                      )}
                      {cert.certificateNumber && (
                        <p className="text-xs text-green-600">Cert #: {cert.certificateNumber}</p>
                      )}
                    </div>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => removeCertification(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Availability */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <CalendarDaysIcon className="h-6 w-6 text-blue-600" />
              Availability
            </h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Available Days</label>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => isEditing && handleDayToggle(day)}
                    disabled={!isEditing}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      formData.availableDays?.includes(day)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    } ${isEditing ? 'hover:opacity-80 cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Preferred Time Slots</label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => isEditing && handleTimeSlotChange('morning')}
                  disabled={!isEditing}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    formData.preferredTimeSlots?.morning
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  } ${isEditing ? 'hover:opacity-80 cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
                >
                  🌅 Morning (6 AM - 12 PM)
                </button>
                <button
                  type="button"
                  onClick={() => isEditing && handleTimeSlotChange('afternoon')}
                  disabled={!isEditing}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    formData.preferredTimeSlots?.afternoon
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  } ${isEditing ? 'hover:opacity-80 cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
                >
                  ☀️ Afternoon (12 PM - 6 PM)
                </button>
                <button
                  type="button"
                  onClick={() => isEditing && handleTimeSlotChange('evening')}
                  disabled={!isEditing}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    formData.preferredTimeSlots?.evening
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  } ${isEditing ? 'hover:opacity-80 cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
                >
                  🌙 Evening (6 PM - 10 PM)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hours Available Per Week
              </label>
              <input
                type="number"
                name="hoursPerWeek"
                value={formData.hoursPerWeek}
                onChange={handleInputChange}
                disabled={!isEditing}
                min="1"
                max="40"
                className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">Maximum hours you can volunteer per week</p>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <BellIcon className="h-6 w-6 text-blue-600" />
              Preferences
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BellIcon className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">SMS Notifications</p>
                    <p className="text-sm text-gray-600">Receive text messages for urgent updates</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  name="acceptSmsNotifications"
                  checked={formData.acceptSmsNotifications}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="h-5 w-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BellIcon className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">Email Notifications</p>
                    <p className="text-sm text-gray-600">Receive email updates about opportunities</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  name="acceptEmailNotifications"
                  checked={formData.acceptEmailNotifications}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="h-5 w-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-4 justify-end">
              {profile && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={saving}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  'Save Profile'
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
