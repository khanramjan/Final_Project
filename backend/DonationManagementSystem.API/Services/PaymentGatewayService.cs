using System.Text.Json.Serialization;
using Microsoft.Extensions.Configuration;
using RestSharp;
using DonationManagementSystem.API.Data;
using DonationManagementSystem.API.Models;

namespace DonationManagementSystem.API.Services
{
    /// <summary>
    /// SSLCommerz Payment Gateway Service
    /// Supports: bKash, Nagad, Rocket, Card, Bank Transfer
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
        private readonly string _sessionApiUrl;
        private readonly string _validationApiUrl;
        private readonly bool _isSandbox;

        public SSLCommerzPaymentService(IConfiguration configuration)
        {
            _storeId = configuration["Payment:SSLCommerz:StoreId"] ?? "";
            _storePassword = configuration["Payment:SSLCommerz:StorePassword"] ?? "";
            _sessionApiUrl = configuration["Payment:SSLCommerz:SessionApiUrl"] ?? "https://sandbox.sslcommerz.com/gwprocess/v3/api.php";
            _validationApiUrl = configuration["Payment:SSLCommerz:ValidationApiUrl"] ?? "https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php";
            _isSandbox = configuration.GetValue<bool>("Payment:SSLCommerz:IsSandbox", true);
        }

        public async Task<PaymentInitResponse> InitiatePaymentAsync(PaymentRequest request)
        {
            try
            {
                var client = new RestClient();
                var restRequest = new RestRequest(_sessionApiUrl, Method.Post);

                // SSLCommerz required parameters
                restRequest.AddParameter("store_id", _storeId);
                restRequest.AddParameter("store_passwd", _storePassword);
                restRequest.AddParameter("total_amount", request.Amount.ToString("F2"));
                restRequest.AddParameter("currency", "BDT");
                restRequest.AddParameter("tran_id", request.TransactionId);
                restRequest.AddParameter("success_url", request.SuccessUrl);
                restRequest.AddParameter("fail_url", request.FailUrl);
                restRequest.AddParameter("cancel_url", request.CancelUrl);
                restRequest.AddParameter("ipn_url", request.IpnUrl);

                // Customer information
                restRequest.AddParameter("cus_name", request.CustomerName);
                restRequest.AddParameter("cus_email", request.CustomerEmail);
                restRequest.AddParameter("cus_phone", request.CustomerPhone);
                restRequest.AddParameter("cus_add1", request.CustomerAddress ?? "N/A");
                restRequest.AddParameter("cus_city", "Dhaka");
                restRequest.AddParameter("cus_country", "Bangladesh");

                // Product information
                restRequest.AddParameter("product_name", request.ProductName);
                restRequest.AddParameter("product_category", "Donation");
                restRequest.AddParameter("product_profile", "non-physical-goods");

                // Shipping information (required even for donations)
                restRequest.AddParameter("shipping_method", "NO");
                restRequest.AddParameter("num_of_item", "1");

                // Value fields for custom data
                restRequest.AddParameter("value_a", request.CampaignId.ToString());
                restRequest.AddParameter("value_b", request.DonationId.ToString());
                restRequest.AddParameter("value_c", request.IsAnonymous ? "1" : "0");

                var response = await client.ExecuteAsync(restRequest);

                if (!response.IsSuccessful || string.IsNullOrEmpty(response.Content))
                {
                    return new PaymentInitResponse
                    {
                        Success = false,
                        Message = "Failed to connect to payment gateway",
                        GatewayPageURL = null
                    };
                }

                // Parse response
                var jsonResponse = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(response.Content);
                
                if (jsonResponse != null && jsonResponse.ContainsKey("status"))
                {
                    var status = jsonResponse["status"].ToString();
                    
                    if (status == "SUCCESS" && jsonResponse.ContainsKey("GatewayPageURL"))
                    {
                        return new PaymentInitResponse
                        {
                            Success = true,
                            Message = "Payment session created successfully",
                            GatewayPageURL = jsonResponse["GatewayPageURL"].ToString(),
                            TransactionId = request.TransactionId
                        };
                    }
                }

                return new PaymentInitResponse
                {
                    Success = false,
                    Message = "Payment gateway returned an error",
                    GatewayPageURL = null
                };
            }
            catch (Exception ex)
            {
                return new PaymentInitResponse
                {
                    Success = false,
                    Message = $"Error initiating payment: {ex.Message}",
                    GatewayPageURL = null
                };
            }
        }

