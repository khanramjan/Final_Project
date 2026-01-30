// Physical donation / cash collection types

export interface CreatePhysicalDonationRequest {
  campaignId: number;
  volunteerAssignmentId?: number | null;
  amount: number;
  donorName?: string;
  donorPhone: string;
  notes?: string;
}

export interface SubmitPhysicalDonationResponse {
  message: string;
  id: number;
  referenceCode: string;
  otpExpiresAt: string;
}

export interface PhysicalDonationItem {
  id: number;
  campaignId: number;
  amount: number;
  donorName: string;
  donorPhone: string;
  referenceCode: string;
  status: 'submitted' | 'confirmed' | string;
  collectedAt?: string;
  confirmedAt?: string | null;
  donationId?: number | null;
}

export interface ConfirmPhysicalDonationRequest {
  referenceCode: string;
  otp: string;
}

export interface ConfirmPhysicalDonationResponse {
  message: string;
  donationId?: number;
}
