# Hospital Management System - Bug Report


Bug ID: QA-001  
Title: Registration accepts invalid email format  
Severity: Major (data integrity issue)  
Priority: High  
Steps to Reproduce: Register with email testuser2example.com (missing @)  
Expected: 400 Bad Request  
Actual: User registered successfully  


Bug ID: QA-002  
Title: Registration accepts weak password  
Severity: Major (security issue)  
Priority: High  
Steps to Reproduce: Register with password test123  
Expected: 400 Bad Request  
Actual: User registered successfully  


Bug ID: QA-003  
Title: Registration vulnerable to SQL injection in email  
Severity: Critical (security issue)  
Priority: Critical  
Steps to Reproduce: Register with email:  "testSQLI@example.com' OR 1=1 --"  
Expected: 400 Bad Request or input sanitized  
Actual: User registered successfully