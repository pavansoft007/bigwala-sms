# Bigwala SMS — Backend

School Management System backend built with **Node.js**, **Express**, and **Prisma** (MySQL).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js (ESM `"type": "module"`) |
| Framework | Express 4 |
| ORM | Prisma 6 (MySQL) |
| Auth | JWT (`jsonwebtoken`) + bcryptjs |
| File uploads | Multer (disk storage, 5 MB limit) |
| Security | Helmet, express-rate-limit, AES-256-CBC image access tokens |

---

## Project Structure

```
backend/
├── index.js                  # App entry point
├── prisma/
│   └── schema.prisma         # Database schema
├── routes/                   # Express route handlers
│   ├── Auth.js               # Login (OTP + admin password)
│   ├── GettingData.js        # Dashboard & common reads
│   ├── ManagingSchool.js     # Super-admin school provisioning
│   ├── ManagingStudent.js    # Student CRUD
│   ├── ManagingTeacher.js    # Teacher CRUD
│   ├── ManagingClassrooms.js
│   ├── ManagingSubjects.js
│   ├── ManagingExam.js
│   ├── ManageAttendance.js
│   ├── ManagingHomework.js
│   ├── ManageLeaves.js       # Teacher leave requests & admin approvals
│   ├── ManagingFeeCategory.js
│   ├── ManagingFeePayment.js
│   ├── ManagingMessageBoard.js
│   ├── ManagingGallery.js
│   ├── ManagingVideo.js
│   ├── ManageBannerImages.js
│   ├── ManageUserRights.js   # Role & permission management
│   └── ManagingStaticFiles.js# Encrypted photo serving
├── middleware/
│   ├── AdminAuth.js          # JWT guard for admin routes (permission-aware)
│   ├── completeLogin.js      # JWT guard — all logged-in roles
│   ├── teacherAuth.js        # JWT guard factory — teacher/admin routes
│   ├── semiAdminAuth.js      # JWT guard factory — admin or admin-teacher
│   ├── MasterAdminAuth.js    # HTTP Basic auth for super-admin
│   ├── StudentAuth.js        # JWT guard for student routes
│   ├── realIpMiddleware.js   # Normalises client IP
│   └── ImageCors.js          # CORS for static image endpoint
├── services/
│   ├── multerService.js      # Multer configuration (5 MB cap)
│   ├── Encrypt.js / Decrypt.js # AES-256 for image URLs
│   ├── FormatDate.js
│   ├── generateAdmissionID.js
│   ├── generateTeacherID.js
│   └── getAssignedClassroom.js
├── lib/
│   └── prisma.js             # Shared Prisma singleton (single connection pool)
├── seeds/
│   ├── moduleSeed.js
│   └── migrateAdminsToUsers.js  # One-time migration — see below
└── uploads/                  # Uploaded files (gitignored)
```

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | MySQL connection string (`mysql://user:pass@host:port/db`) |
| `PORT` | HTTP port (default `3000`) |
| `JWTKEY` | Secret for signing JWTs — use a long random string |
| `PASS` | Secret for AES image URL encryption |
| `MASTER_ADMIN_USERNAME` | HTTP Basic username for super-admin routes |
| `MASTER_ADMIN_PASSWORD` | HTTP Basic password for super-admin routes |
| `NODE_ENV` | `development` or `production` |

### 3. Migrate the database

```bash
npx prisma migrate dev
```

### 4. Seed modules

```bash
npm run db:seed
```

### 5. Run

```bash
# Development (hot reload)
npm run dev

# Production
npm start
```

---

## Auth System

### Unified User Table

Every user in the system — admin, teacher, student, admin-teacher — has a record in the `users` table. This is the **single source of truth for authentication**.

```
users
├── id            PK
├── name          Display name
├── email         Used for admin password login
├── phone_number  Used for OTP login (teachers & students)
├── password      bcrypt hash (admins only; null for teachers/students)
├── role          Enum: admin | teacher | admin_teacher | student
├── original_id   FK string → admins.admin_id / teachers.teacher_id / students.student_id
├── school_id     FK → school.school_id
└── is_active     Soft-disable flag
```

### Login Flows

#### Admin — Web Portal (`POST /api/admin-login`)

