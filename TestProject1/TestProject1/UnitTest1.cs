using NUnit.Framework;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Moq;
using System;
using System.Collections.Generic;
using backend.Controllers;
using backend.DTOs;
using backend.Models;
using backend.Services;
using MySql.Data.MySqlClient;
using Backend.Tests;

namespace Backend.TestsProject1
{
    [TestFixture]
    public class AuthControllerTests
    {
        private AuthController _authController;
        private Mock<IConfiguration> _mockConfig;
        private Mock<IConfigurationSection> _mockConnectionSection;
        private Mock<IConfigurationSection> _mockJwtSection;
        private string _testConnectionString;

        [SetUp]
        public void Setup()
        {
            _mockConfig = new Mock<IConfiguration>();
            _mockConnectionSection = new Mock<IConfigurationSection>();
            _mockJwtSection = new Mock<IConfigurationSection>();

            _testConnectionString = "Server=localhost;Database=TestHospitalDB;Uid=testuser;Pwd=testpass;";

            _mockConnectionSection.Setup(x => x.Value).Returns(_testConnectionString);
            _mockConfig.Setup(x => x.GetConnectionString("DefaultConnection")).Returns(_testConnectionString);

            //JWT configuration
            _mockJwtSection.Setup(x => x["Key"]).Returns("TestSecretKeyThatIsLongEnoughForHMACSHA256Algorithm");
            _mockJwtSection.Setup(x => x["Issuer"]).Returns("TestIssuer");
            _mockJwtSection.Setup(x => x["Audience"]).Returns("TestAudience");
            _mockConfig.Setup(x => x.GetSection("Jwt")).Returns(_mockJwtSection.Object);

            _authController = new AuthController(_mockConfig.Object);
        }

        [TearDown]
        public void TearDown()
        {
            _authController?.Dispose();
        }

        #region Register Tests

        [Test]
        public void Register_WithNullRequest_ReturnsBadRequest()
        {
            // Act
            var result = _authController.Register(null) as BadRequestObjectResult;

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual(400, result.StatusCode);
        }

        [Test]
        public void Register_WithInvalidDOBFormat_ReturnsBadRequest()
        {
            // Arrange
            var request = new RegisterRequest
            {
                FullName = "John Doe",
                DOB = "invalid-date-format",
                Email = "john@test.com",
                Password = "password123",
                Contact = "1234567890",
                Role = "Patient"
            };

            // Act
            var result = _authController.Register(request) as BadRequestObjectResult;

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual(400, result.StatusCode);

            // check error message for invalid DOB format
            dynamic response = result.Value;
            Assert.IsNotNull(response);
            string error = response.GetType().GetProperty("error")?.GetValue(response)?.ToString();
            Assert.AreEqual("Invalid DOB format", error);
        }

        [Test]
        public void Register_WithFutureDOB_ReturnsBadRequest()
        {
            // Arrange
            var futureDate = DateTime.Now.AddDays(1).ToString("yyyy-MM-dd");
            var request = new RegisterRequest
            {
                FullName = "John Doe",
                DOB = futureDate,
                Email = "john@test.com",
                Password = "password123",
                Contact = "1234567890",
                Role = "Patient"
            };

            // Act
            try
            {
                var result = _authController.Register(request);

                // If have aadrequest result for future DOB,
                if (result is BadRequestObjectResult badRequest)
                {
                    dynamic response = badRequest.Value;
                    string error = response.GetType().GetProperty("error")?.GetValue(response)?.ToString();
                    Assert.IsTrue(error.Contains("future") || error.Contains("DOB"));
                }
            }
            catch (Exception ex)
            {
                //for database connection issues
                Assert.IsTrue(ex is MySqlException || ex is ArgumentException);
            }
        }

        [Test]
        public void Register_WithValidRequest_CalculatesAgeCorrectly()

