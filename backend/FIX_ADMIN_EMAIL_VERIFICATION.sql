-- Fix Admin Email Verification Issue
-- This script marks all admin accounts as email verified
-- Run this in SQL Server Management Studio or any SQL client

USE DonationDB;
GO

-- Update all admin users to have verified email
UPDATE Users
SET IsEmailVerified = 1
WHERE UserType = 'admin';

-- Show affected users
SELECT 
    Id, 
    Email, 
    FirstName, 
    LastName, 
    UserType, 
    IsActive, 
    IsEmailVerified,
    CreatedAt
FROM Users
WHERE UserType = 'admin';

PRINT 'Admin email verification fixed!';
GO
