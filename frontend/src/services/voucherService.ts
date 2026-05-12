import api from './api';

export interface VoucherItemDto {
  itemName: string;
  price: number;
  quantity: number;
  purchaseDate: string;
  notes?: string;
}

export interface SubmitVoucherDto {
  campaignId: number;
  amount: number;
  description: string;
  expenseDate: string;
  category: string;
  items: VoucherItemDto[];
}

export interface VoucherResponseDto {
  id: number;
  campaignId: number;
  campaignTitle: string;
  volunteerId: number;
  volunteerName: string;
  volunteerEmail: string;
  amount: number;
  description: string;
  expenseDate: string;
  category: string;
  receiptPath?: string;
  receiptFileName?: string;
  status: string;
  reviewedBy?: number;
  reviewerName?: string;
  reviewedAt?: string;
  adminFeedback?: string;
  isRequestedByAdmin: boolean;
  requestNote?: string;
  requestedAt?: string;
  createdAt: string;
  updatedAt?: string;
  items: VoucherItemDto[];
}

export interface ReviewVoucherDto {
  action: 'approve' | 'reject';
  adminFeedback?: string;
}

export interface RequestVoucherDto {
  campaignId: number;
  volunteerId: number;
  requestNote: string;
}

export interface VoucherPublicDto {
  id: number;
  volunteerName: string;
  amount: number;
  description: string;
  expenseDate: string;
  category: string;
  approvedAt: string;
}

export interface VoucherSummaryDto {
  totalVouchers: number;
  totalExpenditure: number;
  vouchers: VoucherPublicDto[];
}

const voucherService = {
  // Volunteer endpoints
  submitVoucher: async (data: SubmitVoucherDto, receipt?: File): Promise<VoucherResponseDto> => {
    const formData = new FormData();
    formData.append('campaignId', data.campaignId.toString());
    formData.append('amount', data.amount.toString());
    formData.append('description', data.description);
    formData.append('expenseDate', data.expenseDate);
    formData.append('category', data.category);
    formData.append('items', JSON.stringify(data.items));
    if (receipt) {
      formData.append('receipt', receipt);
    }

    // Use fetch directly for file upload (bypass api service to avoid JSON.stringify)
    const token = localStorage.getItem('token');
    const response = await fetch('/api/voucher/submit', {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        // Don't set Content-Type - browser will set it with boundary for multipart/form-data
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  getMyVouchers: async (): Promise<VoucherResponseDto[]> => {
    return api.get<VoucherResponseDto[]>('/voucher/my-vouchers');
  },

  getMyVoucherRequests: async (): Promise<VoucherResponseDto[]> => {
    return api.get<VoucherResponseDto[]>('/voucher/my-requests');
  },

  updateRequestedVoucher: async (
    id: number,
    data: SubmitVoucherDto,
    receipt?: File
  ): Promise<VoucherResponseDto> => {
    const formData = new FormData();
    formData.append('campaignId', data.campaignId.toString());
    formData.append('amount', data.amount.toString());
    formData.append('description', data.description);
    formData.append('expenseDate', data.expenseDate);
    formData.append('category', data.category);
    if (receipt) {
      formData.append('receipt', receipt);
    }

    // Use fetch directly for file upload
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/voucher/${id}/update-request`, {
      method: 'PUT',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        // Don't set Content-Type - browser will set it with boundary
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Admin endpoints
  getPendingVouchers: async (): Promise<VoucherResponseDto[]> => {
    return api.get<VoucherResponseDto[]>('/voucher/pending');
  },

  getAllVouchers: async (
    status?: string,
    campaignId?: number,
    volunteerId?: number
  ): Promise<VoucherResponseDto[]> => {
    const params: Record<string, string | number> = {};
    if (status) params.status = status;
    if (campaignId) params.campaignId = campaignId;
    if (volunteerId) params.volunteerId = volunteerId;

    // Build query string manually since api.get doesn't support params object
    const queryString = Object.keys(params).length > 0 
      ? '?' + Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&')
      : '';
    return api.get<VoucherResponseDto[]>(`/voucher/all${queryString}`);
  },

  reviewVoucher: async (id: number, data: ReviewVoucherDto): Promise<VoucherResponseDto> => {
    return api.put<VoucherResponseDto>(`/voucher/${id}/review`, data);
  },

  requestVoucher: async (data: RequestVoucherDto): Promise<VoucherResponseDto> => {
    return api.post<VoucherResponseDto>('/voucher/request', data);
  },

  // Public endpoints
  getCampaignVouchers: async (campaignId: number): Promise<VoucherSummaryDto> => {
    return api.get<VoucherSummaryDto>(`/voucher/campaign/${campaignId}`);
  },

  getVoucherById: async (id: number): Promise<VoucherResponseDto> => {
    return api.get<VoucherResponseDto>(`/voucher/${id}`);
  },

  deleteVoucher: async (id: number): Promise<void> => {
    return api.delete(`/voucher/${id}`);
  },
};

export default voucherService;
