# 🎓 Ph.D. ERP — Research Scholar Management System

A full-stack, role-based Enterprise Resource Planning (ERP) system built specifically to manage the complete lifecycle of a Ph.D. scholar — from initial registration to final thesis submission. Designed for universities and research institutions.

---

## 📌 Overview

The Ph.D. ERP system digitizes and streamlines every administrative and academic workflow involved in a doctoral program. It provides dedicated, secure dashboards for three distinct roles:

| Role | Capabilities |
|---|---|
| 🔴 **Admin** | Approve registrations, manage users, upload PhD documents, send notifications |
| 🟡 **Teacher / Guide** | View assigned students, assign coursework, track academic progress |
| 🟢 **Student** | Register, upload fee receipts and results, track PhD milestones |

---

## ✨ Key Features

### 👨‍💼 Admin Dashboard
- **User Management**: Approve or reject pending student and teacher registration requests
- **Teacher Reassignment**: Transfer all students from one teacher to another without data loss
- **SAC Management**: Create a pool of SAC (Student Advisory Committee) members and assign up to 5 per student
- **Coursework Management**: Add/remove Ph.D. coursework subjects with syllabus PDFs
- **Pre-PhD Result Verification**: Review and verify/reject student-uploaded results
- **PhD Registration Workflow**: Upload synopsis, set presentation dates, record observations, and issue registration letters
- **Progress Report Management**: Log periodic progress reports with verdicts and remarks
- **Pre-Submission Management**: Record pre-submission presentation details and committee members
- **Final Submission**: Upload notification PDFs and set final presentation dates
- **Notification System**: Broadcast targeted announcements to students filtered by admission type, mode, or year

### 👩‍🏫 Teacher Dashboard
- **My Students**: View all assigned students (as mentor or assistance teacher)
- **Coursework Assignment**: Assign up to 4 pre-PhD coursework subjects per student
- **Student Detail View**: Access comprehensive student academic profiles including fee history, SAC details, Pre-PhD results, and PhD registration status
- **Progress Tracking**: View all logged progress reports for each assigned student

### 👨‍🎓 Student Dashboard
- **Secure Registration**: OTP-verified email registration with admin approval gate
- **Fee Management**: Upload semester fee receipts (PDF, max 2MB) — one submission per semester, immutable after submission
- **Pre-PhD Result Upload**: Submit results PDF for admin verification
- **PhD Milestone Tracking**: View SAC members, registration presentation details, progress reports, pre-submission status, and final submission notification
- **Notifications**: Receive targeted announcements from the admin
- **Profile Management**: View personal academic profile

---

## 🏗️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **Vite 7** | Build tool & dev server |
| **Tailwind CSS 4** | Utility-first styling |
| **Framer Motion 12** | Smooth animations & transitions |
| **Lucide React** | Icon library |
| **React Router v7** | Client-side routing |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js + Express 5** | REST API server |
| **PostgreSQL** | Relational database |
| **`pg` (node-postgres)** | Database driver |
| **bcryptjs** | Password hashing |
| **JSON Web Token (JWT)** | Stateless authentication |
| **Multer** | PDF file upload handling |
| **Nodemailer** | OTP email delivery |
| **Winston** | Production-grade logging |
| **dotenv** | Environment variable management |

---

## 🗂️ Project Structure

```
phd-erp/
├── client/                         # React frontend (Vite)
│   └── src/
│       ├── components/
│       │   ├── AdminDashboard.jsx          # Main admin panel
│       │   ├── AdminPhdPanels.jsx          # PhD workflow panels (admin)
│       │   ├── StudentDashboard.jsx        # Student portal
│       │   ├── StudentPhdPanels.jsx        # PhD milestone views (student)
│       │   ├── StudentDetailsModal.jsx     # Full student profile modal
│       │   ├── TeacherDashboard.jsx        # Teacher portal
│       │   ├── FeeDetails.jsx              # Fee management UI
│       │   ├── Register.jsx                # Student registration
│       │   ├── Login.jsx                   # Student login
│       │   ├── ForgotPassword.jsx          # OTP-based password reset
│       │   ├── AdminLogin.jsx / AdminRegister.jsx
│       │   └── TeacherLogin.jsx / TeacherRegister.jsx
│       ├── config.js                       # Global API_BASE URL
│       └── App.jsx                         # Routes definition
│
└── server/                         # Express.js backend
    ├── controllers/
    │   ├── adminAuthController.js          # Admin login & register
    │   ├── adminDashController.js          # Core admin operations
    │   ├── authController.js               # Student auth & OTP
    │   ├── feeController.js                # Fee receipt management
    │   ├── notificationController.js       # Notification broadcasts
    │   ├── otpController.js                # OTP generation & verification
    │   ├── phdController.js                # Full PhD lifecycle management
    │   ├── sacController.js                # SAC member management
    │   ├── studentController.js            # Student profile operations
    │   ├── teacherAuthController.js        # Teacher login & register
    │   └── teacherController.js            # Teacher operations
    ├── routes/                             # Express route definitions
    ├── middleware/                         # Auth & error handling middleware
    ├── utils/
    │   └── logger.js                       # Winston logger
    ├── uploads/                            # Stored PDFs (gitignored)
    ├── database.sql                        # Full PostgreSQL schema
    ├── db.js                               # Connection pool config
    └── index.js                            # App entry point
```

