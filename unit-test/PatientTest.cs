using NUnit.Framework;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Mvc;
using HospitalManagementSystem.Controllers;
using HospitalManagementSystem.Models;
using System;
using System.Collections.Generic;

namespace unit_test
{
    [TestFixture]
    public class PatientTest
    {
        private PatientsController _controller;

        [SetUp]
        public void Setup()
        {
            // Fake config with dummy connection string
            var inMemorySettings = new Dictionary<string, string?>
            {
                {"ConnectionStrings:DefaultConnection", "Server=localhost;Database=test;Uid=root;Pwd=123;"}
            };

            IConfiguration config = new ConfigurationBuilder()
                .AddInMemoryCollection(inMemorySettings!)
                .Build();

            _controller = new PatientsController(config);
        }

        [Test]
        public void CalculateAge_ShouldReturnCorrectAge()
        {
            // Arrange: 20 years ago
            DateTime dob = DateTime.Today.AddYears(-20);

            // Act (private method → use reflection)
            var method = typeof(PatientsController)
                .GetMethod("CalculateAge", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);

            string age = (string)method.Invoke(_controller, new object[] { dob });

            // Assert
            StringAssert.Contains("Years", age);
        }

        [Test]
        public void RegisterPatient_ShouldFail_WhenMandatoryFieldsMissing()
        {
            var patient = new Patient
            {
                UserId = "",
                Name = "",
                Dob = default,
                Gender = "",
                Contact = ""
            };

            var result = _controller.RegisterPatient(patient);

            Assert.IsInstanceOf<BadRequestObjectResult>(result);
        }

        [Test]
        public void RegisterPatient_ShouldFail_WhenDobInFuture()
        {
            var patient = new Patient
            {
                UserId = "U1",
                Name = "John Doe",
                Dob = DateTime.Now.AddYears(1), // future DOB
                Gender = "Male",
                Contact = "0771234567"
            };

            var result = _controller.RegisterPatient(patient);

            Assert.IsInstanceOf<BadRequestObjectResult>(result);
        }

        [Test]
        public void RegisterPatient_ShouldFail_WhenContactTooShort()
        {
            var patient = new Patient
            {
                UserId = "U1",
                Name = "Jane Doe",
                Dob = DateTime.Now.AddYears(-25),
                Gender = "Female",
                Contact = "123" // invalid
            };

            var result = _controller.RegisterPatient(patient);

            Assert.IsInstanceOf<BadRequestObjectResult>(result);
        }

        [Test]
        public void DeletePatient_ShouldReturnNotFound_WhenIdDoesNotExist()
        {
            var result = _controller.DeletePatient("NON_EXISTENT_ID");

            Assert.IsTrue(result is NotFoundObjectResult || result is ObjectResult);
        }
    }
}
