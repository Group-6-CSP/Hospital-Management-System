using System;
using System.Collections.Generic;
using MySql.Data.MySqlClient;
using HospitalManagementSystem.Models;
using HospitalManagementSystem.DTOs;
using Microsoft.Extensions.Configuration;

namespace HospitalManagementSystem.Services
{
    public class BillingService
    {
        private readonly string _connectionString;
        private readonly IConfiguration _config;

        public BillingService(IConfiguration config)
        {
            _config = config;

            // FIXED for Azure
            _connectionString =
                Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
                ?? _config.GetConnectionString("DefaultConnection");
        }

        private string SafeGetString(MySqlDataReader reader, string columnName)
        {
            return reader[columnName] == DBNull.Value ? "" : reader[columnName].ToString();
        }

        private DateTime SafeGetDateTime(MySqlDataReader reader, string columnName)
        {
            return reader[columnName] == DBNull.Value
                ? DateTime.MinValue
                : Convert.ToDateTime(reader[columnName]);
        }

        private decimal SafeGetDecimal(MySqlDataReader reader, string columnName)
        {
            return reader[columnName] == DBNull.Value
                ? 0
                : Convert.ToDecimal(reader[columnName]);
        }

        // Get billing configuration
        public BillingConfig GetBillingConfig()
        {
            using var connection = new MySqlConnection(_connectionString);
            connection.Open();

            var cmd = new MySqlCommand("SELECT * FROM BillingConfig LIMIT 1", connection);
            using var reader = cmd.ExecuteReader();

            if (reader.Read())
            {
                return new BillingConfig
                {
                    ConfigId = Convert.ToInt32(reader["ConfigId"]),
                    TaxPercentage = SafeGetDecimal(reader, "TaxPercentage"),
                    ConsultationFeeBase = SafeGetDecimal(reader, "ConsultationFeeBase"),
                    CreatedAt = SafeGetDateTime(reader, "CreatedAt")
                };
            }

            return new BillingConfig { TaxPercentage = 6, ConsultationFeeBase = 1000 };
        }

        // Get consultation fee for doctor
        public decimal GetConsultationFee(string doctorId)
        {
            using var connection = new MySqlConnection(_connectionString);
            connection.Open();

            var cmd = new MySqlCommand(
                "SELECT ConsultationFee FROM DoctorFees WHERE DoctorId=@DoctorId ORDER BY EffectiveFrom DESC LIMIT 1",
                connection);

            cmd.Parameters.AddWithValue("@DoctorId", doctorId);

            var result = cmd.ExecuteScalar();
            if (result != null)
                return Convert.ToDecimal(result);

            return GetBillingConfig().ConsultationFeeBase;
        }

        // Generate bill
        public GenerateBillResponse GenerateBill(GenerateBillRequest request)
        {
            using var connection = new MySqlConnection(_connectionString);
            connection.Open();

            // Validate appointment
            var aptCmd = new MySqlCommand(
                "SELECT * FROM Appointments WHERE AppointmentId=@AppointmentId", connection);

            aptCmd.Parameters.AddWithValue("@AppointmentId", request.AppointmentId);

            using var aptReader = aptCmd.ExecuteReader();

            if (!aptReader.Read())
                throw new Exception("Appointment not found");

            string appointmentId = SafeGetString(aptReader, "AppointmentId");
            string patientId = SafeGetString(aptReader, "PatientId");
            string doctorId = SafeGetString(aptReader, "DoctorId");
            string status = SafeGetString(aptReader, "Status");

            if (status != "Completed")
                throw new Exception("Bill can only be generated for completed appointments");

            // Reader closes here (end of using block)

            // Check existing bill
            var billCheckCmd = new MySqlCommand(
                "SELECT COUNT(*) FROM Bills WHERE AppointmentId=@AppointmentId", connection);

            billCheckCmd.Parameters.AddWithValue("@AppointmentId", appointmentId);
            long billExists = Convert.ToInt64(billCheckCmd.ExecuteScalar());

            if (billExists > 0)
                throw new Exception("Bill already exists for this appointment");

            // Fee calculations
            decimal consultationFee = GetConsultationFee(doctorId);
            decimal subtotal = consultationFee + request.LabCharges + request.MedicineCharges;

            decimal discountAmount = (subtotal * request.DiscountPercent) / 100;

            BillingConfig config = GetBillingConfig();
            decimal taxAmount = ((subtotal - discountAmount) * config.TaxPercentage) / 100;

            decimal totalAmount = subtotal - discountAmount + taxAmount;

            string billId = GenerateBillId(connection);

            // Insert bill
            var insertCmd = new MySqlCommand(
                @"INSERT INTO Bills (BillId, AppointmentId, PatientId, DoctorId, ConsultationFee, LabCharges, 
                  MedicineCharges, Subtotal, DiscountPercent, DiscountAmount, TaxPercent, TaxAmount, TotalAmount, 
                  Status, BillDate, Notes, CreatedAt)
                  VALUES (@BillId, @AppointmentId, @PatientId, @DoctorId, @ConsultationFee, @LabCharges, 
                  @MedicineCharges, @Subtotal, @DiscountPercent, @DiscountAmount, @TaxPercent, @TaxAmount, 
                  @TotalAmount, @Status, @BillDate, @Notes, @CreatedAt)",
                connection);

