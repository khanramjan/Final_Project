// Volunteer System TypeScript Types

export interface CertificationDto {
  name: string;
  issuedBy: string;
  issuedDate?: string;
  expiryDate?: string;
  certificateNumber?: string;
}

export interface TimeSlotPreferences {
  morning: boolean;
  afternoon: boolean;
  evening: boolean;
}

export interface VolunteerProfile {
  id: number;
  userId: number;
  userName?: string;
  userEmail?: string;
  skills?: string[];
  interests?: string[];
  experienceLevel?: string;
  yearsOfExperience: number;
  certifications?: CertificationDto[];
  availableDays?: string[];
  preferredTimeSlots?: TimeSlotPreferences;
  hoursPerWeek: number;
  location?: string;
  latitude?: number;
  longitude?: number;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  totalHoursVolunteered: number;
  totalTasksCompleted: number;
  totalCampaignsSupported: number;
  rating: number;
  totalRatings: number;
  rank: string; // Newbie, Bronze, Silver, Gold, Platinum
  completedCampaigns: number;
  lastRankUpgradeAt?: string;
  status: string;
  isVerified: boolean;
  verifiedAt?: string;
  acceptSmsNotifications: boolean;
  acceptEmailNotifications: boolean;
  isProfilePublic: boolean;
  createdAt: string;
  lastActivityAt?: string;
}

export interface CreateVolunteerProfile {
  skills?: string[];
  interests?: string[];
  experienceLevel?: string;
  yearsOfExperience: number;
  certifications?: CertificationDto[];
  availableDays?: string[];
  preferredTimeSlots?: TimeSlotPreferences;
  hoursPerWeek: number;
  location?: string;
  latitude?: number;
  longitude?: number;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  acceptSmsNotifications?: boolean;
  acceptEmailNotifications?: boolean;
  isProfilePublic?: boolean;
}

export interface UpdateVolunteerProfile {
  skills?: string[];
  interests?: string[];
  experienceLevel?: string;
  yearsOfExperience?: number;
  certifications?: CertificationDto[];
  availableDays?: string[];
  preferredTimeSlots?: TimeSlotPreferences;
  hoursPerWeek?: number;
  location?: string;
  latitude?: number;
  longitude?: number;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  acceptSmsNotifications?: boolean;
  acceptEmailNotifications?: boolean;
  isProfilePublic?: boolean;
}

export interface VolunteerRequest {
  id: number;
  volunteerProfileId: number;
  volunteerName?: string;
  campaignId: number;
  campaignTitle?: string;
  requestedBy: number;
  requestedByName?: string;
  title: string;
  description: string;
  taskType: string;
  priority: string;
  startDate: string;
  endDate: string;
  estimatedHours: number;
  meetingPoint?: string;
  latitude?: number;
  longitude?: number;
  requiredSkills?: string[];
  requiredEquipment?: string[];
  teamSize?: number;
  status: string;
  respondedAt?: string;
  declineReason?: string;
  adminNotes?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface AcceptRequest {
  requestId: number;
  acceptanceMessage?: string;
}

export interface DeclineRequest {
  requestId: number;
  declineReason: string;
}

export interface CheckInInfo {
  checkInTime?: string;
  checkInLocation?: string;
  checkInLatitude?: number;
  checkInLongitude?: number;
}

export interface CheckOutInfo {
  checkOutTime?: string;
  checkOutLocation?: string;
  checkOutLatitude?: number;
  checkOutLongitude?: number;
}

export interface VolunteerAssignment {
  id: number;
  volunteerProfileId: number;
  volunteerName?: string;
  campaignId: number;
  campaignTitle?: string;
  volunteerRequestId?: number;
  title: string;
  description: string;
  taskType: string;
  status: string;
  startDate: string;
  endDate: string;
  estimatedHours: number;
  actualHours: number;
  meetingPoint?: string;
  latitude?: number;
  longitude?: number;
  checkInInfo?: CheckInInfo;
  checkOutInfo?: CheckOutInfo;
  progressPercentage: number;
  progressNotes?: string;
  completedAt?: string;
  completionNotes?: string;
  rating?: number;
  feedback?: string;
  certificateIssued: boolean;
  certificatePath?: string;
  createdAt: string;
}

export interface CheckIn {
  assignmentId: number;
  latitude: number;
  longitude: number;
  location?: string;
  notes?: string;
}

export interface CheckOut {
  assignmentId: number;
  latitude: number;
  longitude: number;
  location?: string;
  completionNotes?: string;
}

export interface UpdateProgress {
  assignmentId: number;
  progressPercentage: number;
  progressNotes?: string;
}

export interface VolunteerActivity {
  id: number;
  volunteerProfileId: number;
  volunteerAssignmentId?: number;
  campaignId?: number;
  campaignTitle?: string;
  activityType: string;
  title: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
}

export interface VolunteerAchievement {
  id: number;
  achievementType: string;
  title: string;
  description: string;
  badgeIcon: string;
  badgeColor: string;
  currentProgress: number;
  requiredProgress: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  points?: number;
  rewardDescription?: string;
}

export interface VolunteerStats {
  totalHoursVolunteered: number;
  totalTasksCompleted: number;
  totalCampaignsSupported: number;
  activeAssignments: number;
  pendingRequests: number;
  averageRating: number;
  totalRatings: number;
  achievementsUnlocked: number;
  totalPoints: number;
  lastActivityAt?: string;
}

export interface VolunteerDashboard {
  profile?: VolunteerProfile;
  stats: VolunteerStats;
  pendingRequests: VolunteerRequest[];
  activeAssignments: VolunteerAssignment[];
  upcomingTasks: VolunteerAssignment[];
  recentAchievements: VolunteerAchievement[];
}

export interface VolunteerHistory {
  completedAssignments: VolunteerAssignment[];
  recentActivities: VolunteerActivity[];
  stats: VolunteerStats;
}
