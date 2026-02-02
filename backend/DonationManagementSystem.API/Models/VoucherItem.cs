namespace DonationManagementSystem.API.Models
{
    /// <summary>
    /// Represents an individual line item/expense entry within a voucher
    /// </summary>
    public class VoucherItem
    {
        public int Id { get; set; }
        public int VoucherId { get; set; }
        
        // Item Details
        public string ItemName { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Quantity { get; set; } = 1;
        public DateTime PurchaseDate { get; set; }
        public string? Notes { get; set; }
        
        // Navigation Property
        public Voucher Voucher { get; set; } = null!;
    }
}
