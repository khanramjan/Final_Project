import api from './api';
import type {
  CreatePhysicalDonationRequest,
  SubmitPhysicalDonationResponse,
  PhysicalDonationItem,
  ConfirmPhysicalDonationRequest,
  ConfirmPhysicalDonationResponse,
} from '../types/physicalDonation.types';

class PhysicalDonationService {
  async submit(data: CreatePhysicalDonationRequest): Promise<SubmitPhysicalDonationResponse> {
    return api.post<SubmitPhysicalDonationResponse>('/physical-donations/submit', data);
  }

  async my(status?: string): Promise<PhysicalDonationItem[]> {
    const endpoint = status && status !== 'all'
      ? `/physical-donations/my?status=${encodeURIComponent(status)}`
      : '/physical-donations/my';

    return api.get<PhysicalDonationItem[]>(endpoint);
  }

  async confirm(data: ConfirmPhysicalDonationRequest): Promise<ConfirmPhysicalDonationResponse> {
    // Donor-confirm endpoint is anonymous; our api helper still sends auth header if present.
    return api.post<ConfirmPhysicalDonationResponse>('/physical-donations/confirm', data);
  }
}

export default new PhysicalDonationService();
