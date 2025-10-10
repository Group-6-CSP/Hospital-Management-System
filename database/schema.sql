-- Azure Database for MySQL schema for Appointment Management
-- Reset-and-create approach to avoid legacy type mismatches

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS Appointments;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Patients;
DROP TABLE IF EXISTS Doctors;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE IF NOT EXISTS Patients (
	PatientId      VARCHAR(64)  NOT NULL PRIMARY KEY,
	UserId         VARCHAR(64)  NOT NULL,
	Name           VARCHAR(255) NOT NULL,
	Email          VARCHAR(255) NULL,
	Dob            DATE         NOT NULL,
	Gender         VARCHAR(32)  NOT NULL,
	Contact        VARCHAR(64)  NOT NULL,
	MedicalNotes   TEXT         NULL,
	CreatedAt      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
	UpdatedAt      DATETIME     NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS Doctors (
	DoctorId   VARCHAR(64)  NOT NULL PRIMARY KEY,
	Name       VARCHAR(255) NOT NULL,
	Department VARCHAR(255) NULL,
	Contact    VARCHAR(64)  NULL,
	CreatedAt  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
	UpdatedAt  DATETIME     NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS Users (
	UserId       VARCHAR(64)  NOT NULL PRIMARY KEY,
	FullName     VARCHAR(255) NOT NULL,
	DOB          DATE         NOT NULL,
	Email        VARCHAR(255) NOT NULL UNIQUE,
	PasswordHash VARCHAR(255) NOT NULL,
	Contact      VARCHAR(64)  NULL,
	Role         VARCHAR(64)  NOT NULL,
	IsActive     TINYINT(1)   NOT NULL DEFAULT 1,
	CreatedAt    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
	UpdatedAt    DATETIME     NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS Appointments (
	AppointmentId   VARCHAR(64)  NOT NULL PRIMARY KEY,
	PatientId       VARCHAR(64)  NOT NULL,
	DoctorId        VARCHAR(64)  NOT NULL,
	AppointmentDate DATE         NOT NULL,
	AppointmentTime VARCHAR(5)   NOT NULL, -- HH:mm
	Status          VARCHAR(32)  NOT NULL DEFAULT 'Scheduled',
	-- Generated flag used to enforce uniqueness for active (non-cancelled) appointments per slot
	IsActive        TINYINT       AS (CASE WHEN (Status <> 'Cancelled') THEN 1 ELSE 0 END) STORED,
	Reason          VARCHAR(512) NULL,
	CreatedAt       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
	UpdatedAt       DATETIME     NULL,
	CONSTRAINT fk_appointments_patient FOREIGN KEY (PatientId) REFERENCES Patients(PatientId),
	CONSTRAINT fk_appointments_doctor  FOREIGN KEY (DoctorId)  REFERENCES Doctors(DoctorId),
	KEY idx_appt_doctor_date_time (DoctorId, AppointmentDate, AppointmentTime),
	KEY idx_appt_patient (PatientId),
	CONSTRAINT ux_active_slot UNIQUE (DoctorId, AppointmentDate, AppointmentTime, IsActive)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Indexes are declared within the table definition above for idempotency