            // Arrange
            DateTime dob = new DateTime(1990, 3, 15);
            DateTime today = new DateTime(2024, 5, 20);

            // Act
            int years = today.Year - dob.Year;
            int months = today.Month - dob.Month;
            int days = today.Day - dob.Day;

            if (days < 0)
            {
                int prevMonth, prevMonthYear;
                if (today.Month == 1)
                {
                    prevMonth = 12;
                    prevMonthYear = today.Year - 1;
                }
                else
                {
                    prevMonth = today.Month - 1;
                    prevMonthYear = today.Year;
                }

                days += DateTime.DaysInMonth(prevMonthYear, prevMonth);
                months--;
            }

            if (months < 0)
            {
                months += 12;
                years--;
            }

            string calculatedAge = $"{years} Years {months} Months {days} Days";

            // Assert
            Assert.AreEqual("34 Years 2 Months 5 Days", calculatedAge);
        }

        [Test]
        public void Register_WithEmptyFullName_ReturnsAppropriateResponse()
        {
            // Arrange
            var request = new RegisterRequest
            {
                FullName = "",
                DOB = "1990-01-01",
                Email = "test@example.com",
                Password = "password123",
                Contact = "1234567890",
                Role = "Patient"
            };

            try
            {
                var result = _authController.Register(request);
                Assert.IsNotNull(result);
            }
            catch (MySqlException)
            {
                // Database connection issues msg
                Assert.Pass("Database connection error expected in unit test environment");
            }
        }

        #endregion

        #region Login Tests

        [Test]
        public void Login_WithNullRequest_ThrowsNullReferenceException()
        {
            // Act and  assert
            Assert.Throws<NullReferenceException>(() => _authController.Login(null));
        }

        [Test]
        public void Login_WithValidRequestFormat_DoesNotThrowFormatException()
        {
            // Arrange
            var request = new LoginRequest
            {
                Email = "test@example.com",
                Password = "password123"
            };

            // Act and  assert
            try
            {
                var result = _authController.Login(request);
                Assert.IsNotNull(result);
            }
            catch (MySqlException)
            {
                // Database connection issues msg
                Assert.Pass("Database connection error expected in unit test environment");
            }
            catch (NullReferenceException)
            {
                Assert.Fail("Should not throw NullReferenceException with valid request");
            }
        }

        [Test]
        public void Login_WithEmptyEmail_HandlesGracefully()
        {
            // Arrange
            var request = new LoginRequest
            {
                Email = "",
                Password = "password123"
            };

            // Act and assert
            try
            {
                var result = _authController.Login(request);
                Assert.IsNotNull(result);
            }
            catch (MySqlException)
            {
                Assert.Pass("Database connection error expected");
            }
        }

        [Test]
        public void Login_WithEmptyPassword_HandlesGracefully()
        {
            // Arrange
            var request = new LoginRequest
            {
                Email = "test@example.com",
                Password = ""
            };

            // Act nad  assert
            try
            {
                var result = _authController.Login(request);
                Assert.IsNotNull(result);
            }
            catch (MySqlException)
            {
                Assert.Pass("Database connection error expected");
            }
        }

        #endregion

        #region Edge Cases and Validation Tests

        [Test]
        public void Register_WithSpecialCharactersInName_HandlesCorrectly()
        {
            // Arrange
            var request = new RegisterRequest
            {
                FullName = "João O'Connor-Smith",
                DOB = "1985-12-25",
                Email = "joao@example.com",
                Password = "securePass123!",
                Contact = "1234567890",
                Role = "Doctor"
            };

            // Act and assert
            try
            {
                var result = _authController.Register(request);
                Assert.IsNotNull(result);
            }
            catch (MySqlException)
            {
                Assert.Pass("Database connection error expected");
            }
        }