            insertCmd.Parameters.AddWithValue("@BillId", billId);
            insertCmd.Parameters.AddWithValue("@AppointmentId", appointmentId);
            insertCmd.Parameters.AddWithValue("@PatientId", patientId);
            insertCmd.Parameters.AddWithValue("@DoctorId", doctorId);
            insertCmd.Parameters.AddWithValue("@ConsultationFee", consultationFee);
            insertCmd.Parameters.AddWithValue("@LabCharges", request.LabCharges);
            insertCmd.Parameters.AddWithValue("@MedicineCharges", request.MedicineCharges);
            insertCmd.Parameters.AddWithValue("@Subtotal", subtotal);
            insertCmd.Parameters.AddWithValue("@DiscountPercent", request.DiscountPercent);
            insertCmd.Parameters.AddWithValue("@DiscountAmount", discountAmount);
            insertCmd.Parameters.AddWithValue("@TaxPercent", config.TaxPercentage);
            insertCmd.Parameters.AddWithValue("@TaxAmount", taxAmount);
            insertCmd.Parameters.AddWithValue("@TotalAmount", totalAmount);
            insertCmd.Parameters.AddWithValue("@Status", "Generated");
            insertCmd.Parameters.AddWithValue("@BillDate", DateTime.UtcNow);
            insertCmd.Parameters.AddWithValue("@Notes", request.Notes ?? "");
            insertCmd.Parameters.AddWithValue("@CreatedAt", DateTime.UtcNow);

            insertCmd.ExecuteNonQuery();

            // Update appointment
            var updateAptCmd = new MySqlCommand(
                "UPDATE Appointments SET BillId=@BillId WHERE AppointmentId=@AppointmentId",
                connection);

            updateAptCmd.Parameters.AddWithValue("@BillId", billId);
            updateAptCmd.Parameters.AddWithValue("@AppointmentId", appointmentId);
            updateAptCmd.ExecuteNonQuery();

            return new GenerateBillResponse
            {
                BillId = billId,
                AppointmentId = appointmentId,
                PatientId = patientId,
                DoctorId = doctorId,
                ConsultationFee = consultationFee,
                LabCharges = request.LabCharges,
                MedicineCharges = request.MedicineCharges,
                Subtotal = subtotal,
                DiscountPercent = request.DiscountPercent,
                DiscountAmount = discountAmount,
                TaxPercent = config.TaxPercentage,
                TaxAmount = taxAmount,
                TotalAmount = totalAmount,
                Status = "Generated",
                BillDate = DateTime.UtcNow.ToString("yyyy-MM-dd"),
                Message = "Bill generated successfully"
            };
        }

        public Bill GetBillById(string billId)
        {
            using var connection = new MySqlConnection(_connectionString);
            connection.Open();

            var cmd = new MySqlCommand("SELECT * FROM Bills WHERE BillId=@BillId", connection);
            cmd.Parameters.AddWithValue("@BillId", billId);

            using var reader = cmd.ExecuteReader();

            if (reader.Read())
            {
                return new Bill
                {
                    BillId = SafeGetString(reader, "BillId"),
                    AppointmentId = SafeGetString(reader, "AppointmentId"),
                    PatientId = SafeGetString(reader, "PatientId"),
                    DoctorId = SafeGetString(reader, "DoctorId"),
                    ConsultationFee = SafeGetDecimal(reader, "ConsultationFee"),
                    LabCharges = SafeGetDecimal(reader, "LabCharges"),
                    MedicineCharges = SafeGetDecimal(reader, "MedicineCharges"),
                    Subtotal = SafeGetDecimal(reader, "Subtotal"),
                    DiscountPercent = SafeGetDecimal(reader, "DiscountPercent"),
                    DiscountAmount = SafeGetDecimal(reader, "DiscountAmount"),
                    TaxPercent = SafeGetDecimal(reader, "TaxPercent"),
                    TaxAmount = SafeGetDecimal(reader, "TaxAmount"),
                    TotalAmount = SafeGetDecimal(reader, "TotalAmount"),
                    Status = SafeGetString(reader, "Status"),
                    BillDate = SafeGetDateTime(reader, "BillDate"),
                    Notes = SafeGetString(reader, "Notes")
                };
            }

            return null;
        }

