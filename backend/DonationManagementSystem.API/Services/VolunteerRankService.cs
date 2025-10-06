using DonationManagementSystem.API.Data;
using DonationManagementSystem.API.Models;
using Microsoft.EntityFrameworkCore;

namespace DonationManagementSystem.API.Services
{
    public interface IVolunteerRankService
    {
        Task CheckAndUpgradeRank(int volunteerProfileId);
        Task<string> GetNextRank(string currentRank);
        Task<int> GetCampaignsRequiredForNextRank(string currentRank);
        Task<bool> IsEligibleForUpgrade(int volunteerProfileId);
        Task ManualRankUpgrade(int volunteerProfileId, string newRank, int upgradedBy, string reason);
    }

    public class VolunteerRankService : IVolunteerRankService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<VolunteerRankService> _logger;

        // Rank progression: Newbie -> Iron -> Bronze -> Silver -> Gold
        private readonly Dictionary<string, string> _rankProgression = new()
        {
            { "Newbie", "Iron" },
            { "Iron", "Bronze" },
            { "Bronze", "Silver" },
            { "Silver", "Gold" },
            { "Gold", "Gold" } // Max rank
        };

        private readonly Dictionary<string, int> _rankRequirements = new()
        {
            { "Newbie", 0 },    // Starting rank
            { "Iron", 5 },      // 5 campaigns to reach Iron
            { "Bronze", 10 },   // 10 campaigns to reach Bronze (5 more after Iron)
            { "Silver", 15 },   // 15 campaigns to reach Silver (5 more after Bronze)
            { "Gold", 20 }      // 20 campaigns to reach Gold (5 more after Silver)
        };

        public VolunteerRankService(AppDbContext context, ILogger<VolunteerRankService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task CheckAndUpgradeRank(int volunteerProfileId)
        {
            var profile = await _context.VolunteerProfiles
                .FirstOrDefaultAsync(vp => vp.Id == volunteerProfileId);

            if (profile == null)
            {
                _logger.LogWarning($"Volunteer profile {volunteerProfileId} not found for rank upgrade check");
                return;
            }

            var currentRank = profile.Rank ?? "Newbie";
            var completedCampaigns = profile.CompletedCampaigns;

            // Check if eligible for upgrade based on campaigns completed
            var nextRank = await GetNextRank(currentRank);
            
            if (nextRank == currentRank)
            {
                // Already at max rank
                return;
            }

            var requiredCampaigns = _rankRequirements[nextRank];

            if (completedCampaigns >= requiredCampaigns)
            {
                // Upgrade the rank
                await UpgradeRank(profile, nextRank, $"Completed {completedCampaigns} campaigns");
                
                // Check if they qualify for even higher rank (in case they skipped levels)
                await CheckAndUpgradeRank(volunteerProfileId);
            }
        }

        public async Task<bool> IsEligibleForUpgrade(int volunteerProfileId)
        {
            var profile = await _context.VolunteerProfiles
                .FirstOrDefaultAsync(vp => vp.Id == volunteerProfileId);

            if (profile == null) return false;

            var currentRank = profile.Rank ?? "Newbie";
            var nextRank = await GetNextRank(currentRank);

            if (nextRank == currentRank) return false; // Already at max rank

            var requiredCampaigns = _rankRequirements[nextRank];
            return profile.CompletedCampaigns >= requiredCampaigns;
        }

        public Task<string> GetNextRank(string currentRank)
        {
            if (string.IsNullOrEmpty(currentRank) || !_rankProgression.ContainsKey(currentRank))
            {
                return Task.FromResult("Bronze");
            }

            return Task.FromResult(_rankProgression[currentRank]);
        }

        public Task<int> GetCampaignsRequiredForNextRank(string currentRank)
        {
            var nextRank = GetNextRank(currentRank).Result;
            if (nextRank == currentRank) return Task.FromResult(0); // Already at max

            return Task.FromResult(_rankRequirements[nextRank]);
        }

        public async Task ManualRankUpgrade(int volunteerProfileId, string newRank, int upgradedBy, string reason)
        {
            var profile = await _context.VolunteerProfiles
                .FirstOrDefaultAsync(vp => vp.Id == volunteerProfileId);

            if (profile == null)
            {
                throw new Exception("Volunteer profile not found");
            }

            await UpgradeRank(profile, newRank, reason, upgradedBy);
        }

        private async Task UpgradeRank(VolunteerProfile profile, string newRank, string reason, int? upgradedBy = null)
        {
            var previousRank = profile.Rank ?? "Newbie";

            // Update profile rank
            profile.Rank = newRank;
            profile.LastRankUpgradeAt = DateTime.UtcNow;

            // Create rank history entry
            var history = new VolunteerRankHistory
            {
                VolunteerProfileId = profile.Id,
                PreviousRank = previousRank,
                NewRank = newRank,
                Reason = reason,
                CampaignsCompletedAtUpgrade = profile.CompletedCampaigns,
                UpgradedAt = DateTime.UtcNow,
                UpgradedBy = upgradedBy
            };

            _context.VolunteerRankHistories.Add(history);

            // Create achievement for rank upgrade
            var achievementTitle = $"{newRank} Rank Achieved!";
            var achievementDescription = $"Reached {newRank} rank by {reason.ToLower()}";
            var badgeColor = GetRankColor(newRank);
            var points = GetRankPoints(newRank);

            var achievement = new VolunteerAchievement
            {
                VolunteerProfileId = profile.Id,
                AchievementType = $"rank_{newRank.ToLower()}",
                Title = achievementTitle,
                Description = achievementDescription,
                BadgeIcon = "trophy",
                BadgeColor = badgeColor,
                CurrentProgress = profile.CompletedCampaigns,
                RequiredProgress = profile.CompletedCampaigns,
                IsUnlocked = true,
                UnlockedAt = DateTime.UtcNow,
                Points = points,
                RewardDescription = $"Unlocked {newRank} volunteer benefits and priority access"
            };

            _context.VolunteerAchievements.Add(achievement);

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Volunteer {profile.Id} upgraded from {previousRank} to {newRank}");
        }

        private string GetRankColor(string rank)
        {
            return rank switch
            {
                "Newbie" => "#6b7280",    // Gray
                "Bronze" => "#cd7f32",    // Bronze
                "Silver" => "#c0c0c0",    // Silver
                "Gold" => "#ffd700",      // Gold
                "Platinum" => "#e5e4e2",  // Platinum
                _ => "#6b7280"
            };
        }

        private int GetRankPoints(string rank)
        {
            return rank switch
            {
                "Iron" => 25,
                "Bronze" => 50,
                "Silver" => 100,
                "Gold" => 200,
                _ => 0
            };
        }
    }
}
