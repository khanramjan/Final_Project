-- Check if VolunteerReports table exists and show its structure
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_NAME IN ('VolunteerReports', 'VolunteerWarnings')
ORDER BY 
    TABLE_NAME, ORDINAL_POSITION;

-- Check if tables exist
SELECT 
    name as TableName,
    create_date as CreatedDate
FROM 
    sys.tables
WHERE 
    name IN ('VolunteerReports', 'VolunteerWarnings');
