-- Check your volunteer profile details
SELECT 
    vp.Id AS ProfileId,
    u.Id AS UserId,
    u.Email,
    u.FirstName,
    u.LastName,
    vp.Status,
    vp.IsVerified,
    vp.Rank,
    vp.AcceptEmailNotifications,
    vp.AcceptSmsNotifications,
    vp.VerifiedAt,
    vp.VerifiedBy
FROM VolunteerProfiles vp
JOIN Users u ON vp.UserId = u.Id;

-- Fix 1: Verify and activate your volunteer profile
UPDATE VolunteerProfiles 
SET Status = 'active', 
    IsVerified = 1, 
    VerifiedAt = GETDATE(),
    VerifiedBy = 2,  -- Admin user ID
    AcceptEmailNotifications = 1,
    AcceptSmsNotifications = 1
WHERE Id = 1;  -- Replace with your actual VolunteerProfile ID

-- Fix 2: If you want to be a Newbie volunteer (to match the campaign request)
UPDATE VolunteerProfiles 
SET Rank = 'newbie'
WHERE Id = 1;  -- Replace with your actual VolunteerProfile ID

-- Or keep your current rank and create campaign requesting YOUR rank
-- For example, if you're "gold", request gold volunteers instead of newbie

-- Verify the changes
SELECT 
    vp.Id,
    u.Email,
    vp.Status,
    vp.IsVerified,
    vp.Rank,
    vp.AcceptEmailNotifications
FROM VolunteerProfiles vp
JOIN Users u ON vp.UserId = u.Id;
