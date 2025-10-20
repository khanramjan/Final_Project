# ✅ Complete Testing Guide - Donation Progress Update

## 🎯 What We're Testing

When you make a successful donation:
1. ✅ Payment succeeds (sandbox test)
2. ✅ Database updates (Donation status → completed)
3. ✅ **Campaign progress increases** (RaisedAmount updated)
4. ✅ Success page shows
5. ✅ **Progress bar on campaign page reflects the increase**

---

## 📋 Step-by-Step Test

### Before Starting
You should see **TWO new windows** that just opened:
- **Backend Server** window (black console with .NET logs)
- **Frontend Server** window (shows VITE dev server)

**Wait 10 seconds** for both to fully start.

---

### Step 1: Note Current Progress
1. Open: **http://localhost:5173/campaigns**
2. Find any active campaign
3. **Write down** the current stats:
   - Current Raised Amount: **৳______**
   - Current Progress: **____%**
   - Goal Amount: **৳______**

Example: "Campaign has ৳5,000 raised (10% of ৳50,000 goal)"

---

### Step 2: Make Donation
1. Click **"Donate Now"** on that campaign
2. Modern modal appears
3. Select amount: **৳500**
4. Select payment method: **bKash** (or any)
5. Click **"Continue"**
6. Enter name: **Test User**
7. Email (optional): **test@example.com**
8. Click **"Donate ৳500"**

---

### Step 3: Complete Payment (Sandbox)
1. Browser redirects to SSLCommerz sandbox
2. You'll see a **test payment page**
3. A **popup appears** asking: "Success or Failure?"
4. Click **"Success"** button

---

### Step 4: Watch Backend Logs
In the **Backend Server window**, you should see:

```
=== Payment Success Callback ===
Transaction ID: TXN123_456789
Donation ID (value_b): 15
Campaign ID (value_a): 2
Amount: 500
Status: VALID
Is Sandbox: True
✓ Sandbox mode - skipping SSLCommerz validation
Method 1: Looking for donation by ID: 15
✓ Found donation by ID: 15

✓ Processing donation: ID=15, Status=pending, Amount=৳500
Updating donation status to 'completed'...
Campaign raised amount: ৳5000 → ৳5500 (+৳500)
✓ Database updated successfully!

✓ Redirecting to: http://localhost:5173/payment/success?donationId=15&transactionId=TXN123...
```

---

### Step 5: Verify Success Page
Browser should redirect to **Payment Success** page showing:
- ✅ "Payment Successful!" header
- ✅ Donation Amount: **৳500**
- ✅ Transaction ID: **TXN123_...**
- ✅ Campaign Name
- ✅ Status: **completed**
- ✅ **"View Updated Campaign"** button

---

### Step 6: Verify Progress Update
1. Click **"View Updated Campaign"** button
   OR go back to: http://localhost:5173/campaigns

2. Find the campaign you donated to

3. **Verify the update:**
   - Raised Amount increased: **৳5,000 → ৳5,500** ✅
   - Progress increased: **10% → 11%** ✅
   - Progress bar visually longer ✅

---

## 🔍 Troubleshooting

### Issue: "Payment Failed" Page Appears

**Check Backend Logs:**
Look in the **Backend Server window** for errors:

**Common Error 1: "Donation not found"**
```
✗ ERROR: Donation not found by any method!
Recent donations in database:
  ID: 14, Status: completed, PaymentRef: TXN122, Amount: 250
  ID: 13, Status: pending, PaymentRef: TXN121, Amount: 100
```
**Solution**: The fallback method will find the most recent pending donation

**Common Error 2: "Exception"**
```
✗ ERROR in PaymentSuccess: Object reference not set...
```
**Solution**: Check database connection in appsettings.json

---

### Issue: Progress Not Updating

**Check 1: Database**
Open SQL Server Management Studio:
```sql
-- Check if donation was marked completed
SELECT TOP 5 * FROM Donations ORDER BY Id DESC

-- Check if campaign amount increased
SELECT Id, Title, GoalAmount, RaisedAmount 
FROM Campaigns 
WHERE Id = 2  -- Replace with your campaign ID
```

**Expected:**
- Donation Status should be "completed"
- Campaign RaisedAmount should have increased

**Check 2: Frontend Cache**
- Hard refresh browser: **Ctrl+Shift+R** or **Ctrl+F5**
- Clear cache and reload

---

### Issue: Servers Not Running

**Check Backend:**
Open new PowerShell:
```powershell
Test-NetConnection -ComputerName localhost -Port 5000
```
Should show: `TcpTestSucceeded : True`

**Check Frontend:**
Open browser: http://localhost:5173
Should show landing page