        public async Task<PaymentValidationResponse> ValidatePaymentAsync(string transactionId)
        {
            try
            {
                var client = new RestClient();
                var validationUrl = $"{_validationApiUrl}?val_id={transactionId}&store_id={_storeId}&store_passwd={_storePassword}&format=json";
                var restRequest = new RestRequest(validationUrl, Method.Get);

                var response = await client.ExecuteAsync(restRequest);

                if (!response.IsSuccessful || string.IsNullOrEmpty(response.Content))
                {
                    return new PaymentValidationResponse
                    {
                        IsValid = false,
                        Status = "FAILED",
                        Message = "Failed to validate payment"
                    };
                }

                var jsonResponse = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(response.Content);
                
                if (jsonResponse != null && jsonResponse.ContainsKey("status"))
                {
                    var status = jsonResponse["status"].ToString();
                    
                    return new PaymentValidationResponse
                    {
                        IsValid = status == "VALID" || status == "VALIDATED",
                        Status = status ?? "UNKNOWN",
                        Message = status == "VALID" || status == "VALIDATED" ? "Payment validated successfully" : "Payment validation failed",
                        TransactionId = transactionId,
                        Amount = jsonResponse.ContainsKey("amount") ? decimal.Parse(jsonResponse["amount"].ToString() ?? "0") : 0,
                        Currency = jsonResponse.ContainsKey("currency") ? jsonResponse["currency"].ToString() : "BDT"
                    };
                }

                return new PaymentValidationResponse
                {
                    IsValid = false,
                    Status = "UNKNOWN",
                    Message = "Unable to parse validation response"
                };
            }
            catch (Exception ex)
            {
                return new PaymentValidationResponse
                {
                    IsValid = false,
                    Status = "ERROR",
                    Message = $"Error validating payment: {ex.Message}"
                };
            }
        }

        public async Task<List<PaymentMethod>> GetAvailablePaymentMethodsAsync()
        {
            return await Task.FromResult(new List<PaymentMethod>
            {
                new PaymentMethod
                {
                    Id = "bkash",
                    Name = "bKash",
                    Description = "Pay with bKash mobile wallet",
                    Icon = "💳",
                    Country = "Bangladesh",
                    IsActive = true,
                    Type = "mobile_money",
                    MinAmount = 10,
                    MaxAmount = 500000
                },
                new PaymentMethod
                {
                    Id = "nagad",
                    Name = "Nagad",
                    Description = "Pay with Nagad mobile wallet",
                    Icon = "📱",
                    Country = "Bangladesh",
                    IsActive = true,
                    Type = "mobile_money",
                    MinAmount = 10,
                    MaxAmount = 500000
                },
                new PaymentMethod
                {
                    Id = "rocket",
                    Name = "Rocket",
                    Description = "Pay with Rocket mobile wallet",
                    Icon = "🚀",
                    Country = "Bangladesh",
                    IsActive = true,
                    Type = "mobile_money",
                    MinAmount = 10,
                    MaxAmount = 500000
                },
                new PaymentMethod
                {
                    Id = "card",
                    Name = "Credit/Debit Card",
                    Description = "Visa, Mastercard, Amex accepted",
                    Icon = "💳",
                    Country = "International",
                    IsActive = true,
                    Type = "card",
                    MinAmount = 10,
                    MaxAmount = 1000000
                },
                new PaymentMethod
                {
                    Id = "bank",
                    Name = "Bank Transfer",
                    Description = "Direct bank transfer",
                    Icon = "🏦",
                    Country = "Bangladesh",
                    IsActive = true,
                    Type = "bank_transfer",
                    MinAmount = 100,
                    MaxAmount = 10000000
                },
                new PaymentMethod
                {
                    Id = "cash",
                    Name = "Cash/Check",
                    Description = "Manual collection",
                    Icon = "💵",
                    Country = "Bangladesh",
                    IsActive = true,
                    Type = "cash",
                    MinAmount = 10,
                    MaxAmount = null
                }
            });
        }
    }

    // DTOs
    public class PaymentRequest
    {
        public string TransactionId { get; set; } = string.Empty;
        public int CampaignId { get; set; }
        public int DonationId { get; set; }
        public decimal Amount { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public string? CustomerAddress { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string SuccessUrl { get; set; } = string.Empty;
        public string FailUrl { get; set; } = string.Empty;
        public string CancelUrl { get; set; } = string.Empty;
        public string IpnUrl { get; set; } = string.Empty;
        public bool IsAnonymous { get; set; }
    }

    public class PaymentInitResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? GatewayPageURL { get; set; }
        public string? TransactionId { get; set; }
    }

    public class PaymentValidationResponse
    {
        public bool IsValid { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string? TransactionId { get; set; }
        public decimal Amount { get; set; }
        public string? Currency { get; set; }
    }

    public class PaymentMethod
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public string Type { get; set; } = string.Empty;
        public decimal? MinAmount { get; set; }
        public decimal? MaxAmount { get; set; }
    }

    public class PaymentCallback
    {
        [JsonPropertyName("tran_id")]
        public string? TransactionId { get; set; }

        [JsonPropertyName("val_id")]
        public string? ValidationId { get; set; }

        [JsonPropertyName("status")]
        public string? Status { get; set; }

        [JsonPropertyName("currency")]
        public string? Currency { get; set; }

        [JsonPropertyName("amount")]
        public decimal Amount { get; set; }

        [JsonPropertyName("card_type")]
        public string? CardType { get; set; }

        [JsonPropertyName("cus_email")]
        public string? CustomerEmail { get; set; }

        [JsonPropertyName("cus_name")]
        public string? CustomerName { get; set; }

        [JsonPropertyName("value_a")]
        public string? CampaignId { get; set; }

        [JsonPropertyName("value_b")]
        public string? DonationId { get; set; }

        [JsonPropertyName("value_c")]
        public string? IsAnonymous { get; set; }
    }
}
