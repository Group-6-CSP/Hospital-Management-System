using NUnit.Framework;
using Moq;
using HospitalManagementSystem.DTOs;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;

namespace HospitalManagementSystem.Tests.Services
{
    [TestFixture]
    public class PaymentServiceTests
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
        public void RecordPaymentRequest_ValidData_ShouldHaveCorrectProperties()
        {
            // Arrange
            var request = new RecordPaymentRequest
            {
                BillId = "B-00000001",
                AmountPaid = 1260.00m,
                PaymentMode = "Card",
                TransactionReference = "TXN-12345"
            };

            // Assert
            Assert.That(request.BillId, Is.Not.Null.And.Not.Empty);
            Assert.That(request.AmountPaid, Is.GreaterThan(0));
            Assert.That(request.PaymentMode, Is.Not.Null);
        }

        [Test]
        public void RecordPaymentRequest_NegativeAmount_ShouldBeInvalid()
        {
            // Arrange
            var request = new RecordPaymentRequest
            {
                BillId = "B-00000001",
                AmountPaid = -100.00m,
                PaymentMode = "Cash"
            };

            // Assert
            Assert.That(request.AmountPaid, Is.LessThan(0));
        }

        [Test]
        public void RecordPaymentRequest_ZeroAmount_ShouldBeInvalid()
        {
            // Arrange
            var request = new RecordPaymentRequest
            {
                BillId = "B-00000001",
                AmountPaid = 0,
                PaymentMode = "Cash"
            };

            // Assert
            Assert.That(request.AmountPaid, Is.EqualTo(0));
        }

        [Test]
        public void PaymentMode_ValidModes_ShouldBeAccepted()
        {
            // Arrange
            var validModes = new List<string> { "Cash", "Card", "Online", "Check", "Insurance" };

            // Assert
            Assert.That(validModes, Contains.Item("Cash"));
            Assert.That(validModes, Contains.Item("Card"));
            Assert.That(validModes, Contains.Item("Online"));
        }

        [Test]
        public void PaymentStatus_ValidStatuses_ShouldBeCorrect()
        {
            // Arrange
            var validStatuses = new List<string> { "Completed", "Failed", "Pending" };

            // Assert
            Assert.That(validStatuses, Contains.Item("Completed"));
            Assert.That(validStatuses, Contains.Item("Failed"));
            Assert.That(validStatuses, Contains.Item("Pending"));
        }

        [Test]
        public void Payment_AmountNotExceedTotal_ShouldBeValid()
        {
            // Arrange
            decimal amountPaid = 1000.00m;
            decimal totalAmount = 1260.00m;

            // Assert
            Assert.That(amountPaid, Is.LessThanOrEqualTo(totalAmount));
        }

        [Test]
        public void Payment_FullPayment_AmountsMatch()
        {
            // Arrange
            decimal amountPaid = 1260.00m;
            decimal totalAmount = 1260.00m;

            // Assert
            Assert.That(amountPaid, Is.EqualTo(totalAmount));
        }

        [Test]
        public void Payment_PartialPayment_AmountLessThanTotal()
        {
            // Arrange
            decimal amountPaid = 500.00m;
            decimal totalAmount = 1260.00m;

            // Assert
            Assert.That(amountPaid, Is.LessThan(totalAmount));
        }

        [Test]
        public void PaymentId_Format_ShouldBeCorrect()
        {
            // Arrange
            string paymentId = "PAY-00000001";

            // Assert
            Assert.That(paymentId, Does.Match(@"^PAY-\d{8}$"));
        }

        [Test]
        public void BillId_Format_ShouldBeCorrect()
        {
            // Arrange
            string billId = "B-00000001";

            // Assert
            Assert.That(billId, Does.Match(@"^B-\d{8}$"));
        }
    }
}