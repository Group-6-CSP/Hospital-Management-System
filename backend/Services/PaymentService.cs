using System;
using System.Collections.Generic;
using MySql.Data.MySqlClient;
using HospitalManagementSystem.Models;
using HospitalManagementSystem.DTOs;
using Microsoft.Extensions.Configuration;

namespace HospitalManagementSystem.Services
{
    public class PaymentService
    {
        private readonly string _connectionString;
        private readonly IConfiguration _config;

        public PaymentService(IConfiguration config)
        {
            _config = config;
            _connectionString = Environment.GetEnvironmentVariable("DefaultConnection")
                                ?? _config.GetConnectionString("DefaultConnection");
        }

        private string SafeGetString(MySqlDataReader reader, string columnName)
        {
            return reader[columnName] == DBNull.Value ? "" : reader[columnName].ToString();
        }

        private DateTime SafeGetDateTime(MySqlDataReader reader, string columnName)
        {
            return reader[columnName] == DBNull.Value ? DateTime.MinValue : Convert.ToDateTime(reader[columnName]);
        }

        private decimal SafeGetDecimal(MySqlDataReader reader, string columnName)
        {
            return reader[columnName] == DBNull.Value ? 0 : Convert.ToDecimal(reader[columnName]);
        }

        // Record payment
        public RecordPaymentResponse RecordPayment(RecordPaymentRequest request)
        {
            using var connection = new MySqlConnection(_connectionString);
            connection.Open();

            // Get bill
            var billCmd = new MySqlCommand("SELECT * FROM Bills WHERE BillId=@BillId", connection);
            billCmd.Parameters.AddWithValue("@BillId", request.BillId);
            var billReader = billCmd.ExecuteReader();

            if (!billReader.Read())
                throw new Exception("Bill not found");

            string billId = SafeGetString(billReader, "BillId");
            string patientId = SafeGetString(billReader, "PatientId");
            decimal totalAmount = SafeGetDecimal(billReader, "TotalAmount");
            string billStatus = SafeGetString(billReader, "Status");

            billReader.Close();

            if (request.AmountPaid > totalAmount)
                throw new Exception("Amount paid cannot exceed bill total");

            if (billStatus == "Paid")
                throw new Exception("Bill is already paid");

            // Check for duplicate payment (same amount within same bill)
            var dupCmd = new MySqlCommand(
                "SELECT COUNT(*) FROM Payments WHERE BillId=@BillId AND AmountPaid=@Amount AND Status='Completed'",
                connection);
            dupCmd.Parameters.AddWithValue("@BillId", billId);
            dupCmd.Parameters.AddWithValue("@Amount", request.AmountPaid);
            long dupCount = Convert.ToInt64(dupCmd.ExecuteScalar());

            if (dupCount > 0)
                throw new Exception("Duplicate payment detected");

            // Generate payment ID
            string paymentId = GeneratePaymentId(connection);

            // Insert payment
            var insertCmd = new MySqlCommand(
                @"INSERT INTO Payments (PaymentId, BillId, PatientId, AmountPaid, PaymentMode, PaymentDate, Status, TransactionReference, CreatedAt)
                  VALUES (@PaymentId, @BillId, @PatientId, @Amount, @Mode, @PaymentDate, @Status, @Reference, @CreatedAt)", connection);

            insertCmd.Parameters.AddWithValue("@PaymentId", paymentId);
            insertCmd.Parameters.AddWithValue("@BillId", billId);
            insertCmd.Parameters.AddWithValue("@PatientId", patientId);
            insertCmd.Parameters.AddWithValue("@Amount", request.AmountPaid);
            insertCmd.Parameters.AddWithValue("@Mode", request.PaymentMode);
            insertCmd.Parameters.AddWithValue("@PaymentDate", DateTime.Now);
            insertCmd.Parameters.AddWithValue("@Status", "Completed");
            insertCmd.Parameters.AddWithValue("@Reference", request.TransactionReference ?? "");
            insertCmd.Parameters.AddWithValue("@CreatedAt", DateTime.Now);

            insertCmd.ExecuteNonQuery();

            // Update bill status
            string newBillStatus = (request.AmountPaid >= totalAmount) ? "Paid" : "PartiallyPaid";
            var updateBillCmd = new MySqlCommand(
                "UPDATE Bills SET Status=@Status, UpdatedAt=@UpdatedAt WHERE BillId=@BillId", connection);
            updateBillCmd.Parameters.AddWithValue("@Status", newBillStatus);
            updateBillCmd.Parameters.AddWithValue("@UpdatedAt", DateTime.Now);
            updateBillCmd.Parameters.AddWithValue("@BillId", billId);
            updateBillCmd.ExecuteNonQuery();

            return new RecordPaymentResponse
            {
                PaymentId = paymentId,
                BillId = billId,
                PatientId = patientId,
                AmountPaid = request.AmountPaid,
                PaymentMode = request.PaymentMode,
                PaymentDate = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                Status = "Completed",
                BillStatus = newBillStatus,
                Message = "Payment recorded successfully"
            };
        }

        // Get payment history for patient
        public List<object> GetPaymentHistory(string patientId)
        {
            using var connection = new MySqlConnection(_connectionString);
            connection.Open();

            var cmd = new MySqlCommand(
                @"SELECT pm.*, b.TotalAmount FROM Payments pm
                  JOIN Bills b ON pm.BillId = b.BillId
                  WHERE pm.PatientId=@PatientId
                  ORDER BY pm.PaymentDate DESC", connection);
            cmd.Parameters.AddWithValue("@PatientId", patientId);

            var reader = cmd.ExecuteReader();
            var payments = new List<object>();

            while (reader.Read())
            {
                payments.Add(new
                {
                    paymentId = SafeGetString(reader, "PaymentId"),
                    billId = SafeGetString(reader, "BillId"),
                    amountPaid = SafeGetDecimal(reader, "AmountPaid"),
                    totalAmount = SafeGetDecimal(reader, "TotalAmount"),
                    paymentMode = SafeGetString(reader, "PaymentMode"),
                    paymentDate = SafeGetDateTime(reader, "PaymentDate").ToString("yyyy-MM-dd"),
                    status = SafeGetString(reader, "Status")
                });
            }

            return payments;
        }

        // Get all payments (admin)
        public List<object> GetAllPayments()
        {
            using var connection = new MySqlConnection(_connectionString);
            connection.Open();

            var cmd = new MySqlCommand(
                @"SELECT pm.*, p.Name as PatientName FROM Payments pm
                  LEFT JOIN Patients p ON pm.PatientId = p.PatientId
                  ORDER BY pm.PaymentDate DESC", connection);

            var reader = cmd.ExecuteReader();
            var payments = new List<object>();

            while (reader.Read())
            {
                payments.Add(new
                {
                    paymentId = SafeGetString(reader, "PaymentId"),
                    billId = SafeGetString(reader, "BillId"),
                    patientName = SafeGetString(reader, "PatientName"),
                    amountPaid = SafeGetDecimal(reader, "AmountPaid"),
                    paymentMode = SafeGetString(reader, "PaymentMode"),
                    paymentDate = SafeGetDateTime(reader, "PaymentDate").ToString("yyyy-MM-dd"),
                    status = SafeGetString(reader, "Status")
                });
            }

            return payments;
        }

        private string GeneratePaymentId(MySqlConnection connection)
        {
            var cmd = new MySqlCommand("SELECT PaymentId FROM Payments ORDER BY PaymentId DESC LIMIT 1", connection);
            var result = cmd.ExecuteScalar();

            if (result != null)
            {
                string lastId = result.ToString();
                int num = int.Parse(lastId.Substring(4));
                return "PAY-" + (num + 1).ToString("D8");
            }

            return "PAY-00000001";
        }
    }
}