```
Request  → { email, password }
          ↓
          Look up User where { email, role: 'admin', is_active: true }
          ↓
          bcrypt.compare(password, user.password)
          ↓
          Fetch Admin profile via original_id
          ↓
Response ← { token }   // JWT payload: { id, school_id, school_code, role: 'admin' }
```

#### Teachers & Students — Mobile OTP

**Step 1 — Request OTP** (`POST /mobileAPI/otp-request`)
```
Request  → { phone }
          ↓
          Find User by phone_number (is_active: true)
          ↓
          Generate 6-digit OTP
Response ← { token }   // Short-lived JWT containing the OTP
```

**Step 2 — Verify OTP** (`POST /mobileAPI/otp-verify`)
```
Request  → { otp }  +  Authorization: Bearer <step-1 token>
          ↓
          Verify OTP matches token claim
          ↓
          Look up profile by role + phone_number
Response ← { oneData: [{ role, token, <profile> }] }
           // Supports one phone mapped to multiple roles (rare but handled)
```

### JWT Payloads

| Role | Payload fields |
|------|---------------|
| `admin` | `id`, `school_id`, `school_code`, `role` |
| `teacher` | `teacher_id`, `school_id`, `assignedClass`, `role`, name, email |
| `admin-teacher` | Same as teacher, `role: 'admin-teacher'` |
| `student` | `student_id`, `school_id`, `admission_id`, `standard`, `section`, `role`, name |

### Middleware Guards

| Middleware | Who can pass | Usage |
|-----------|-------------|-------|
| `AdminAuth("permission")` | Admins with the named permission, or the `admin` role | Most `/api/*` routes |
| `AdminAuth("all")` | Any admin regardless of role permissions | Routes that any admin can access |
| `completeLogin` | admin, teacher, admin-teacher, student | Read-only shared routes |
| `teacherAuth("permission")` | Admins (permission-checked) + teachers + admin-teachers | Teacher-facing routes |
| `semiAdminAuth("permission")` | Admins (permission-checked) + admin-teachers | Semi-privileged routes |
| `StudentAuth` | Students only | Student-facing routes |
| `MasterAdminAuth` | HTTP Basic (`MASTER_ADMIN_USERNAME/PASSWORD`) | Super-admin school setup |

---

## API Reference

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/admin-login` | — | Admin login (email + password) |
| POST | `/mobileAPI/otp-request` | — | Request OTP |
| POST | `/mobileAPI/otp-verify` | OTP token | Verify OTP, get role token |

### Dashboard

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/dashboard` | Admin | Admin profile + permissions |
| GET | `/api/main-dashboard` | Admin | Student/teacher counts, attendance, fee collection |
| GET | `/api/userDetails` | Any | Returns JWT payload |

### School (Super-Admin)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/super-admin/schools` | Basic | Provision school + admin + academic year |

### Students

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/student` | Admin (student management) | Create student + fee records + User |
| GET | `/mobileAPI/students/:id` | Admin | Full student profile with fees and exam history |
| POST | `/api/search/student` | Admin (student management) | Search/paginate students |
| PUT | `/api/student/:id` | Admin (student management) | Update student |
| DELETE | `/api/student/:id` | Admin (student management) | Delete student and related data |

### Teachers

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/teacher` | Admin (teacher management) | Create teacher + User |
| GET | `/api/teacher` | Admin (teacher management) | List all teachers |
| GET | `/api/teacher/:id` | Admin (teacher management) | Get teacher by ID |
| POST | `/api/search/teacher` | Admin (teacher management) | Search/paginate teachers |
| PUT | `/api/teacher/:id` | Admin (teacher management) | Update teacher + User |
| DELETE | `/api/teacher/:id` | Admin (teacher management) | Delete teacher + User |

### Classrooms

| Method | Path | Description |
|--------|------|-------------|
| POST | `/mobileAPI/classroom` | Create classroom |
| GET | `/mobileAPI/classroom` | List classrooms |
| PUT | `/mobileAPI/classroom/:id` | Update classroom |
| DELETE | `/mobileAPI/classroom/:id` | Delete classroom |

