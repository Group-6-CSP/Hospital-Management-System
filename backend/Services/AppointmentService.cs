using backend.Models;
using MySql.Data.MySqlClient;

namespace backend.Services
{
    public class AppointmentService
    {
        private readonly string _connectionString;

        public AppointmentService(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        //  GET all appointments
        public List<Appointment> GetAll()
        {
            var list = new List<Appointment>();

            using var conn = new MySqlConnection(_connectionString);
            conn.Open();
            string query = "SELECT * FROM appointments ORDER BY AppointmentDate DESC";

            using var cmd = new MySqlCommand(query, conn);
            using var reader = cmd.ExecuteReader();

            while (reader.Read())
            {
                list.Add(new Appointment
                {
                    AppointmentId = reader["AppointmentId"].ToString(),
                    PatientId = reader["PatientId"].ToString(),
                    DoctorName = reader["DoctorName"].ToString(),
                    Department = reader["Department"].ToString(),
                    AppointmentDate = Convert.ToDateTime(reader["AppointmentDate"]),
                    Status = reader["Status"].ToString()
                });
            }

            return list;
        }

        //  GET appointments by patient ID
        public List<Appointment> GetByPatient(string patientId)
        {
            var list = new List<Appointment>();

            using var conn = new MySqlConnection(_connectionString);
            conn.Open();
            string query = "SELECT * FROM appointments WHERE PatientId = @PatientId";

            using var cmd = new MySqlCommand(query, conn);
            cmd.Parameters.AddWithValue("@PatientId", patientId);

            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                list.Add(new Appointment
                {
                    AppointmentId = reader["AppointmentId"].ToString(),
                    PatientId = reader["PatientId"].ToString(),
                    DoctorName = reader["DoctorName"].ToString(),
                    Department = reader["Department"].ToString(),
                    AppointmentDate = Convert.ToDateTime(reader["AppointmentDate"]),
                    Status = reader["Status"].ToString()
                });
            }

            return list;
        }

        //  POST - Create new appointment
        public void Create(Appointment appointment)
        {
            using var conn = new MySqlConnection(_connectionString);
            conn.Open();

            string query = @"INSERT INTO appointments 
                            (AppointmentId, PatientId, DoctorName, Department, AppointmentDate, Status, CreatedAt)
                            VALUES (@AppointmentId, @PatientId, @DoctorName, @Department, @AppointmentDate, @Status, NOW())";

            using var cmd = new MySqlCommand(query, conn);
            cmd.Parameters.AddWithValue("@AppointmentId", appointment.AppointmentId);
            cmd.Parameters.AddWithValue("@PatientId", appointment.PatientId);
            cmd.Parameters.AddWithValue("@DoctorName", appointment.DoctorName);
            cmd.Parameters.AddWithValue("@Department", appointment.Department);
            cmd.Parameters.AddWithValue("@AppointmentDate", appointment.AppointmentDate);
            cmd.Parameters.AddWithValue("@Status", appointment.Status);

            cmd.ExecuteNonQuery();
        }

        //  PUT - Update appointment status
        public bool UpdateStatus(string id, string status)
        {
            using var conn = new MySqlConnection(_connectionString);
            conn.Open();

            string query = "UPDATE appointments SET Status = @Status WHERE AppointmentId = @AppointmentId";
            using var cmd = new MySqlCommand(query, conn);
            cmd.Parameters.AddWithValue("@Status", status);
            cmd.Parameters.AddWithValue("@AppointmentId", id.Trim());

            int rows = cmd.ExecuteNonQuery();
            return rows > 0;
        }

        //  DELETE appointment by ID
        public void Delete(string id)
        {
            using var conn = new MySqlConnection(_connectionString);
            conn.Open();

            string query = "DELETE FROM appointments WHERE AppointmentId = @id";
            using var cmd = new MySqlCommand(query, conn);
            cmd.Parameters.AddWithValue("@id", id.Trim());
            cmd.ExecuteNonQuery();
        }
    }
}
