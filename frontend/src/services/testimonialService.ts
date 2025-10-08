import api from './api';

export interface Testimonial {
  id: number;
  name: string;
  position: string;
  organization: string;
  avatarUrl?: string;
  rating: number;
  comment: string;
  badgeType?: string;
  isFeatured: boolean;
  createdAt: string;
}

export interface CreateTestimonialDto {
  position: string;
  organization: string;
  rating: number;
  comment: string;
  badgeType?: string;
}

class TestimonialService {
  // Get public testimonials for landing page
  async getPublicTestimonials(limit: number = 10): Promise<Testimonial[]> {
    return api.get(`/testimonials/public?limit=${limit}`);
  }

  // Submit a new testimonial
  async submitTestimonial(data: CreateTestimonialDto): Promise<{ message: string; testimonialId: number }> {
    return api.post('/testimonials', data);
  }

  // Admin: Get all testimonials with filters
  async getAllTestimonials(page: number = 1, pageSize: number = 10, isApproved?: boolean) {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());
    if (isApproved !== undefined) {
      params.append('isApproved', isApproved.toString());
    }
    return api.get(`/testimonials?${params.toString()}`);
  }

  // Admin: Update testimonial status
  async updateTestimonialStatus(
    id: number,
    data: {
      isApproved?: boolean;
      isFeatured?: boolean;
      isActive?: boolean;
    }
  ) {
    return api.put(`/testimonials/${id}`, data);
  }

  // Admin: Delete testimonial
  async deleteTestimonial(id: number) {
    return api.delete(`/testimonials/${id}`);
  }

  // Admin: Get statistics
  async getTestimonialStats() {
    return api.get('/testimonials/stats');
  }
}

export default new TestimonialService();