### Attendance

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/mobileAPI/student/attendance` | Teacher | Mark student attendance |
| GET | `/mobileAPI/student/attendance` | Teacher/Admin | Fetch student attendance |
| POST | `/mobileAPI/teacher/attendance` | Teacher | Mark own attendance |

### Exams

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/exam` | Admin (exam) | Create exam |
| GET | `/api/exam` | Any logged-in | List exams |
| PUT | `/api/exam/:exam_id` | Admin (exam) | Update exam |
| POST | `/api/studentMarks` | Admin (exam) | Bulk-add marks for a student |
| GET/POST/PUT | `/api/exam-marks` | Admin (exam) | Manage individual marks |

### Leaves (Teacher)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/teacher/leaves` | Teacher | List own leaves |
| POST | `/api/teacher/leaves` | Teacher | Submit leave request |
| PUT | `/api/teacher/leaves/:id` | Teacher | Edit pending leave |
| PATCH | `/api/teacher/leaves/:id/cancel` | Teacher | Cancel leave |

### Leaves (Admin)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/admin/leaves` | Admin | List all leaves (filterable) |
| GET | `/api/admin/leaves/stats` | Admin | Leave counts by status |
| GET | `/api/admin/leaves/:id` | Admin | Leave detail |
| PATCH | `/api/admin/leaves/:id/approve` | Admin | Approve leave |
| PATCH | `/api/admin/leaves/:id/reject` | Admin | Reject leave (reason required) |

### Fee Management

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/fee_category` | Admin (fee) | Create fee category |
| GET | `/api/fee_category` | Admin | List categories |
| POST | `/api/fee/fee-collect` | Admin (fee) | Record fee payment |

### Other Modules

- **Homework** — `/mobileAPI/homework` (teacher-created, student-readable)
- **Message Board** — `/mobileAPI/messageBoard` (school / class / individual messages)
- **Gallery** — `/mobileAPI/gallery` (photo uploads)
- **Banner Images** — `/api/bannerImage`
- **YouTube Videos** — `/mobileAPI/add-new-video`
- **User Rights** — `/api/roles` (manage role permissions)

### Static Files

Photos are served via AES-encrypted URLs that are IP-bound:

```
GET /staticFiles/photos/:encrypted-id
```

The encrypted ID contains the file path and the client IP. The server decrypts it and compares IPs before serving the file.

---

## Database Schema Overview

```
School ──┬── Admin ──── Roles
         ├── Teachers ── Subjects
         ├── Students ── Classrooms
         ├── User  ◄──── master auth table (all roles)
         ├── AcademicYear ── SchoolFinancials
         ├── Exams ── ExamMarks
         ├── StudentFees ── FeeCategories ── StudentsPayments
         ├── StudentAttendance
         ├── TeacherAttendance
         ├── TeacherLeave
         ├── Homeworks
         ├── MessageBoards
         ├── Gallery / BannerImages / YoutubeVideo
         └── InterestedSchools (standalone — prospect pipeline)
```

---

## Migrating Existing Admins

When upgrading an existing deployment, run the one-time migration script to backfill `User` records for all admins and hash any plaintext passwords:

```bash
node seeds/migrateAdminsToUsers.js
```

The script is idempotent — re-running it skips admins that already have a `User` record.

---

## Role Permission Reference

Permissions stored in `Roles.permissions` (JSON array). Common values:

| Permission string | Controls access to |
|-------------------|--------------------|
| `"student management"` | Student CRUD |
| `"teacher management"` | Teacher CRUD |
| `"exam"` | Exam & marks management |
| `"fee"` | Fee category + payment collection |
| `"attendance"` | Attendance routes |
| `"classroom"` | Classroom management |
| `"subject"` | Subject management |
| `"roles"` | User rights management |
| `"gallery"` | Gallery uploads |
| `"banner Images"` | Banner image uploads |
| `"managing videos"` | YouTube video management |

An admin with `role_name === 'admin'` bypasses all permission checks and has full access.

---

## Notes

- **Uploads** are stored locally in `uploads/`. For production, migrate to object storage (S3 / GCS) and update `multerService.js` and the static file route.
- **Rate limiting** is set to 100 requests per 15 minutes globally. Adjust `index.js` if mobile clients need higher limits.
- **CORS** is currently open (`origin: '*'`). Restrict to your frontend domain in production.
- **Admin passwords** are hashed with bcrypt (cost factor 10). Passwords stored before the migration will be hashed on first `migrateAdminsToUsers.js` run.
