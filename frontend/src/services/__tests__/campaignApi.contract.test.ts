import { describe, it, expect } from 'vitest';
import campaignService from '../campaignService';

const isCampaignSummary = (value: unknown): boolean => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'number' &&
    typeof v.title === 'string' &&
    typeof v.description === 'string' &&
    typeof v.targetAmount === 'number' &&
    typeof v.raisedAmount === 'number' &&
    typeof v.startDate === 'string' &&
    typeof v.endDate === 'string' &&
    typeof v.status === 'string' &&
    typeof v.category === 'string' &&
    typeof v.isUrgent === 'boolean' &&
    typeof v.isFeatured === 'boolean' &&
    typeof v.createdAt === 'string' &&
    typeof v.creatorName === 'string' &&
    typeof v.progressPercentage === 'number' &&
    typeof v.donationCount === 'number' &&
    typeof v.daysRemaining === 'number'
  );
};

describe('campaignApi contract tests', () => {
  it('getAllCampaigns response matches expected contract', async () => {
    const response = await campaignService.getAllCampaigns({ page: 1, pageSize: 10 });

    expect(Array.isArray(response.campaigns)).toBe(true);
    expect(typeof response.totalCount).toBe('number');
    expect(typeof response.page).toBe('number');
    expect(typeof response.pageSize).toBe('number');
    expect(typeof response.totalPages).toBe('number');

    expect(response.campaigns.length).toBeGreaterThan(0);
    expect(isCampaignSummary(response.campaigns[0])).toBe(true);
  });
});
