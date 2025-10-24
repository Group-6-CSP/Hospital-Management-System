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
            _connectionString = Environment.GetEnvironmentVariable("DefaultConnection")
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

            // Total revenue (paid bills)
            var revenueCmd = new MySqlCommand(
                @"SELECT COALESCE(SUM(b.TotalAmount), 0) as TotalRevenue FROM Bills b
                  WHERE b.Status='Paid' AND b.BillDate >= @From AND b.BillDate <= @To", connection);
            revenueCmd.Parameters.AddWithValue("@From", from);
            revenueCmd.Parameters.AddWithValue("@To", to);
            decimal totalRevenue = Convert.ToDecimal(revenueCmd.ExecuteScalar());

            // Total discounts
            var discountCmd = new MySqlCommand(
                @"SELECT COALESCE(SUM(b.DiscountAmount), 0) as TotalDiscount FROM Bills b
                  WHERE b.BillDate >= @From AND b.BillDate <= @To", connection);
            discountCmd.Parameters.AddWithValue("@From", from);
            discountCmd.Parameters.AddWithValue("@To", to);
            decimal totalDiscount = Convert.ToDecimal(discountCmd.ExecuteScalar());

            // Total tax
            var taxCmd = new MySqlCommand(
                @"SELECT COALESCE(SUM(b.TaxAmount), 0) as TotalTax FROM Bills b
                  WHERE b.BillDate >= @From AND b.BillDate <= @To", connection);
            taxCmd.Parameters.AddWithValue("@From", from);
            taxCmd.Parameters.AddWithValue("@To", to);
            decimal totalTax = Convert.ToDecimal(taxCmd.ExecuteScalar());

            // Outstanding payments (unpaid bills)
            var outstandingCmd = new MySqlCommand(
                @"SELECT COALESCE(SUM(b.TotalAmount), 0) as Outstanding FROM Bills b
                  WHERE (b.Status='Generated' OR b.Status='PartiallyPaid') AND b.BillDate >= @From AND b.BillDate <= @To", connection);
            outstandingCmd.Parameters.AddWithValue("@From", from);
            outstandingCmd.Parameters.AddWithValue("@To", to);
            decimal outstandingPayments = Convert.ToDecimal(outstandingCmd.ExecuteScalar());

            // Paid amount
            var paidCmd = new MySqlCommand(
                @"SELECT COALESCE(SUM(p.AmountPaid), 0) as PaidAmount FROM Payments p
                  WHERE p.PaymentDate >= @From AND p.PaymentDate <= @To AND p.Status='Completed'", connection);
            paidCmd.Parameters.AddWithValue("@From", from);
            paidCmd.Parameters.AddWithValue("@To", to);
            decimal paidAmount = Convert.ToDecimal(paidCmd.ExecuteScalar());

            // Total bills
            var billCountCmd = new MySqlCommand(
                @"SELECT COUNT(*) as TotalBills FROM Bills b
                  WHERE b.BillDate >= @From AND b.BillDate <= @To", connection);
            billCountCmd.Parameters.AddWithValue("@From", from);
            billCountCmd.Parameters.AddWithValue("@To", to);
            int totalBills = Convert.ToInt32(billCountCmd.ExecuteScalar());

            string period = $"{from.ToString("yyyy-MM-dd")} to {to.ToString("yyyy-MM-dd")}";

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