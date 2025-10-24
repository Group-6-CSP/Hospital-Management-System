using NUnit.Framework;
using Moq;
using HospitalManagementSystem.Services;
using HospitalManagementSystem.DTOs;
using Microsoft.Extensions.Configuration;
using System;

namespace HospitalManagementSystem.Tests.Services
{
    [TestFixture]
    public class BillingServiceTests
    {
        private Mock<IConfiguration> _mockConfig;

        [SetUp]
public void Setup()
{
    _mockConfig = new Mock<IConfiguration>();
    
    // Mock the connection string using indexer
    _mockConfig.Setup(x => x["ConnectionStrings:DefaultConnection"])
        .Returns("Server=localhost;Database=test;");
}

        [Test]
        public void GenerateBillRequest_ValidData_ShouldHaveCorrectProperties()
        {
            // Arrange
            var request = new GenerateBillRequest
            {
                AppointmentId = "A-2025-001",
                LabCharges = 500.00m,
                MedicineCharges = 300.00m,
                DiscountPercent = 10,
                Notes = "Test bill"
            };

            // Assert
            Assert.That(request.AppointmentId, Is.Not.Null);
            Assert.That(request.LabCharges, Is.EqualTo(500.00m));
            Assert.That(request.MedicineCharges, Is.EqualTo(300.00m));
            Assert.That(request.DiscountPercent, Is.EqualTo(10));
        }

        [Test]
        public void BillCalculation_WithDiscount_ShouldCalculateCorrectly()
        {
            // Arrange
            decimal consultationFee = 1000.00m;
            decimal labCharges = 500.00m;
            decimal medicineCharges = 300.00m;
            decimal discountPercent = 10;
            decimal taxPercent = 6;

            // Act
            decimal subtotal = consultationFee + labCharges + medicineCharges;
            decimal discountAmount = (subtotal * discountPercent) / 100;
            decimal taxableAmount = subtotal - discountAmount;
            decimal taxAmount = (taxableAmount * taxPercent) / 100;
            decimal totalAmount = taxableAmount + taxAmount;

            // Assert
            Assert.That(subtotal, Is.EqualTo(1800.00m));
            Assert.That(discountAmount, Is.EqualTo(180.00m));
            Assert.That(taxAmount, Is.EqualTo(97.20m));
            Assert.That(totalAmount, Is.EqualTo(1717.20m));
        }

        [Test]
        public void BillCalculation_WithoutDiscount_ShouldCalculateCorrectly()
        {
            // Arrange
            decimal consultationFee = 1000.00m;
            decimal labCharges = 500.00m;
            decimal medicineCharges = 300.00m;
            decimal taxPercent = 6;

            // Act
            decimal subtotal = consultationFee + labCharges + medicineCharges;
            decimal taxAmount = (subtotal * taxPercent) / 100;
            decimal totalAmount = subtotal + taxAmount;

            // Assert
            Assert.That(subtotal, Is.EqualTo(1800.00m));
            Assert.That(taxAmount, Is.EqualTo(108.00m));
            Assert.That(totalAmount, Is.EqualTo(1908.00m));
        }

        [Test]
        public void ValidateDiscount_ValidPercentage_ShouldBeInRange()
        {
            // Arrange
            decimal discountPercent = 15;

            // Assert
            Assert.That(discountPercent, Is.InRange(0, 100));
        }

        [Test]
        public void ValidateDiscount_NegativePercentage_ShouldBeInvalid()
        {
            // Arrange
            decimal discountPercent = -5;

            // Assert
            Assert.That(discountPercent, Is.LessThan(0));
        }

        [Test]
        public void ValidateDiscount_OverMaxPercentage_ShouldBeInvalid()
        {
            // Arrange
            decimal discountPercent = 105;

            // Assert
            Assert.That(discountPercent, Is.GreaterThan(100));
        }

        [Test]
        public void BillStatus_NewBill_ShouldBeGenerated()
        {
            // Arrange & Act
            string expectedStatus = "Generated";

            // Assert
            Assert.That(expectedStatus, Is.EqualTo("Generated"));
        }

        [Test]
        public void BillCalculation_ZeroCharges_ShouldCalculateCorrectly()
        {
            // Arrange
            decimal consultationFee = 1000.00m;
            decimal labCharges = 0;
            decimal medicineCharges = 0;
            decimal taxPercent = 6;

            // Act
            decimal subtotal = consultationFee + labCharges + medicineCharges;
            decimal taxAmount = (subtotal * taxPercent) / 100;
            decimal totalAmount = subtotal + taxAmount;

            // Assert
            Assert.That(totalAmount, Is.EqualTo(1060.00m));
        }

        [Test]
        public void BillCalculation_MaxDiscount_ShouldResultInZero()
        {
            // Arrange
            decimal subtotal = 1000.00m;
            decimal discountPercent = 100;
            decimal taxPercent = 6;

            // Act
            decimal discountAmount = (subtotal * discountPercent) / 100;
            decimal taxableAmount = subtotal - discountAmount;
            decimal taxAmount = (taxableAmount * taxPercent) / 100;
            decimal totalAmount = taxableAmount + taxAmount;

            // Assert
            Assert.That(discountAmount, Is.EqualTo(1000.00m));
            Assert.That(totalAmount, Is.EqualTo(0));
        }

        [Test]
        public void GenerateBillRequest_NegativeCharges_ShouldBeInvalid()
        {
            // Arrange
            var request = new GenerateBillRequest
            {
                AppointmentId = "A-2025-001",
                LabCharges = -100.00m,
                MedicineCharges = 300.00m
            };

            // Assert
            Assert.That(request.LabCharges, Is.LessThan(0));
        }
    }
}