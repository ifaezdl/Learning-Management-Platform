# EduCore — AI-Powered Learning Management System

> A full-stack, production-grade Learning Management System built with NestJS and React 19, featuring AI-generated quizzes, real-time course chat, role-based multi-portal access, and a complete e-commerce flow for course enrollment.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Core Features](#4-core-features)
   - [Authentication & Authorization](#41-authentication--authorization)
   - [Course Management](#42-course-management)
   - [AI-Powered Quiz Generation](#43-ai-powered-quiz-generation)
   - [Real-Time Course Chat](#44-real-time-course-chat)
   - [E-Commerce Flow](#45-e-commerce-flow)
   - [Certificate System](#46-certificate-system)
   - [Student Progress Tracking](#47-student-progress-tracking)
   - [Instructor Application Workflow](#48-instructor-application-workflow)
   - [Admin Dashboard](#49-admin-dashboard)
5. [Innovations & Standout Design Decisions](#5-innovations--standout-design-decisions)
6. [Database Schema](#6-database-schema)
7. [API Reference](#7-api-reference)
8. [Role System & Access Control](#8-role-system--access-control)
9. [Project Structure](#9-project-structure)
10. [Getting Started](#10-getting-started)

---

## 1. Project Overview

EduCore is a comprehensive Learning Management System designed for Persian-speaking (Farsi) educational institutions and online course providers. The platform supports three distinct user roles — **students**, **instructors**, and **admins** — each with a dedicated, feature-rich portal.

The system goes beyond standard LMS capabilities by integrating a **self-hosted Large Language Model (LLM)** to automatically generate course-specific quiz questions, making it one of the distinguishing innovations of this project. Additionally, it provides a **real-time course chat** system, an automated **certificate issuance** engine, and a complete **course marketplace** with cart and payment flows.

### Key Highlights

- AI quiz generation using a self-hosted **Qwen3-4b** LLM, context-aware of each course's content
- Real-time chat per course using **Server-Sent Events (SSE)** with reactions, polls, replies, and read receipts
- Three-role platform: **Student**, **Instructor**, **Admin** — each with full-featured dedicated portals
- Atomic **certificate issuance** with unique codes, triggered automatically on quiz pass
- Randomized **question bank** anti-cheat mechanism: bank can hold N questions, students see M < N per attempt
- Full course marketplace: browsing, filtering, cart, checkout, enrollment
- **Google OAuth 2.0** login alongside traditional JWT authentication
- Bilingual system: Persian UI and AI prompts, English API layer

---

## 2. Architecture

The project is a **monorepo** with two independent applications:

```
Learning-Management-System/
├── backend/     ← NestJS REST API (port 3000)
└── FrontEnd/    ← React 19 SPA (port 3001)
```

### Communication Model

```
┌─────────────────────────────────┐
│     React SPA  (port 3001)      │
│  Redux Toolkit + React Context  │
└────────────┬────────────────────┘
             │  Axios HTTP (JWT Bearer)
             │  SSE stream for chat
             ▼
┌─────────────────────────────────┐
│   NestJS REST API  (port 3000)  │
│   17 Modules · Swagger at /api/docs │
└────────────┬────────────────────┘
             │  Prisma ORM
             ▼
┌─────────────────────────────────┐
│       SQL Server (MSSQL)        │
│   26 models · Azure SQL ready   │
└─────────────────────────────────┘
             ▲
             │  OpenAI-compatible HTTP API
┌─────────────────────────────────┐
│  Self-hosted LLM (Qwen3-4b)    │
│  Used for quiz generation only  │
└─────────────────────────────────┘
```

The frontend communicates with the backend exclusively over REST. The only exception is the chat module, which uses a persistent **SSE (Server-Sent Events)** connection at `GET /chat/events?token=` for push-based real-time updates — a deliberate choice over WebSockets for its simplicity and HTTP/2 compatibility.

---

## 3. Technology Stack

### Backend

| Concern | Technology |
|---|---|
| Runtime | Node.js + TypeScript |
| Framework | **NestJS 11** (modular, decorator-driven) |
| ORM | **Prisma 5** |
| Database | **SQL Server** (MSSQL / Azure SQL) |
| Authentication | **JWT** (`@nestjs/jwt`) + Passport + `passport-jwt` |
| OAuth 2.0 | Google (`passport-google-oauth20`) |
| Password Hashing | bcrypt |
| File Uploads | Multer 2 (served statically from `/uploads`) |
| API Documentation | **Swagger** (`@nestjs/swagger`) — auto-generated at `/api/docs` |
| Validation | `class-validator` + `class-transformer` with global `ValidationPipe` |
| AI Integration | Native `fetch` → OpenAI-compatible API (self-hosted Qwen3-4b) |
| Testing | Jest 30 + Supertest |

### Frontend

| Concern | Technology |
|---|---|
| Language | TypeScript |
| Framework | **React 19** |
| Routing | React Router DOM v7 |
| Global State | **Redux Toolkit** |
| Auth State | React Context API (`AuthContext`) |
| HTTP Client | **Axios** with automatic token-refresh interceptors |
| UI Components | **Ant Design 5**, Bootstrap 5, PrimeReact |
| Charts | ApexCharts (`react-apexcharts`) |
| Video Player | ReactPlayer |
| Notifications | react-hot-toast |
| Rich Text Editor | react-simple-wysiwyg |
| Carousels / Sliders | Swiper 11, React Slick |
| CSS Pre-processor | Sass |
| Icons | Font Awesome 6, React Icons, Tabler Icons |
| Animations | AOS (Animate On Scroll) |
| PDF / Image Export | html2canvas |
| Maps | `@react-google-maps/api` |
| Date Pickers | react-multi-date-picker (Persian/Jalali calendar support) |

---

## 4. Core Features

### 4.1 Authentication & Authorization

The system implements a robust, stateful JWT authentication strategy:

- **Registration:** New accounts are created as students (role = 1) by default. Email and username uniqueness is enforced at the database and application layer.
- **JWT Login:** Credentials are verified, a short-lived JWT access token is issued (payload: `{ sub, username, role }`), and a UUID v4 refresh token is stored in the `RefreshTokens` table with a 7-day expiry.
- **Token Rotation:** On every refresh request, the old refresh token is revoked (`RevokedAt` is set) and a new one is issued. This prevents replay attacks.
- **Silent Refresh on Frontend:** Axios interceptors automatically intercept 401 responses, call `/auth/refresh`, replace both tokens in localStorage, and retry the original request — invisible to the user.
- **Logout:** Sets `RevokedAt` on the server-side refresh token, invalidating the session immediately regardless of the access token's remaining lifetime.
- **Google OAuth 2.0:** Users can log in with Google. Critically, the system only allows login for **pre-existing accounts** — it does not auto-register new users via OAuth, preventing unintended account creation.
- **Profile Hydration:** After login or token refresh, the frontend immediately loads the full user profile (avatar, mobile, sex) and merges it into the stored user object.

### 4.2 Course Management

Instructors can build fully structured courses through a multi-step creation form:

- **Sections & Lessons:** Courses are organized into named sections, each containing ordered lessons. Lessons support video content (with a `VideoType` flag for different video sources), text descriptions, and downloadable file attachments.
- **Rich Metadata:** Each course stores a title, full description, short description, thumbnail image, price, discount price, duration, difficulty level, category, and a unique URL slug.
- **Learning Outcomes & Prerequisites:** Ordered lists of learning outcomes and prerequisites are stored as separate normalized records, enabling clean UI rendering and future reuse.
- **Publish Workflow:** A course is draft by default. Publishing is a deliberate action (`PUT /courses/:id/publish`) that validates the course has content. Admins can manage any course; instructors can only manage their own.
- **Free Preview:** Individual lessons can be marked as `IsFreePreview`, making them accessible without enrollment for marketing purposes.
- **Course Browsing:** The public `/courses/browse` endpoint supports full-text search, category filtering, level filtering, and pagination — returning only published courses.
- **Reviews & Ratings:** Enrolled students can leave reviews with a star rating. The course's `AverageRating` field is maintained and exposed.

### 4.3 AI-Powered Quiz Generation

This is the most technically innovative feature of the system. Located in `backend/src/quiz/quiz.service.ts`.

**How it works, end to end:**

1. An instructor opens the quiz builder for a course and clicks "Generate with AI", specifying the number of questions wanted.
2. The backend calls `generateQuestions(courseId, user, { count })`. It first verifies the instructor owns the course, then builds a context-rich prompt by loading:
   - Course title, category, level, short description, full description
   - All learning outcomes
   - All prerequisites
   - All lesson titles (flattened from all sections)
3. A bilingual (Persian) system prompt instructs the LLM to return **only a valid JSON array** — no markdown, no explanation — where each item has `questionText` and exactly 4 `choices` with exactly one `isCorrect: true`.
4. The backend calls the self-hosted LLM at the URL configured via `AI_API_URL` environment variable (running **Qwen/Qwen3-4b** on an OpenAI-compatible API server), with `temperature: 0.7` and `enable_thinking: false` for deterministic output.
5. The raw response goes through `extractJsonArray()`, which strips markdown fences (in case the model adds them despite the prompt), locates the JSON array boundaries, parses it, and validates each question's structure.
6. The generated questions are **returned to the instructor as a preview** — they are not saved yet. The instructor can review, edit, add manual questions, and then save the final quiz.
7. Each saved question records a `Source` boolean (`true` = AI-generated), so AI vs. human-authored questions are distinguishable in analytics.

**Quiz Configuration:**
- Time window: `StartAt` / `EndAt` dates
- Time limit per attempt: `DurationMinutes`
- Pass score threshold: `PassScore`
- Question bank vs. shown: `QuestionsToShow` ≤ total questions
- Navigation: `AllowPreviousQuestion` toggle
- Display mode: `ShowAllQuestions` or one-at-a-time

**Anti-Cheat: Randomized Question Bank:**
When a student starts a quiz attempt, the backend selects M questions from the bank of N using a **Fisher-Yates shuffle**, then stores the selected question IDs as a JSON array in `QuizAttempts.QuestionIds`. This means:
- Different students see different subsets
- A student who refreshes resumes the exact same set (stored, not re-randomized)
- The bank can grow over time without affecting in-progress attempts

**Grading:**
Each question has its own `Score` value (decimal), enabling weighted questions. The attempt's `MaxScore` is computed from the selected questions' scores. `IsPassed` is set when `Score >= PassScore`.

### 4.4 Real-Time Course Chat

Each course has its own chat room. The system implements full social messaging using **Server-Sent Events** instead of WebSockets.

**Why SSE over WebSockets:** SSE is unidirectional (server → client), which is sufficient here since client-to-server actions go through standard REST POST endpoints. SSE works through HTTP/2 multiplexing, requires no special proxy configuration, and is simpler to implement reliably without a separate WebSocket server.

**Feature set:**
- **Messages:** Text content or file attachments (stored in `/uploads`, URL + metadata saved to DB)
- **Threaded Replies:** Messages have a `ReplyTo_Id` self-referential foreign key, creating a two-level thread structure
- **Emoji Reactions:** Any user can react to any message with an emoji. The same emoji from the same user toggles the reaction off (implemented as a unique constraint on `(MessageId, UserId, Emoji)`)
- **Polls:** Instructors and admins can create polls in the course chat. Students vote on options. Votes are unique per user per option. Real-time results are pushed via SSE to all connected members
- **Read Receipts:** The `ChatReads` table stores the last-read message ID per user per course, enabling accurate unread message counts for each course chat
- **Typing Indicators:** A `POST /chat/courses/:courseId/typing` endpoint broadcasts a typing event via SSE to other members — no DB write, pure real-time signal
- **Online Presence:** The `GET /chat/courses/:courseId/members` endpoint indicates which members are currently connected (have an active SSE stream)
- **Message Deletion:** Senders can delete their own messages; admins can delete any message. Deletion broadcasts a `message_deleted` SSE event

**SSE Authentication:** Since browser `EventSource` cannot set Authorization headers, the SSE endpoint reads the JWT from the `?token=` query parameter. A dedicated `SseAuthGuard` handles this.

### 4.5 E-Commerce Flow

The platform includes a complete course purchase flow:

1. **Browse:** Students browse published courses with search, category, and level filters
2. **Cart:** Courses are added to a cart (`Carts` table, unique per user-course pair to prevent duplicates)
3. **Checkout:** `POST /payment/checkout` processes the cart — it records a `Payments` entry per course and creates `Enrollments` records, then clears the cart. (The payment itself is simulated; integration with a real payment gateway is the next step)
4. **Enrollment:** Once enrolled, students gain access to all published lessons in the course
5. **Free Preview:** Non-enrolled visitors can watch `IsFreePreview` lessons without purchasing

### 4.6 Certificate System

Certificates are issued automatically and atomically:

- When a student submits a quiz and **passes** (`score >= passScore`), the backend wraps the entire operation in a Prisma transaction: record answers → compute score → update attempt → **create certificate** — all or nothing
- Each certificate gets a unique, human-readable code in the format `CERT-{courseId}-{attemptId}-{timestamp}`
- Certificates are stored in the `Certificates` table linked to the quiz attempt, with score, max score, and issue date
- Students can view and download their certificates from their portal
- The certificate download leverages `html2canvas` on the frontend to render a styled certificate card as an image

### 4.7 Student Progress Tracking

The system tracks learning progress at the granular lesson level:

- The `CourseProgress` table has a unique constraint on `(Lesson_Id, Student_Id)`, meaning each lesson-student pair has exactly one progress record
- As students mark lessons complete, a `CourseProgress` record is created or updated with `IsCompleted = true` and a `CompletedAt` timestamp
- The instructor's student management view shows each enrolled student's progress percentage, calculated from completed vs. total lessons
- The student dashboard shows in-progress courses with their completion percentage

### 4.8 Instructor Application Workflow

The platform supports a structured pathway for students to become instructors:

1. A student submits an application through "Become an Instructor", uploading their CV/resume (stored in `/uploads`) along with a description of their qualifications
2. The application is stored in `InstructorRequests` with `Status = "Pending"` and a reference to the uploaded resume file
3. The admin reviews applications through the Admin Portal's "Requests" section — viewing the description and downloading the resume before deciding
4. On approval or rejection, `Status` is updated and `ReviewedBy` + `ReviewedAt` are recorded, maintaining a full audit trail

### 4.9 Admin Dashboard

Admins have platform-wide oversight through a dedicated portal:

- **User Management:** View all users, change roles, activate/deactivate accounts
- **Course Management:** See all courses (published and unpublished) with filters; publish, update, or delete any course
- **Student Performance Report:** A per-course analytics report covering enrollment count, quiz participation count, pass rate (%), and average quiz score — giving a birds-eye view of educational effectiveness
- **Instructor Requests:** Review and action pending instructor applications
- **Contact Messages:** View and manage public contact form submissions with read/unread status
- **Profile & Settings:** Admin can manage their own profile

---

## 5. Innovations & Standout Design Decisions

### 5.1 AI Quiz Generation with Context-Aware Prompting

Most LMS platforms with AI features use generic AI tools. EduCore's quiz generator is **course-aware**: it builds the LLM prompt from the actual course structure — lesson titles, learning outcomes, prerequisites, difficulty level, and full description. This produces questions that are directly relevant to what was taught, not generic topic questions.

The prompt engineering is deliberately strict: the system message instructs the model to return only a raw JSON array with no markdown, no explanation, and a fixed schema per question. The `extractJsonArray()` parser then defensively handles any deviations the model makes anyway (e.g., wrapping output in markdown fences), making the pipeline robust.

### 5.2 Separation of Question Bank from Shown Questions

The distinction between `QuestionsToShow` (shown per attempt) and the total bank size is a deliberate anti-cheat design. An instructor can maintain a bank of 50 questions but only show 20 per attempt — making it statistically difficult for students to share answers. The selected set is locked to the attempt record so resumption is always consistent.

### 5.3 SSE-Based Real-Time Architecture Without WebSocket Overhead

Using SSE for the chat module is an architectural choice that reduces operational complexity. SSE streams work over standard HTTP, require no protocol upgrade, and are straightforward to implement in NestJS via `@Sse()` with RxJS `Observable`. The in-memory user-stream registry in `ChatEventsService` handles broadcasting efficiently for the expected single-instance deployment.

### 5.4 Atomic Certificate Issuance in a Database Transaction

Placing the certificate creation inside the same Prisma transaction as the quiz submission ensures that a student who passes can never have a submission recorded without a certificate, and can never receive a certificate without a valid submission — even under concurrent requests or partial failures.

### 5.5 Refresh Token Rotation with Server-Side Revocation

The refresh token strategy does not rely solely on token expiry. Every refresh operation revokes the old token immediately (`RevokedAt` timestamp) and issues a new one. This means a stolen refresh token can only be used once before the legitimate user's next refresh invalidates it. Logout immediately revokes the token server-side, providing true session termination rather than waiting for token expiry.

### 5.6 Role-Based Frontend Route Guards

The frontend implements a `RoleRoute` wrapper component that enforces access at the routing layer. Unauthenticated users are redirected to `/login`; authenticated users accessing a route outside their role are redirected to a `/403` page. This mirrors the backend's `RolesGuard`, providing defense in depth.

### 5.7 BigInt Serialization Handling

The `ChatMessages.AttachmentSize` and `LessonFiles.FileSize` fields are `BigInt` in SQL Server (to support very large files). Since `JSON.stringify` does not natively handle BigInt, `main.ts` patches `BigInt.prototype.toJSON` to call `.toString()` — a practical production fix that prevents silent serialization failures.

### 5.8 Persian / Bilingual System

The AI prompt, backend validation messages, and parts of the UI are in Persian (Farsi), reflecting the target user base. The Persian calendar date picker (`react-multi-date-picker`) is included for culturally appropriate date selection. This localization is baked into the architecture, not bolted on.

---

## 6. Database Schema

The SQL Server database is managed entirely through Prisma. Below is a summary of all 26 models and their purpose.

| Model | Purpose |
|---|---|
| `Users` | All accounts: students (role 1), instructors (role 2), admins (role 3). Fields include FirstName, LastName, UserName, Email, Mobile, PasswordHash, Avatar, IsActive, LastLogin |
| `Roles` | Role lookup: Id + RoleName |
| `Sex` | Gender lookup for profile |
| `RefreshTokens` | Persisted refresh tokens with ExpiresAt and RevokedAt for token rotation |
| `Category` | Course categories with Title, Description, Icon |
| `Level` | Course difficulty levels (Beginner, Intermediate, Advanced, etc.) |
| `Courses` | Core course entity: Title, Description, Price, DiscountPrice, IsPublished, Thumbnail, ShortDescription, DurationMinutes, AverageRating, Slug (unique), Teacher_Id, CategoryId, Level_Id |
| `CourseSections` | Named sections within a course with DisplayOrder |
| `Lessons` | Individual lessons: VideoUrl, DurationMinutes, SortOrder, IsFreePreview, IsPublished, Section_Id, VideoType |
| `LessonFiles` | Downloadable attachments per lesson with FileSize (BigInt), DownloadCount, FileExtension |
| `CourseLearningOutcomes` | Ordered list of what students will learn per course |
| `CoursePrequisties` | Ordered list of prerequisites per course |
| `Enrollments` | Student ↔ Course relationship with EnrollmentDate and Status |
| `CourseProgress` | Per-student per-lesson completion; unique on (Lesson_Id, Student_Id) |
| `Carts` | Shopping cart items; unique on (User_Id, Course_Id) |
| `Payments` | Payment records: Amount, RefNumber, Status, linked to User and Course |
| `Reviews` | Student reviews: Rating (1–5), Comment, IsApproved, linked to User and Course |
| `Quizzes` | Quiz configuration: StartAt, EndAt, DurationMinutes, PassScore, QuestionsToShow, ShowAllQuestions, AllowPreviousQuestion, IsPublished |
| `QuizQuestions` | Questions in the bank: QuestionText, Score, DisplayOrder, Source (AI flag) |
| `QuizChoices` | Multiple-choice options: ChoiceText, IsCorrect, DisplayOrder |
| `QuizAttempts` | Student attempt: QuestionIds (JSON), StartedAt, DeadlineAt, SubmittedAt, Score, MaxScore, IsPassed; unique on (Quiz_Id, Student_Id) |
| `QuizAttemptAnswers` | Per-question answer records with IsCorrect flag |
| `Certificates` | Issued certificates: CertificateCode, Score, MaxScore, IssuedAt, linked to Attempt |
| `InstructorRequests` | Instructor applications: Status (Pending/Approved/Rejected), Description, ResumeUrl, ReviewedBy, ReviewedAt |
| `ChatMessages` | Course-scoped messages: Content, AttachmentUrl/Name/Type/Size, ReplyTo_Id (self-referential for threads) |
| `ChatReads` | Last-read message cursor per user per course for unread count |
| `ChatMessageReactions` | Emoji reactions; unique on (Message_Id, User_Id, Emoji) for toggle behavior |
| `ChatPolls` | Polls in course chat: Question, IsActive, Creator_Id |
| `ChatPollOptions` | Poll answer options per poll |
| `ChatPollVotes` | Votes; unique on (Option_Id, User_Id) to prevent double voting |
| `ContactMessages` | Public contact form: FullName, Email, Phone, Subject, Message, IsRead |

---

## 7. API Reference

The full interactive API documentation is available at `http://localhost:3000/api/docs` (Swagger UI) when running locally.

### Auth — `/auth`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/auth/register` | Create student account | Public |
| POST | `/auth/login` | Login → access + refresh tokens | Public |
| POST | `/auth/refresh` | Rotate refresh token | Public |
| POST | `/auth/logout` | Revoke refresh token | Public |
| GET | `/auth/google` | Initiate Google OAuth | Public |
| GET | `/auth/google/callback` | OAuth callback | Public |

### Courses — `/courses`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/courses` | All published courses | Public |
| GET | `/courses/browse` | Paginated search + filter | Public |
| POST | `/courses` | Create course | Instructor / Admin |
| GET | `/courses/my` | Instructor's own courses | Instructor |
| GET | `/courses/enrolled` | Student's enrolled courses | Student |
| GET | `/courses/admin` | All courses (admin view) | Admin |
| GET | `/courses/admin/performance-report` | Quiz analytics per course | Admin |
| GET | `/courses/:id` | Course detail (enrollment context if logged in) | Optional JWT |
| PUT | `/courses/:id` | Update course | Owner / Admin |
| DELETE | `/courses/:id` | Delete course | Owner / Admin |
| PUT | `/courses/:id/publish` | Publish course | Owner / Admin |
| GET/PUT | `/courses/:id/learning-outcomes` | Manage outcomes | Owner / Admin |
| GET/PUT | `/courses/:id/prerequisites` | Manage prerequisites | Owner / Admin |
| GET | `/courses/:id/students` | Enrolled students + progress | Owner / Admin |

### Quiz — `/courses/:courseId/quiz` & `/quizzes` & `/quiz`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/courses/:courseId/quiz` | Get quiz + question bank | Instructor / Admin |
| POST | `/courses/:courseId/quiz/generate` | AI generate questions | Instructor / Admin |
| POST | `/courses/:courseId/quiz` | Save / replace quiz | Instructor / Admin |
| POST | `/courses/:courseId/quiz/start` | Start attempt (randomized questions) | Student |
| GET | `/quizzes/my` | Student quiz list with attempt status | Student |
| POST | `/quiz/attempts/:attemptId/submit` | Submit answers | Student |
| GET | `/quiz/attempts/:attemptId/result` | Get attempt result | Student |

### Chat — `/chat`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/chat/events?token=` | SSE live event stream | JWT via query |
| GET | `/chat/courses` | User's chat list with unread counts | JWT |
| GET | `/chat/courses/:courseId/messages` | Paginated message history | JWT |
| GET | `/chat/courses/:courseId/members` | Member list + online status | JWT |
| POST | `/chat/courses/:courseId/messages` | Send message / attachment / reply | JWT |
| DELETE | `/chat/messages/:messageId` | Delete message | JWT (owner or admin) |
| POST | `/chat/courses/:courseId/read` | Mark messages as read | JWT |
| POST | `/chat/courses/:courseId/typing` | Broadcast typing indicator | JWT |
| POST | `/chat/messages/:messageId/reaction` | Add / toggle emoji reaction | JWT |
| GET | `/chat/courses/:courseId/polls` | Get course polls | JWT |
| POST | `/chat/courses/:courseId/polls` | Create poll | Instructor / Admin |
| POST | `/chat/polls/:pollId/vote` | Vote on poll | JWT |

### Other Modules
| Module | Base Path | Notes |
|---|---|---|
| Users | `/users` | Profile management, avatar upload |
| Categories | `/categories` | Course category CRUD |
| Levels | `/levels` | Difficulty level CRUD |
| Course Sections | `/course-sections` | Section CRUD within courses |
| Lessons | `/lessons` | Lesson CRUD, video/file management |
| Lesson Files | `/lesson-files` | Attachment upload and download |
| Upload | `/upload` | Generic file upload (Multer) |
| Cart | `/cart` | Add / remove / view cart |
| Payment | `/payment/checkout` | Process cart → enrollment |
| Certificates | `/certificates` | View issued certificates |
| Instructor Requests | `/instructor-requests` | Apply, review, approve/reject |
| Contact Messages | `/contact-messages` | Public contact form + admin inbox |
| Student Dashboard | `/api/student/dashboard/summary` | Aggregated student stats |
| Instructor Dashboard | `/api/instructor/dashboard/summary` | Aggregated instructor stats |

---

## 8. Role System & Access Control

### Roles

| Role ID | Name | Description |
|---|---|---|
| 1 | Student | Default role on registration. Can enroll, watch, take quizzes, chat, get certificates |
| 2 | Instructor | Can create and manage courses, build quizzes (with AI), view student progress, access earnings |
| 3 | Admin | Full platform access: user management, all courses, performance reports, instructor requests |

### Backend Enforcement

- `JwtAuthGuard`: Validates the JWT on every protected endpoint. Injects the decoded `{ id, username, roleId }` as `CurrentUser`.
- `RolesGuard`: Reads `@Roles(2, 3)` metadata from the route decorator and rejects requests from users whose `roleId` is not in the allowed list.
- `OptionalJwtAuthGuard`: Used on public endpoints (like course detail) that optionally return personalized data (e.g., whether the viewer is enrolled) without requiring authentication.
- Resource-level ownership: Even within allowed roles, service methods verify that the requesting user owns the resource (e.g., a teacher cannot edit another teacher's course) unless the user is admin (role 3).

### Frontend Enforcement

- `RoleRoute` wrapper component: Reads `user.roleId` from `AuthContext`. Redirects unauthenticated users to `/login` and wrong-role users to `/403`.
- Route groups in `router.link.tsx` are organized by role, making it easy to see which pages belong to which portal.

---

## 9. Project Structure

```
Learning-Management-System/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          ← Database schema (26 models)
│   └── src/
│       ├── auth/                  ← JWT, OAuth, guards, decorators
│       ├── cart/                  ← Shopping cart
│       ├── categories/            ← Course categories
│       ├── chat/                  ← SSE real-time chat, polls, reactions
│       ├── common/                ← Shared utilities
│       ├── config/                ← Configuration modules
│       ├── contact-messages/      ← Public contact form
│       ├── course-sections/       ← Course section CRUD
│       ├── courses/               ← Course CRUD, publish, performance
│       ├── enrollments/           ← Enrollment management
│       ├── instructor-requests/   ← Instructor application workflow
│       ├── lesson-files/          ← Lesson attachment management
│       ├── lessons/               ← Lesson CRUD
│       ├── levels/                ← Difficulty levels
│       ├── payment/               ← Checkout and payment records
│       ├── prisma/                ← PrismaService
│       ├── progress/              ← Per-lesson completion tracking
│       ├── quiz/                  ← AI generation, bank, attempts, grading
│       ├── roles/                 ← Role lookup
│       ├── upload/                ← Multer file upload handler
│       ├── users/                 ← User profiles, avatar
│       ├── utils/                 ← Shared helpers
│       ├── instructor-dashboard.controller.ts
│       ├── student-dashboard.controller.ts
│       ├── app.module.ts
│       └── main.ts                ← Bootstrap, Swagger, CORS, static files
│
└── FrontEnd/
    └── src/
        ├── context/
        │   └── AuthContext.tsx    ← Auth state, token refresh, profile hydration
        ├── services/              ← Axios service layer (auth, courses, quiz, chat...)
        ├── store/                 ← Redux Toolkit slices
        └── feature-module/
            ├── home/              ← Landing page
            ├── Courses/           ← Browse, detail, watch, cart, checkout
            ├── Instructor/        ← Full instructor portal
            ├── student/           ← Full student portal
            ├── admin/             ← Full admin portal
            ├── pages/             ← About, FAQ, Contact, Pricing, Auth pages
            └── router/
                ├── all_routes.tsx ← Route path constants
                └── router.link.tsx← Route definitions with RoleRoute guards
```

---

## 10. Getting Started

### Prerequisites

- Node.js 20+
- SQL Server instance (local or Azure SQL)
- A running Qwen3-4b (or compatible) LLM server accessible via OpenAI-compatible API (for AI quiz generation)

### Backend Setup

```bash
cd backend
npm install

# Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL, JWT_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, AI_API_URL

# Run Prisma migrations
npx prisma db push

# Start development server (port 3000)
npm run start:dev
```

### Frontend Setup

```bash
cd FrontEnd
npm install

# Start development server (port 3001)
npm start
```

### Environment Variables

**Backend `.env`:**
```
DATABASE_URL="sqlserver://..."
JWT_SECRET="your-secret-key"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GOOGLE_CALLBACK_URL="http://localhost:3000/auth/google/callback"
FRONTEND_URL="http://localhost:3001"
AI_API_URL="http://your-llm-server:1234/v1/chat/completions"
```

### Accessing the API Documentation

With the backend running, visit: `http://localhost:3000/api/docs`

The Swagger UI documents every endpoint with request/response schemas, authentication requirements, and example values.

---

## Article Prompt Notes

> This README is written to serve as a comprehensive reference document for writing a technical article about this project. All major systems, design decisions, and innovations are documented above with enough detail to understand the "why" behind each choice — not just the "what". Key talking points for an article:
>
> - **AI Integration:** The context-aware quiz generation with a self-hosted Qwen3-4b model is the headline innovation. Emphasize how the prompt is built from real course data, not generic topics.
> - **Real-Time Without WebSockets:** SSE-based chat is a pragmatic engineering choice worth highlighting — it achieves real-time UX without WebSocket complexity.
> - **Atomic Transactions for Data Integrity:** The quiz submission + certificate issuance in one Prisma transaction is a good example of correctness-first design.
> - **Token Rotation Security:** The refresh token rotation pattern with immediate server-side revocation is more secure than typical JWT implementations that rely purely on expiry.
> - **Bilingual / Persian-First:** The system is designed for a Persian-speaking market — AI prompts, validation messages, and date pickers all reflect this.
> - **Scale of the Platform:** 17 NestJS modules, 26 database models, 3 user portals, 80+ frontend routes — this is not a toy project.
