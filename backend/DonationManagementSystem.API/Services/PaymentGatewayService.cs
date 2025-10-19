using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using RestSharp;
using Newtonsoft.Json;

namespace DonationManagementSystem.API.Services
{
    /// <summary>
    /// SSLCommerz Payment Gateway Service
    /// FREE Integration for Bangladesh Payments
    /// Supports: BKash, Nagad, Rocket, Card, Bank Transfer
    /// </summary>
    public interface IPaymentGatewayService
    {
        Task<PaymentInitResponse> InitiatePaymentAsync(PaymentRequest request);
        Task<PaymentValidationResponse> ValidatePaymentAsync(string transactionId);
        Task<List<PaymentMethod>> GetAvailablePaymentMethodsAsync();
    }

    public class SSLCommerzPaymentService : IPaymentGatewayService
    {
        private readonly string _storeId;
        private readonly string _storePassword;
        private readonly string _baseUrl;
        private readonly bool _isSandbox;
        private readonly RestClient _client;

        public SSLCommerzPaymentService(IConfiguration configuration)
        {
            _storeId = configuration["Payment:SSLCommerz:StoreId"] ?? "";
            _storePassword = configuration["Payment:SSLCommerz:StorePassword"] ?? "";
            _isSandbox = configuration.GetValue<bool>("Payment:SSLCommerz:IsSandbox", true);
            _baseUrl = _isSandbox 
                ? "https://sandbox.sslcommerz.com/gwprocess/v4/api.php"
                : "https://securepay.sslcommerz.com/gwprocess/v4/api.php";
            
            _client = new RestClient();
        }

        /// <summary>
        /// Initiates a payment transaction
        /// Returns a payment gateway URL for user to complete payment
        /// </summary>
        public async Task<PaymentInitResponse> InitiatePaymentAsync(PaymentRequest request)
        {
            try
            {
                var paymentRequest = new Dictionary<string, string>
                {
                    { "store_id", _storeId },
                    { "store_passwd", _storePassword },
                    { "total_amount", request.Amount.ToString() },
                    { "currency", "BDT" },
                    { "tran_id", request.TransactionId },
                    { "product_name", request.CampaignTitle },
                    { "product_category", "donation" },
                    { "product_profile", "general" },
                    { "cus_name", request.DonorName ?? "Anonymous" },
                    { "cus_email", request.DonorEmail ?? "donor@donation.com" },
                    { "cus_phone", request.DonorPhone ?? "01700000000" },
                    { "success_url", request.SuccessUrl },
                    { "fail_url", request.FailUrl },
                    { "cancel_url", request.CancelUrl },
                    { "ipn_url", request.IpnUrl },
                    { "value_a", request.CampaignId.ToString() }, // Custom field for campaign ID
                    { "value_b", request.UserId?.ToString() ?? "guest" } // Custom field for user ID
                };

                var requestObj = new RestRequest(_baseUrl, Method.Post);
                
                foreach (var param in paymentRequest)
                {
                    requestObj.AddParameter(param.Key, param.Value);
                }

                var response = await _client.ExecuteAsync(requestObj);

                if (response.IsSuccessful)
                {
                    // Parse response
                    var content = response.Content ?? "";
                    
                    return new PaymentInitResponse
                    {
                        Success = true,
                        GatewayUrl = ExtractGatewayUrl(content),
                        TransactionId = request.TransactionId,
                        Message = "Payment initiated successfully"
                    };
                }
                else
                {
                    return new PaymentInitResponse
                    {
                        Success = false,
                        Message = "Failed to initiate payment",
                        Error = response.ErrorMessage
                    };
                }
            }
            catch (Exception ex)
            {
                return new PaymentInitResponse
                {
                    Success = false,
                    Message = "Payment initiation error",
                    Error = ex.Message
                };
            }
        }

        /// <summary>
        /// Validates a completed payment transaction
        /// </summary>
        public async Task<PaymentValidationResponse> ValidatePaymentAsync(string transactionId)
        {
            try
            {
                var validationRequest = new RestRequest(_baseUrl, Method.Post);
                validationRequest.AddParameter("store_id", _storeId);
                validationRequest.AddParameter("store_passwd", _storePassword);
                validationRequest.AddParameter("tran_id", transactionId);
                validationRequest.AddParameter("val_id", transactionId); // SSLCommerz validation ID

                var response = await _client.ExecuteAsync(validationRequest);

                if (response.IsSuccessful && response.Content?.Contains("valid") == true)
                {
                    return new PaymentValidationResponse
                    {
                        Success = true,
                        IsValid = true,
                        TransactionId = transactionId,
                        Message = "Payment validated successfully"
                    };
                }
                else
                {
                    return new PaymentValidationResponse
                    {
                        Success = false,
                        IsValid = false,
                        Message = "Payment validation failed"
                    };
                }
            }
            catch (Exception ex)
            {
                return new PaymentValidationResponse
                {
                    Success = false,
                    IsValid = false,
                    Message = "Validation error",
                    Error = ex.Message
                };
            }
        }

