-- Seed data for Azure Database for MySQL
-- Assumes schema.sql has been applied

-- Upsert-like inserts using INSERT IGNORE for idempotency

INSERT IGNORE INTO Patients (PatientId, UserId, Name, Email, Dob, Gender, Contact, MedicalNotes)
VALUES
	('P123', 'U123', 'John Doe', 'john.doe@example.com', '1990-05-10', 'Male', '+15550000001', NULL),
	('P789', 'U789', 'Jane Roe', 'jane.roe@example.com', '1988-11-03', 'Female', '+15550000002', NULL);

INSERT IGNORE INTO Doctors (DoctorId, Name, Department, Contact)
VALUES
	('D456', 'Dr. Alice Smith', 'Cardiology', '+15551112222'),
	('D999', 'Dr. Bob Taylor', 'General', '+15551113333');

-- Seed users for AuthController login tests (BCrypt hashes for 'Test@123')
-- Hash generated with BCrypt.Net (cost ~10): $2a$10$8SxpuYk1zqHn0KzFMsf7VOwxhA8o1H8O6m2Zg19hS8QJY0l2K2bRO
-- If hash mismatch occurs, regenerate using the exact library/config used by the app.
INSERT IGNORE INTO Users (UserId, FullName, DOB, Email, PasswordHash, Contact, Role, IsActive)
VALUES
	('U-ADMIN-0001', 'Admin User', '1990-01-01', 'testuser@example.com', '$2a$10$8SxpuYk1zqHn0KzFMsf7VOwxhA8o1H8O6m2Zg19hS8QJY0l2K2bRO', '+15550000010', 'Admin', 1),
	('U-PAT-0002', 'Patient User', '1992-02-02', 'testuser2@example.com', '$2a$10$8SxpuYk1zqHn0KzFMsf7VOwxhA8o1H8O6m2Zg19hS8QJY0l2K2bRO', '+15550000011', 'Patient', 1);

-- Ensure at least one occupied slot for conflict testing
INSERT IGNORE INTO Appointments (AppointmentId, PatientId, DoctorId, AppointmentDate, AppointmentTime, Status, Reason)
VALUES
	('A1001', 'P123', 'D456', DATE_ADD(CURDATE(), INTERVAL 30 DAY), '10:00', 'Scheduled', 'Routine checkup');