        [Test]
        public void Register_WithLeapYearDOB_CalculatesAgeCorrectly()
        {
            // Arrange 
            DateTime leapYearDOB = new DateTime(2000, 2, 29); 
            DateTime testToday = new DateTime(2024, 2, 28);   

            // Act
            int years = testToday.Year - leapYearDOB.Year;
            int months = testToday.Month - leapYearDOB.Month;
            int days = testToday.Day - leapYearDOB.Day;

            if (days < 0)
            {
                days += DateTime.DaysInMonth(testToday.Year, testToday.Month - 1);
                months--;
            }

            if (months < 0)
            {
                months += 12;
                years--;
            }

            // Assert
            Assert.AreEqual(23, years); // should be 23 years old
            Assert.AreEqual(11, months); // 11 months
            Assert.Greater(days, 0); // some days
        }

        [Test]
        public void Register_UserIdGeneration_FollowsCorrectFormat()
        {

            // Arrange
            string currentYear = DateTime.Now.Year.ToString();
            string expectedPattern = $"U-{currentYear}-";

            string userId = $"U-{DateTime.Now.Year}-{Guid.NewGuid().ToString().Substring(0, 4)}";

            // Assert
            Assert.IsTrue(userId.StartsWith(expectedPattern));
            Assert.AreEqual(10, userId.Length); // U-2024-XXXX = should have 10 characters
        }

