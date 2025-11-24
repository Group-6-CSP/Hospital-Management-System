using System;
using MySql.Data.MySqlClient;
using HospitalManagementSystem.DTOs;
using Microsoft.Extensions.Configuration;

namespace HospitalManagementSystem.Services
{
    public class ReportService
    {
        private readonly string _connectionString;
        private readonly IConfiguration _config;

        public ReportService(IConfiguration config)
        {
            _config = config;

            // FIXED for Azure connection string retrieval
            _connectionString =
                Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
                ?? _config.GetConnectionString("DefaultConnection");
        }

        private decimal SafeGetDecimal(MySqlDataReader reader, string columnName)
        {
            return reader[columnName] == DBNull.Value ? 0 : Convert.ToDecimal(reader[columnName]);
        }

        // Generate financial report
        public FinancialReportResponse GenerateFinancialReport(string startDate, string endDate)
        {
            using var connection = new MySqlConnection(_connectionString);
            connection.Open();

            DateTime from = string.IsNullOrEmpty(startDate) ? DateTime.MinValue : DateTime.Parse(startDate);
            DateTime to = string.IsNullOrEmpty(endDate) ? DateTime.MaxValue : DateTime.Parse(endDate);

            // Total revenue
            var revenueCmd = new MySqlCommand(
                @"SELECT COALESCE(SUM(b.TotalAmount), 0) FROM Bills b
                  WHERE b.Status='Paid' AND b.BillDate >= @From AND b.BillDate <= @To",
                connection);
            revenueCmd.Parameters.AddWithValue("@From", from);
            revenueCmd.Parameters.AddWithValue("@To", to);
            decimal totalRevenue = Convert.ToDecimal(revenueCmd.ExecuteScalar());

            // Total discounts
            var discountCmd = new MySqlCommand(
                @"SELECT COALESCE(SUM(b.DiscountAmount), 0) FROM Bills b
                  WHERE b.BillDate >= @From AND b.BillDate <= @To",
                connection);
            discountCmd.Parameters.AddWithValue("@From", from);
            discountCmd.Parameters.AddWithValue("@To", to);
            decimal totalDiscount = Convert.ToDecimal(discountCmd.ExecuteScalar());

            // Total tax
            var taxCmd = new MySqlCommand(
                @"SELECT COALESCE(SUM(b.TaxAmount), 0) FROM Bills b
                  WHERE b.BillDate >= @From AND b.BillDate <= @To",
                connection);
            taxCmd.Parameters.AddWithValue("@From", from);
            taxCmd.Parameters.AddWithValue("@To", to);
            decimal totalTax = Convert.ToDecimal(taxCmd.ExecuteScalar());

            // Outstanding payments
            var outstandingCmd = new MySqlCommand(
                @"SELECT COALESCE(SUM(b.TotalAmount), 0) FROM Bills b
                  WHERE (b.Status='Generated' OR b.Status='PartiallyPaid')
                    AND b.BillDate >= @From AND b.BillDate <= @To",
                connection);
            outstandingCmd.Parameters.AddWithValue("@From", from);
            outstandingCmd.Parameters.AddWithValue("@To", to);
            decimal outstandingPayments = Convert.ToDecimal(outstandingCmd.ExecuteScalar());

            // Paid amount
            var paidCmd = new MySqlCommand(
                @"SELECT COALESCE(SUM(p.AmountPaid), 0) FROM Payments p
                  WHERE p.PaymentDate >= @From AND p.PaymentDate <= @To AND p.Status='Completed'",
                connection);
            paidCmd.Parameters.AddWithValue("@From", from);
            paidCmd.Parameters.AddWithValue("@To", to);
            decimal paidAmount = Convert.ToDecimal(paidCmd.ExecuteScalar());

            // Total bills
            var billCountCmd = new MySqlCommand(
                @"SELECT COUNT(*) FROM Bills b
                  WHERE b.BillDate >= @From AND b.BillDate <= @To",
                connection);
            billCountCmd.Parameters.AddWithValue("@From", from);
            billCountCmd.Parameters.AddWithValue("@To", to);
            int totalBills = Convert.ToInt32(billCountCmd.ExecuteScalar());

            // Period formatting
            string period = $"{from:yyyy-MM-dd} to {to:yyyy-MM-dd}";

            return new FinancialReportResponse
            {
                TotalRevenue = totalRevenue,
                TotalDiscount = totalDiscount,
                TotalTax = totalTax,
                OutstandingPayments = outstandingPayments,
                PaidAmount = paidAmount,
                TotalBills = totalBills,
                ReportPeriod = period
            };
        }
    }
}