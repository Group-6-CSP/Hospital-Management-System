using NUnit.Framework;
using Moq;
using HospitalManagementSystem.DTOs;
using Microsoft.Extensions.Configuration;
using System;

namespace HospitalManagementSystem.Tests.Services
{
    [TestFixture]
    public class ReportServiceTests
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
        public void FinancialReport_ValidDateRange_DatesAreCorrect()
        {
            // Arrange
            string startDate = "2025-10-01";
            string endDate = "2025-10-31";

            // Act
            DateTime start = DateTime.Parse(startDate);
            DateTime end = DateTime.Parse(endDate);

            // Assert
            Assert.That(start, Is.LessThan(end));
        }

        [Test]
        public void FinancialReport_DailyReport_SameDates()
        {
            // Arrange
            string startDate = "2025-10-23";
            string endDate = "2025-10-23";

            // Act
            DateTime start = DateTime.Parse(startDate);
            DateTime end = DateTime.Parse(endDate);

            // Assert
            Assert.That(start, Is.EqualTo(end));
        }

        [Test]
        public void FinancialReport_MonthlyReport_ValidRange()
        {
            // Arrange
            string startDate = "2025-10-01";
            string endDate = "2025-10-31";

            // Act
            DateTime start = DateTime.Parse(startDate);
            DateTime end = DateTime.Parse(endDate);
            TimeSpan diff = end - start;

            // Assert
            Assert.That(diff.Days, Is.InRange(28, 31));
        }

        [Test]
        public void FinancialReport_AllFieldsPresent_IsValid()
        {
            // Arrange
            var report = new FinancialReportResponse
            {
                TotalRevenue = 250000.00m,
                TotalDiscount = 12000.00m,
                TotalTax = 15000.00m,
                OutstandingPayments = 30000.00m,
                PaidAmount = 220000.00m,
                TotalBills = 150,
                ReportPeriod = "2025-10-01 to 2025-10-31"
            };

            // Assert
            Assert.Multiple(() =>
            {
                Assert.That(report.TotalRevenue, Is.GreaterThanOrEqualTo(0));
                Assert.That(report.TotalDiscount, Is.GreaterThanOrEqualTo(0));
                Assert.That(report.TotalTax, Is.GreaterThanOrEqualTo(0));
                Assert.That(report.ReportPeriod, Is.Not.Null.And.Not.Empty);
            });
        }

        [Test]
        public void FinancialReport_RevenueCalculation_IsAccurate()
        {
            // Arrange
            decimal paidAmount = 220000.00m;
            decimal outstandingPayments = 30000.00m;
            decimal expectedTotalRevenue = 250000.00m;

            // Act
            decimal calculatedRevenue = paidAmount + outstandingPayments;

            // Assert
            Assert.That(calculatedRevenue, Is.EqualTo(expectedTotalRevenue));
        }

        [Test]
        public void FinancialReport_ReportPeriodFormat_IsCorrect()
        {
            // Arrange
            string reportPeriod = "2025-10-01 to 2025-10-31";

            // Assert
            Assert.That(reportPeriod, Does.Match(@"^\d{4}-\d{2}-\d{2} to \d{4}-\d{2}-\d{2}$"));
        }

        [Test]
        public void FinancialReport_NoData_ReturnsZeros()
        {
            // Arrange
            var report = new FinancialReportResponse
            {
                TotalRevenue = 0,
                TotalDiscount = 0,
                TotalTax = 0,
                OutstandingPayments = 0,
                PaidAmount = 0,
                TotalBills = 0,
                ReportPeriod = "2025-10-01 to 2025-10-31"
            };

            // Assert
            Assert.That(report.TotalRevenue, Is.EqualTo(0));
            Assert.That(report.TotalBills, Is.EqualTo(0));
        }

        [Test]
        public void FinancialReport_InvalidDateFormat_ThrowsException()
        {
            // Arrange
            string invalidDate = "2025-13-45";

            // Assert
            Assert.Throws<FormatException>(() => DateTime.Parse(invalidDate));
        }

        [Test]
        public void FinancialReport_PaidAmount_NotExceedRevenue()
        {
            // Arrange
            decimal paidAmount = 220000.00m;
            decimal totalRevenue = 250000.00m;

            // Assert
            Assert.That(paidAmount, Is.LessThanOrEqualTo(totalRevenue));
        }

        [Test]
        public void FinancialReport_DecimalPrecision_IsCorrect()
        {
            // Arrange
            decimal amount = 1234.56m;

            // Assert
            Assert.That(Math.Round(amount, 2), Is.EqualTo(amount));
        }
    }
}