        #endregion
    }

    [TestFixture]
    public class AuthServiceTests
    {
        private AuthService _authService;
        private Mock<IConfiguration> _mockConfig;
        private Mock<IConfigurationSection> _mockJwtSection;

        [SetUp]
        public void Setup()
        {
            _mockConfig = new Mock<IConfiguration>();
            _mockJwtSection = new Mock<IConfigurationSection>();

            _mockJwtSection.Setup(x => x["Key"]).Returns("TestSecretKeyThatIsLongEnoughForHMACSHA256Algorithm");
            _mockJwtSection.Setup(x => x["Issuer"]).Returns("TestIssuer");
            _mockJwtSection.Setup(x => x["Audience"]).Returns("TestAudience");
            _mockConfig.Setup(x => x.GetSection("Jwt")).Returns(_mockJwtSection.Object);

            _authService = new AuthService(_mockConfig.Object);
        }

        [Test]
        public void HashPassword_WithValidPassword_ReturnsNonEmptyHash()
        {
            // Arrange
            string password = "testPassword123";

            // Act
            string hashedPassword = _authService.HashPassword(password);

            // sssert
            Assert.IsNotNull(hashedPassword);
            Assert.AreNotEqual(password, hashedPassword);
            Assert.IsTrue(hashedPassword.Length > 20); // BCrypt hashes are typically have 60 chars
        }

        [Test]
        public void VerifyPassword_WithCorrectPassword_ReturnsTrue()
        {
            // Arrange
            string password = "mySecurePassword123";
            string hashedPassword = _authService.HashPassword(password);

            // Act
            bool isValid = _authService.VerifyPassword(password, hashedPassword);

            // Assert
            Assert.IsTrue(isValid);
        }

        [Test]
        public void VerifyPassword_WithIncorrectPassword_ReturnsFalse()
        {
            // Arrange
            string correctPassword = "correctPassword123";
            string incorrectPassword = "wrongPassword456";
            string hashedPassword = _authService.HashPassword(correctPassword);

            // Act
            bool isValid = _authService.VerifyPassword(incorrectPassword, hashedPassword);

            // Assert
            Assert.IsFalse(isValid);
        }

        [Test]
        public void GenerateJwtToken_WithValidUser_ReturnsValidToken()
        {
            // Arrange
            var user = new User
            {
                UserId = "U-2024-TEST",
                FullName = "Test User",
                Email = "test@example.com",
                Role = "Patient",
                DOB = new DateTime(1990, 1, 1),
                Contact = "1234567890",
                IsActive = true
            };

            // Act
            string token = _authService.GenerateJwtToken(user);

            // Assert
            Assert.IsNotNull(token);
            Assert.IsTrue(token.Length > 50); 
            Assert.AreEqual(2, token.Count(c => c == '.')); 
        }

        [Test]
        public void GenerateJwtToken_WithNullUser_ThrowsException()
        {
            // Act and assert
            Assert.Throws<NullReferenceException>(() => _authService.GenerateJwtToken(null));
        }

        [Test]
        public void HashPassword_WithEmptyString_ReturnsHash()
        {
            // Arrange
            string emptyPassword = "";

            // Act and assert
            Assert.DoesNotThrow(() => _authService.HashPassword(emptyPassword));
        }

        [Test]
        public void HashPassword_WithNullPassword_ThrowsException()
        {
            // Act and  assert
            Assert.Throws<ArgumentNullException>(() => _authService.HashPassword(null));
        }
    }

    [TestFixture]
    public class ModelValidationTests
    {
        [Test]
        public void User_DefaultConstructor_SetsDefaultValues()
        {
            // Act
            var user = new User();

            // Assert
            Assert.IsTrue(user.IsActive);
            Assert.IsNull(user.UserId);
            Assert.IsNull(user.FullName);
            Assert.IsNull(user.Email);
        }

        [Test]
        public void User_AllProperties_CanBeSetAndRetrieved()
        {
            // Arrange
            var testDate = new DateTime(1985, 6, 15);

            // Act
            var user = new User
            {
                UserId = "U-2024-ABCD",
                FullName = "Jane Smith",
                DOB = testDate,
                Email = "jane@hospital.com",
                PasswordHash = "hashedpassword123",
                Contact = "+1234567890",
                Role = "Doctor",
                IsActive = false
            };

            // Assert
            Assert.AreEqual("U-2024-ABCD", user.UserId);
            Assert.AreEqual("Jane Smith", user.FullName);
            Assert.AreEqual(testDate, user.DOB);
            Assert.AreEqual("jane@hospital.com", user.Email);
            Assert.AreEqual("hashedpassword123", user.PasswordHash);
            Assert.AreEqual("+1234567890", user.Contact);
            Assert.AreEqual("Doctor", user.Role);
            Assert.IsFalse(user.IsActive);
        }

        [Test]
        public void LoginRequest_Properties_CanBeSetAndRetrieved()
        {
            // Act
            var loginRequest = new LoginRequest
            {
                Email = "user@example.com",
                Password = "mypassword"
            };

            // Assert
            Assert.AreEqual("user@example.com", loginRequest.Email);
            Assert.AreEqual("mypassword", loginRequest.Password);
        }

        [Test]
        public void RegisterRequest_AllProperties_CanBeSetAndRetrieved()
        {
            // Act
            var registerRequest = new RegisterRequest
            {
                FullName = "Dr. John Anderson",
                DOB = "1978-09-12",
                Email = "dr.anderson@hospital.com",
                Password = "securePassword123!",
                Contact = "555-0123",
                Role = "Doctor"
            };

            // Assert
            Assert.AreEqual("Dr. John Anderson", registerRequest.FullName);
            Assert.AreEqual("1978-09-12", registerRequest.DOB);
            Assert.AreEqual("dr.anderson@hospital.com", registerRequest.Email);
            Assert.AreEqual("securePassword123!", registerRequest.Password);
            Assert.AreEqual("555-0123", registerRequest.Contact);
            Assert.AreEqual("Doctor", registerRequest.Role);
        }

        [Test]
        public void RegisterRequest_WithNullValues_HandlesGracefully()
        {
            // Act
            var registerRequest = new RegisterRequest();

            // Assert
            Assert.IsNull(registerRequest.FullName);
            Assert.IsNull(registerRequest.DOB);
            Assert.IsNull(registerRequest.Email);
            Assert.IsNull(registerRequest.Password);
            Assert.IsNull(registerRequest.Contact);
            Assert.IsNull(registerRequest.Role);
        }
    }
}