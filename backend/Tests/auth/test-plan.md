# Test Plan — Authentication & Authorization (feature/auth)

## Scope
Test user registration, login, JWT token validation, and access control for protected APIs.

## Test Types
1. Functional:
   - User registration
   - User login
   - Token-based authentication
2. Negative / Error Handling:
   - Missing required fields
   - Invalid email/password
   - Duplicate registration
3. Security:
   - Access protected endpoints without token
   - Access with invalid token
4. Regression:
   - Re-run all test cases after bug fixes

## Test Tools
- Postman (manual)
- Newman (automation)
- Screenshots / response logs
- CSV / Excel (test cases)

## Test Data
**Sample user:**
```json
{
  "FullName": "Test User",
  "DOB": "1990-07-20",
  "Email": "testuser@example.com",
  "Password": "Test@123",
  "Contact": "0781234567",
  "Role": "Admin"
}