        /// <summary>
        /// Gets available payment methods for Bangladesh
        /// </summary>
        public Task<List<PaymentMethod>> GetAvailablePaymentMethodsAsync()
        {
            var methods = new List<PaymentMethod>
            {
                new PaymentMethod 
                { 
                    Id = "bkash", 
                    Name = "bKash", 
                    Description = "Send Money from bKash", 
                    Icon = "bkash.png",
                    Country = "BD",
                    IsActive = true,
                    Type = "mobile_money"
                },
                new PaymentMethod 
                { 
                    Id = "nagad", 
                    Name = "Nagad", 
                    Description = "Send Money from Nagad", 
                    Icon = "nagad.png",
                    Country = "BD",
                    IsActive = true,
                    Type = "mobile_money"
                },
                new PaymentMethod 
                { 
                    Id = "rocket", 
                    Name = "Rocket", 
                    Description = "Send Money from Rocket", 
                    Icon = "rocket.png",
                    Country = "BD",
                    IsActive = true,
                    Type = "mobile_money"
                },
                new PaymentMethod 
                { 
                    Id = "visa", 
                    Name = "Visa/Mastercard", 
                    Description = "Pay with Debit/Credit Card", 
                    Icon = "card.png",
                    Country = "Global",
                    IsActive = true,
                    Type = "card"
                },
                new PaymentMethod 
                { 
                    Id = "bank", 
                    Name = "Bank Transfer", 
                    Description = "Direct Bank Transfer", 
                    Icon = "bank.png",
                    Country = "BD",
                    IsActive = true,
                    Type = "bank_transfer"
                },
                new PaymentMethod 
                { 
                    Id = "cod", 
                    Name = "Cash/Check", 
                    Description = "Manual donation (Cash/Check)", 
                    Icon = "cash.png",
                    Country = "BD",
                    IsActive = true,
                    Type = "cash"
                }
            };

            return Task.FromResult(methods);
        }

        private string ExtractGatewayUrl(string response)
        {
            // SSLCommerz returns a form with action URL
            // Extract the gateway URL from response
            try
            {
                var startIndex = response.IndexOf("action=\"") + 8;
                var endIndex = response.IndexOf("\"", startIndex);
                return response.Substring(startIndex, endIndex - startIndex);
            }
            catch
            {
                return "";
            }
        }
    }

    // ============ DTOs ============

    public class PaymentRequest
    {
        public decimal Amount { get; set; }
        public string? DonorName { get; set; }
        public string? DonorEmail { get; set; }
        public string? DonorPhone { get; set; }
        public string CampaignTitle { get; set; } = string.Empty;
        public int CampaignId { get; set; }
        public int? UserId { get; set; }
        public string TransactionId { get; set; } = Guid.NewGuid().ToString();
        public string SuccessUrl { get; set; } = string.Empty;
        public string FailUrl { get; set; } = string.Empty;
        public string CancelUrl { get; set; } = string.Empty;
        public string IpnUrl { get; set; } = string.Empty;
    }

    public class PaymentInitResponse
    {
        public bool Success { get; set; }
        public string GatewayUrl { get; set; } = string.Empty;
        public string TransactionId { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string? Error { get; set; }
    }

    public class PaymentValidationResponse
    {
        public bool Success { get; set; }
        public bool IsValid { get; set; }
        public string TransactionId { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string? Error { get; set; }
    }

    public class PaymentMethod
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public string Type { get; set; } = string.Empty; // mobile_money, card, bank_transfer, cash
        public decimal? MinAmount { get; set; }
        public decimal? MaxAmount { get; set; }
    }

    public class PaymentCallback
    {
        [JsonProperty("tran_id")]
        public string? TransactionId { get; set; }

        [JsonProperty("status")]
        public string? Status { get; set; }

        [JsonProperty("currency")]
        public string? Currency { get; set; }

        [JsonProperty("amount")]
        public decimal Amount { get; set; }

        [JsonProperty("card_type")]
        public string? CardType { get; set; }

        [JsonProperty("cus_email")]
        public string? CustomerEmail { get; set; }

        [JsonProperty("cus_name")]
        public string? CustomerName { get; set; }

        [JsonProperty("value_a")]
        public string? CampaignId { get; set; }

        [JsonProperty("value_b")]
        public string? UserId { get; set; }
    }
}
