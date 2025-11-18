-- Update user password for 003khanramjan@gmail.com
USE DonationDB;
GO

-- This hash is for password: ramjankh08
UPDATE Users 
SET PasswordHash = '$2a$11$vN5xH.fK8qE3yM5YR7.Z4eGXqPYJKH1Hc8NwzW7EQX3MK9R6hL8em',
    UserType = 'admin',
    IsEmailVerified = 1,
    IsActive = 1
WHERE Email = '003khanramjan@gmail.com';
GO

SELECT Id, UserType, FirstName, LastName, Email, IsActive, IsEmailVerified
FROM Users 
WHERE Email = '003khanramjan@gmail.com';
GO

PRINT 'Updated! Login with: 003khanramjan@gmail.com / ramjankh08';
GO
