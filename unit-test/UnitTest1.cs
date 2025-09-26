using HospitalManagementSystem.Services;
using HospitalManagementSystem.Models;
using Microsoft.Extensions.Configuration;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;

namespace HospitalManagementSystem.Tests
{
    [TestFixture]
    public class AuthServiceTests
    {
        private AuthService _authService;  // ✅ real AuthService, not your test class

        [SetUp]
        public void Setup()
        {
            // Fake JWT config for testing
            var inMemorySettings = new Dictionary<string, string?>
            {
                {"Jwt:Key", "ThisIsASecretKeyForTestingOnly12345"},
                {"Jwt:Issuer", "TestIssuer"},
                {"Jwt:Audience", "TestAudience"}
            };

            IConfiguration configuration = new ConfigurationBuilder()
                .AddInMemoryCollection(inMemorySettings!)
                .Build();

            _authService = new AuthService(configuration);
        }

        [Test]
        public void HashPassword_And_VerifyPassword_ShouldMatch()
        {
            string password = "MySecurePassword";
            string hash = _authService.HashPassword(password);

            Assert.IsTrue(_authService.VerifyPassword(password, hash),
                "Password verification failed—hash and password should match.");
        }

        [Test]
        public void VerifyPassword_ShouldFail_ForWrongPassword()
        {
            string password = "CorrectPassword";
            string wrongPassword = "WrongPassword";

            string hash = _authService.HashPassword(password);

            Assert.IsFalse(_authService.VerifyPassword(wrongPassword, hash),
                "Verification should fail when using the wrong password.");
        }

        [Test]
        public void GenerateJwtToken_ShouldContainUserClaims()
        {
            var user = new User
            {
                Email = "test@example.com",
                Role = "Admin"
            };

            string token = _authService.GenerateJwtToken(user);

            var handler = new JwtSecurityTokenHandler();
            var jwt = handler.ReadJwtToken(token);

            Assert.AreEqual("test@example.com", jwt.Payload["unique_name"]);
            Assert.AreEqual("Admin", jwt.Payload["role"]);
        }

        [Test]
        public void GenerateJwtToken_ShouldExpireIn30Minutes()
        {
            var user = new User { Email = "exp@example.com", Role = "Doctor" };

            string token = _authService.GenerateJwtToken(user);
            var handler = new JwtSecurityTokenHandler();
            var jwt = handler.ReadJwtToken(token);

            var timeToExpire = jwt.ValidTo - DateTime.UtcNow;

            Assert.IsTrue(timeToExpire.TotalMinutes <= 31 && timeToExpire.TotalMinutes >= 29,
                $"Token expiry should be ~30 minutes, but was {timeToExpire.TotalMinutes} minutes.");
        }
    }
}