        public List<object> GetBillsByPatient(string patientId)
        {
            using var connection = new MySqlConnection(_connectionString);
            connection.Open();

            var cmd = new MySqlCommand(
                @"SELECT b.*, d.Name as DoctorName FROM Bills b 
                  LEFT JOIN Doctors d ON b.DoctorId = d.DoctorId 
                  WHERE b.PatientId=@PatientId 
                  ORDER BY b.BillDate DESC",
                connection);

            cmd.Parameters.AddWithValue("@PatientId", patientId);

            using var reader = cmd.ExecuteReader();
            var bills = new List<object>();

            while (reader.Read())
            {
                bills.Add(new
                {
                    billId = SafeGetString(reader, "BillId"),
                    appointmentId = SafeGetString(reader, "AppointmentId"),
                    doctorName = SafeGetString(reader, "DoctorName"),
                    totalAmount = SafeGetDecimal(reader, "TotalAmount"),
                    status = SafeGetString(reader, "Status"),
                    billDate = SafeGetDateTime(reader, "BillDate").ToString("yyyy-MM-dd")
                });
            }

            return bills;
        }

        public List<object> GetAllBills(string status = "", string from = "", string to = "")
        {
            using var connection = new MySqlConnection(_connectionString);
            connection.Open();

            string whereClause = "WHERE 1=1";
            if (!string.IsNullOrEmpty(status))
                whereClause += " AND Status=@Status";
            if (!string.IsNullOrEmpty(from))
                whereClause += " AND BillDate >= @FromDate";
            if (!string.IsNullOrEmpty(to))
                whereClause += " AND BillDate <= @ToDate";

            var cmd = new MySqlCommand(
                $@"SELECT b.*, p.Name as PatientName, d.Name as DoctorName FROM Bills b
                   LEFT JOIN Patients p ON b.PatientId = p.PatientId
                   LEFT JOIN Doctors d ON b.DoctorId = d.DoctorId
                   {whereClause} ORDER BY b.BillDate DESC",
                connection);

            if (!string.IsNullOrEmpty(status))
                cmd.Parameters.AddWithValue("@Status", status);
            if (!string.IsNullOrEmpty(from))
                cmd.Parameters.AddWithValue("@FromDate", DateTime.Parse(from));
            if (!string.IsNullOrEmpty(to))
                cmd.Parameters.AddWithValue("@ToDate", DateTime.Parse(to));

            using var reader = cmd.ExecuteReader();
            var bills = new List<object>();

            while (reader.Read())
            {
                bills.Add(new
                {
                    billId = SafeGetString(reader, "BillId"),
                    patientId = SafeGetString(reader, "PatientId"),
                    patientName = SafeGetString(reader, "PatientName"),
                    doctorName = SafeGetString(reader, "DoctorName"),
                    totalAmount = SafeGetDecimal(reader, "TotalAmount"),
                    status = SafeGetString(reader, "Status"),
                    billDate = SafeGetDateTime(reader, "BillDate").ToString("yyyy-MM-dd")
                });
            }

            return bills;
        }

        private string GenerateBillId(MySqlConnection connection)
        {
            var cmd = new MySqlCommand("SELECT BillId FROM Bills ORDER BY BillId DESC LIMIT 1", connection);
            var result = cmd.ExecuteScalar();

            if (result != null)
            {
                string lastId = result.ToString();
                int num = int.Parse(lastId.Substring(2));
                return "B-" + (num + 1).ToString("D8");
            }

            return "B-00000001";
        }

        public void UpdateBillingConfig(BillingConfigRequest request)
        {
            using var connection = new MySqlConnection(_connectionString);
            connection.Open();

            var cmd = new MySqlCommand(
                @"UPDATE BillingConfig 
                  SET TaxPercentage=@TaxPercent, ConsultationFeeBase=@Fee, UpdatedAt=@UpdatedAt 
                  WHERE ConfigId=1",
                connection);

            cmd.Parameters.AddWithValue("@TaxPercent", request.TaxPercentage);
            cmd.Parameters.AddWithValue("@Fee", request.ConsultationFeeBase);
            cmd.Parameters.AddWithValue("@UpdatedAt", DateTime.UtcNow);

            cmd.ExecuteNonQuery();
        }
    }
}
