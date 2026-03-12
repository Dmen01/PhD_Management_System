-- DROP TABLE IF EXISTS otp_codes;
-- DROP TABLE IF EXISTS student_login_details;


CREATE TABLE otp_codes (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stores student login credentials (email + hashed password only)
CREATE TABLE student_login_details (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Full student profile — filled once after first login
CREATE TABLE student_master (
  application_number VARCHAR(50) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  last_name VARCHAR(100) NOT NULL,
  father_name VARCHAR(200) NOT NULL,
  mother_name VARCHAR(200) NOT NULL,
  dob DATE NOT NULL,
  mobile_number VARCHAR(15) NOT NULL CHECK (mobile_number ~ '^[0-9]{10,15}$'),
  year_of_admission INTEGER NOT NULL CHECK (year_of_admission >= 1900 AND year_of_admission <= 2100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fee payment records — one per student per semester, student cannot edit after submission
CREATE TABLE fee_details (
  id SERIAL PRIMARY KEY,
  application_number VARCHAR(50) NOT NULL REFERENCES student_master(application_number) ON DELETE CASCADE,
  semester INTEGER NOT NULL CHECK (semester >= 1 AND semester <= 12),
  payment_date DATE NOT NULL,
  receipt_pdf_path VARCHAR(500) NOT NULL,
  verified_by_student BOOLEAN NOT NULL DEFAULT FALSE,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(application_number, semester)
);