---

## 🗄️ Database Schema

The system uses **16 relational PostgreSQL tables**:

| Table | Description |
|---|---|
| `student_login_details` | Student credentials (hashed passwords) |
| `student_master` | Full verified student profiles |
| `pending_student_registrations` | Awaiting admin approval |
| `teacher_login_details` | Teacher credentials |
| `teacher_master` | Full teacher profiles |
| `admin_login_details` | Admin credentials |
| `pre_approved_admins` | Admin email whitelist |
| `pre_approved_teachers` | Teacher email whitelist |
| `student_teacher_assignments` | Mentor/assistance teacher links |
| `coursework_subjects` | Pre-PhD subject catalogue |
| `student_coursework_assignments` | Subjects assigned per student |
| `fee_details` | Semester-wise fee receipts |
| `pre_phd_results` | Student-uploaded pre-PhD results |
| `phd_registration_presentations` | Synopsis & presentation records |
| `phd_registration_letters` | Issued registration letters |
| `phd_progress_reports` | Periodic progress report logs |
| `phd_pre_submissions` | Pre-submission presentation records |
| `phd_extended_synopses` | Extended synopsis uploads |
| `phd_final_submissions` | Final thesis submission details |
| `notifications` | Targeted admin announcements |
| `otp_codes` | Temporary OTP tokens for email verification |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [PostgreSQL](https://www.postgresql.org/) v14+
- npm

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/phd-erp.git
cd phd-erp
```

### 2. Set Up the Database
```bash
# Connect to PostgreSQL and run the schema
psql -U your_pg_user -d your_database_name -f server/database.sql
```

### 3. Configure the Server Environment
Create a `.env` file inside the `/server` directory:
```env
PORT=5000
DATABASE_URL=postgresql://your_pg_user:your_password@localhost:5432/your_database_name

# JWT
JWT_SECRET=your_super_secret_jwt_key

# Email (for OTP delivery via Nodemailer)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### 4. Install Server Dependencies & Start
```bash
cd server
npm install
npm start
```

### 5. Configure the Client API Base URL
In `client/src/config.js`, ensure the API URL matches your server:
```javascript
export const API_BASE = 'http://localhost:5000';
```

### 6. Install Client Dependencies & Start
```bash
cd client
npm install
npm run dev
```

### 7. Seed an Admin (First-Time Setup)
To register the first admin, you must manually add their email to the `pre_approved_admins` table:
```sql
INSERT INTO pre_approved_admins (email) VALUES ('admin@youruniversity.edu');
```
Then navigate to `http://localhost:5173/admin/register` to complete registration.

---

## 🔒 Security Highlights

- **Bcrypt password hashing** — All passwords are salted and hashed using bcryptjs (10 rounds) before storage. Plaintext passwords are never persisted.
- **Admin whitelist** — Only emails pre-seeded into `pre_approved_admins` can register as administrators.
- **Parameterized SQL queries** — All database queries use `$1, $2` placeholders to completely prevent SQL Injection.
- **OTP email verification** — Student registration and password resets require OTP confirmation sent to the registered email.
- **File type & size enforcement** — Multer validates that all uploads are PDFs and rejects any file exceeding 2–10MB limits.
- **One-time fee submissions** — Fee receipts are immutable; duplicate uploads are rejected at the server level, and orphaned files are cleaned up from disk automatically.
- **Winston structured logging** — All server errors, including auth failures and database errors, are logged with full stack traces for auditing.

---

## 📡 API Overview

| Prefix | Domain |
|---|---|
| `/api/auth` | Student authentication, OTP, password reset |
| `/api/admin` | Admin CRUD, user management, verification |
| `/api/student` | Student profile operations |
| `/api/teacher` | Teacher profile and student management |
| `/api/fee` | Fee receipt upload and retrieval |
| `/api/sac` | SAC member pool and student assignment |
| `/api/phd` | Full PhD lifecycle (registration → final submission) |
| `/api/notifications` | Admin broadcast and student filtering |
| `/uploads` | Static file server for stored PDFs |

---

## 📸 Screenshots

> _Coming soon_

---

## 📄 License

This project is licensed under the **ISC License**.

---

## 🤝 Contributing

This is an academic project developed for university Ph.D. program management. Feedback, suggestions, and pull requests are welcome.

---

<div align="center">
  <sub>Built with ❤️ for research scholars</sub>
</div>