**If not running:**
Run START.bat again or manually:
```powershell
# Terminal 1 - Backend
cd "C:\Users\DELL\Desktop\Final Project\Donation_Management_System\backend\DonationManagementSystem.API"
dotnet run

# Terminal 2 - Frontend
cd "C:\Users\DELL\Desktop\Final Project\Donation_Management_System\frontend"
npm run dev
```

---

## 📊 Database Verification

After successful payment, check database directly:

```sql
-- 1. Find the completed donation
SELECT TOP 1 
    Id, 
    CampaignId,
    Amount, 
    Status, 
    PaymentReference,
    CreatedAt,
    CompletedAt
FROM Donations 
WHERE Status = 'completed'
ORDER BY CompletedAt DESC

-- 2. Check campaign raised amount
SELECT 
    c.Id,
    c.Title,
    c.GoalAmount,
    c.RaisedAmount,
    CAST((c.RaisedAmount * 100.0 / c.GoalAmount) AS DECIMAL(5,2)) AS ProgressPercent,
    COUNT(d.Id) AS TotalDonations
FROM Campaigns c
LEFT JOIN Donations d ON c.Id = d.CampaignId AND d.Status = 'completed'
GROUP BY c.Id, c.Title, c.GoalAmount, c.RaisedAmount
ORDER BY c.Id

-- 3. Verify the math
-- RaisedAmount should = Sum of all completed donations
SELECT 
    c.Id AS CampaignId,
    c.RaisedAmount AS CampaignRaisedAmount,
    ISNULL(SUM(d.Amount), 0) AS ActualDonationsSum,
    CASE 
        WHEN c.RaisedAmount = ISNULL(SUM(d.Amount), 0) 
        THEN '✓ Match' 
        ELSE '✗ Mismatch' 
    END AS Status
FROM Campaigns c
LEFT JOIN Donations d ON c.Id = d.CampaignId AND d.Status = 'completed'
GROUP BY c.Id, c.RaisedAmount
```

---

## ✅ Success Criteria

Test is successful when:
- [x] Payment Success page appears (not Failed)
- [x] Backend logs show "Database updated successfully!"
- [x] Donation status in database is "completed"
- [x] Campaign RaisedAmount increased by donation amount
- [x] Progress percentage increased correctly
- [x] Frontend campaign page shows updated progress
- [x] Progress bar visual matches percentage

---

## 🎯 Expected Results

**Starting State:**
- Campaign: "Help Feed 100 Families"
- Goal: ৳50,000
- Raised: ৳5,000
- Progress: 10%
- Donations: 20 completed

**After ৳500 Donation:**
- Goal: ৳50,000 (unchanged)
- Raised: ৳5,500 (+৳500) ✅
- Progress: 11% (+1%) ✅
- Donations: 21 completed (+1) ✅

**Progress Calculation:**
```
Progress = (RaisedAmount / GoalAmount) × 100
Before: (5000 / 50000) × 100 = 10%
After:  (5500 / 50000) × 100 = 11% ✅
```

---

## 📝 Test Report Template

Use this to document your test:

```
TEST DATE: October 20, 2025
TESTER: [Your Name]

CAMPAIGN TESTED:
- Name: ___________________________
- ID: ___
- Goal: ৳__________

BEFORE DONATION:
- Raised Amount: ৳__________
- Progress: ____%
- Total Donations: ____

DONATION MADE:
- Amount: ৳500
- Payment Method: bKash
- Transaction ID: ___________________

BACKEND LOGS:
[ ] Success callback received
[ ] Donation found
[ ] Status updated to completed
[ ] Campaign amount updated
[ ] No errors

AFTER DONATION:
- Raised Amount: ৳__________ (Expected: +৳500)
- Progress: ____% (Expected: +1%)
- Total Donations: ____ (Expected: +1)

RESULT:
[ ] PASS - Progress updated correctly
[ ] FAIL - Issue: _____________________
```

---

## 🚀 Next Steps After Successful Test

Once everything works:

1. **Test Multiple Donations**
   - Make 3-4 donations to same campaign
   - Verify progress increases each time

2. **Test Different Amounts**
   - Try ৳100, ৳250, ৳1000
   - Verify math is correct

3. **Test Different Campaigns**
   - Donate to multiple campaigns
   - Verify each tracks separately

4. **Test Edge Cases**
   - Campaign at 99% → donate to reach 100%
   - Very small donations (৳10)
   - Large donations (৳10,000)

5. **Production Deployment**
   - Update appsettings.json with production credentials
   - Set IsSandbox: false
   - Test with real payment methods

---

**Ready to test?** ✅
The servers should be running now. Follow the steps above!
