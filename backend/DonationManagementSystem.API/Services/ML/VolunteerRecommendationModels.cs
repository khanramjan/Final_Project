using Microsoft.ML.Data;

namespace DonationManagementSystem.API.Services.ML
{
    /// <summary>
    /// Features for training the volunteer recommendation model
    /// </summary>
    public class VolunteerRecommendationInput
    {
        [LoadColumn(0)]
        public int VolunteerId { get; set; }

        [LoadColumn(1)]
        public int CampaignId { get; set; }

        /// <summary>
        /// Skills match score (0-1): how many required skills the volunteer has
        /// </summary>
        [LoadColumn(2)]
        public float SkillsMatchScore { get; set; }

        /// <summary>
        /// Interests match score (0-1): alignment with campaign category
        /// </summary>
        [LoadColumn(3)]
        public float InterestsMatchScore { get; set; }

        /// <summary>
        /// Availability score (0-1): percentage of campaign duration volunteer is available
        /// </summary>
        [LoadColumn(4)]
        public float AvailabilityScore { get; set; }

        /// <summary>
        /// Experience level converted to numeric (0=beginner, 1=intermediate, 2=advanced, 3=expert)
        /// </summary>
        [LoadColumn(5)]
        public float ExperienceLevel { get; set; }

        /// <summary>
        /// Total hours volunteered (normalized 0-1)
        /// </summary>
        [LoadColumn(6)]
        public float TotalHoursNormalized { get; set; }

        /// <summary>
        /// Volunteer's rating score (0-5)
        /// </summary>
        [LoadColumn(7)]
        public float VolunteerRating { get; set; }

        /// <summary>
        /// Task completion rate based on historical assignments (0-1)
        /// </summary>
        [LoadColumn(8)]
        public float CompletionRate { get; set; }

        /// <summary>
        /// Average assignment quality rating (0-5)
        /// </summary>
        [LoadColumn(9)]
        public float QualityRating { get; set; }

        /// <summary>
        /// Historical acceptance rate based on past volunteer requests (0-1)
        /// </summary>
        [LoadColumn(10)]
        public float AcceptanceRate { get; set; }

        /// <summary>
        /// Distance to campaign location in km (normalized 0-1, closer = higher score)
        /// </summary>
        [LoadColumn(11)]
        public float LocationProximity { get; set; }

        /// <summary>
        /// Availability hours per week (normalized 0-1)
        /// </summary>
        [LoadColumn(12)]
        public float AvailableHoursPerWeek { get; set; }

        /// <summary>
        /// Campaign complexity score (0-1): higher for complex tasks requiring expertise
        /// </summary>
        [LoadColumn(13)]
        public float CampaignComplexity { get; set; }

        /// <summary>
        /// Past success in similar campaign categories (0-1)
        /// </summary>
        [LoadColumn(14)]
        public float CategoryExperience { get; set; }

        /// <summary>
        /// Label: 1 if volunteer accepted and completed successfully, 0 otherwise
        /// </summary>
        [LoadColumn(15)]
        [ColumnName("Label")]
        public bool SuccessfulMatch { get; set; }
    }

    /// <summary>
    /// Prediction output from the recommendation model
    /// </summary>
    public class VolunteerRecommendationPrediction
    {
        [ColumnName("PredictedLabel")]
        public bool IsGoodMatch { get; set; }

        [ColumnName("Score")]
        public float Score { get; set; } // Probability score (0-1)
    }

    /// <summary>
    /// Enhanced prediction with additional details
    /// </summary>
    public class VolunteerRecommendationResult
    {
        public int VolunteerId { get; set; }
        public string VolunteerName { get; set; } = string.Empty;
        public string Rank { get; set; } = string.Empty;
        public float SuitabilityScore { get; set; } // 0-100
        public bool IsRecommended { get; set; }
        public string Reason { get; set; } = string.Empty;
        
        // Feature breakdown (for transparency)
        public float SkillsMatch { get; set; }
        public float InterestsMatch { get; set; }
        public float AvailabilityMatch { get; set; }
        public float ExperienceScore { get; set; }
        public float LocationScore { get; set; }
        public float RatingScore { get; set; }
    }

    /// <summary>
    /// Batch recommendation request
    /// </summary>
    public class VolunteerRecommendationRequest
    {
        public int CampaignId { get; set; }
        public List<int>? VolunteerIds { get; set; } // If null, recommend from all eligible volunteers
        public int TopN { get; set; } = 10; // Return top N recommendations
        public float MinimumScore { get; set; } = 0.5f; // Only return volunteers with score >= this
    }
}
