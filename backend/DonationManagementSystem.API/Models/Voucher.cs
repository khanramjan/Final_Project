namespace DonationManagementSystem.API.Models
{
    /// <summary>
    /// Represents a cost voucher submitted by volunteers for relief distribution expenses
    /// </summary>
    public class Voucher
    {
        public int Id { get; set; }
        
        // Campaign & Volunteer Association
        public int CampaignId { get; set; }
        public int VolunteerId { get; set; }
        
        // Voucher Details
        public decimal Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTime ExpenseDate { get; set; }
        public string Category { get; set; } = string.Empty; // Food, Transportation, Medical Supplies, Equipment, etc.
        
        // Receipt/Proof
        public string? ReceiptPath { get; set; } // Path to uploaded receipt file
        public string? ReceiptFileName { get; set; }
        
        // Approval Workflow
        public string Status { get; set; } = "pending"; // pending, approved, rejected, requested
        public int? ReviewedBy { get; set; } // Admin ID who approved/rejected
        public DateTime? ReviewedAt { get; set; }
        public string? AdminFeedback { get; set; } // Feedback from admin (reason for rejection or notes)
        
        // Request System (when admin requests voucher from volunteer)
        public bool IsRequestedByAdmin { get; set; } = false;
        public int? RequestedBy { get; set; } // Admin ID who requested
        public DateTime? RequestedAt { get; set; }
        public string? RequestNote { get; set; } // Admin's note when requesting voucher
        
        // Timestamps
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        
        // Navigation Properties
        public Campaign Campaign { get; set; } = null!;
        public User Volunteer { get; set; } = null!;
        public User? Reviewer { get; set; }
        public User? Requester { get; set; }
        public ICollection<VoucherItem> Items { get; set; } = new List<VoucherItem>();
    }
}
