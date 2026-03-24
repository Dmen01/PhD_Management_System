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

-- Stores emails authorized to register as admins
CREATE TABLE pre_approved_admins (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stores admin login credentials
CREATE TABLE admin_login_details (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL REFERENCES pre_approved_admins(email) ON DELETE CASCADE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stores teacher login credentials
CREATE TABLE teacher_login_details (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Full teacher profile — linked to login by email
CREATE TABLE teacher_master (
  teacher_id VARCHAR(50) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL REFERENCES teacher_login_details(email) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  last_name VARCHAR(100) NOT NULL,
  department VARCHAR(150) NOT NULL,
  designation VARCHAR(150) NOT NULL,
  mobile_number VARCHAR(15) NOT NULL CHECK (mobile_number ~ '^[0-9]{10,15}$'),
  year_of_joining INTEGER NOT NULL CHECK (year_of_joining >= 1900 AND year_of_joining <= 2100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subjects available for pre-PhD coursework, managed by admin
CREATE TABLE IF NOT EXISTS coursework_subjects (
  id SERIAL PRIMARY KEY,
  subject_name VARCHAR(255) UNIQUE NOT NULL,
  credits INTEGER NOT NULL CHECK (credits > 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Emails pre-approved by admin for teacher registration
CREATE TABLE IF NOT EXISTS pre_approved_teachers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Maps each student to their mentor (required) and assistance teacher (optional)
CREATE TABLE IF NOT EXISTS student_teacher_assignments (
  id SERIAL PRIMARY KEY,
  student_application_number VARCHAR(50) NOT NULL REFERENCES student_master(application_number) ON DELETE CASCADE,
  mentor_teacher_id VARCHAR(50) NOT NULL REFERENCES teacher_master(teacher_id) ON DELETE RESTRICT,
  assistance_teacher_id VARCHAR(50) REFERENCES teacher_master(teacher_id) ON DELETE SET NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_application_number)
);

-- Pre-PhD coursework subjects assigned by the mentor teacher to each student (max 4)
CREATE TABLE IF NOT EXISTS student_coursework_assignments (
  id SERIAL PRIMARY KEY,
  student_application_number VARCHAR(50) NOT NULL REFERENCES student_master(application_number) ON DELETE CASCADE,
  subject_id INTEGER NOT NULL REFERENCES coursework_subjects(id) ON DELETE RESTRICT,
  assigned_by_teacher_id VARCHAR(50) NOT NULL REFERENCES teacher_master(teacher_id) ON DELETE RESTRICT,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_application_number, subject_id)
);

-- Pre-PhD Results uploaded by the student
CREATE TABLE IF NOT EXISTS pre_phd_results (
  id SERIAL PRIMARY KEY,
  application_number VARCHAR(50) UNIQUE NOT NULL REFERENCES student_master(application_number) ON DELETE CASCADE,
  result_pdf_path VARCHAR(500) NOT NULL,
  verified_by_student BOOLEAN NOT NULL DEFAULT FALSE,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
