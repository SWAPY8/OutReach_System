# Dhankranti Share Market Classes — Student Review System (MVP)

A branded, mobile-first web application built specifically for **Dhankranti Share Market Classes** that helps students leave Google Reviews effortlessly by scanning a QR code, choosing a prewritten educational review, copying it to clipboard, and pasting it on Google Reviews.

---

## 📌 Problem & Solution

### The Core Problem:
Dhankranti wants students to leave Google Reviews, but students don't want to spend time writing a long review after class.

### The Solution Workflow:
```text
SCAN QR CODE at Dhankranti counter
     ↓
REVIEW WEBPAGE OPENS (Combined brand + categories)
     ↓
CHOOSE EXPERIENCE THEME (e.g. Teaching Quality, Practical Learning)
     ↓
CHOOSE PREWRITTEN REVIEW (10 per category, 80 total)
     ↓
TAP [ Copy & Open Google Review ]
     ↓
TEXT COPIED + GOOGLE REVIEW PAGE OPENS IN NEW TAB
     ↓
STUDENT PASTES & SUBMITS
```

> **Security Note:** Browsers enforce same-origin policies preventing DOM manipulation on third-party sites. This app uses a friction-free **Select → Copy → Redirect → Paste** workflow that respects browser security.

---

## 🏢 Company Context

| Detail | Value |
|---|---|
| **Company** | Dhankranti Share Market Classes |
| **Website** | [dhankranti.com](https://dhankranti.com/) |
| **Brand Focus** | Share market education, trading, technical analysis, mentorship |
| **Mentor** | Ram Sir |
| **Brand Colors** | Navy Blue `#1e3a8a`, Growth Green `#059669` |
| **QR Customer Route** | `/r/dhankranti` |

---

## 🛠 Tech Stack

### Frontend
- **React 19** + **Vite** (Fast dev server and optimized production bundling)
- **React Router v7** (Client-side routing)
- **Lucide React** (Pure SVG education-themed icons)
- **qrcode.react** (Crisp vector QR code rendering with canvas download)
- **Axios** (Configured with JWT interceptors)
- **Vanilla Custom CSS** (Dhankranti brand design system, zero Tailwind dependency)

### Backend
- **Python 3.13** + **FastAPI** (High-performance asynchronous REST API)
- **SQLAlchemy 2.0** (ORM with relational modeling)
- **Pydantic v2** (Strict schema validation)
- **Bcrypt** (Secure one-way password hashing)
- **PyJWT** (Signed JWT bearer token authentication)
- **SQLite** (Zero-configuration file-based database at `backend/data/review_app.db`)

---

## 📂 Project Structure

```text
OutReach_System/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py             # App settings, DB path, CORS origins
│   │   │   └── security.py           # Bcrypt hashing, JWT tokens, random tokens
│   │   ├── database/
│   │   │   └── database.py           # SQLAlchemy SQLite engine, SessionLocal, get_db
│   │   ├── models/
│   │   │   ├── admin.py              # Admin table (name, email, password_hash)
│   │   │   ├── shop.py               # Shop table (name, slug, review_url, qr_token)
│   │   │   ├── category.py           # Category table (name, description, icon)
│   │   │   ├── review.py             # ReviewTemplate table (shop_id, category_id, text)
│   │   │   └── review_session.py     # ReviewSession (session_token, timestamps)
│   │   ├── schemas/                  # Pydantic request/response schemas
│   │   ├── routers/
│   │   │   ├── auth.py               # /api/auth/login, /api/auth/me
│   │   │   ├── admin_shops.py        # /api/admin/shops CRUD & QR generation
│   │   │   ├── admin_categories.py   # /api/admin/categories CRUD
│   │   │   ├── admin_reviews.py      # /api/admin/reviews CRUD & filtering
│   │   │   ├── admin_dashboard.py    # /api/admin/dashboard statistics
│   │   │   ├── admin_sessions.py     # /api/admin/sessions audit log
│   │   │   ├── public_review.py      # /api/public/review/{token} & session tracking
│   │   │   └── deps.py               # JWT bearer token dependency
│   │   ├── services/
│   │   │   └── qr_service.py         # QR code data URI generator
│   │   └── main.py                   # FastAPI app entry point with CORS
│   ├── data/
│   │   └── review_app.db             # SQLite database file
│   ├── seed.py                       # Idempotent seeder (1 Admin, 1 Shop, 8 Categories, 80 Reviews)
│   ├── test_api.py                   # Automated API test suite (16 tests)
│   └── requirements.txt              # Backend Python dependencies
│
├── frontend/
│   ├── public/
│   │   ├── logo.png                  # Dhankranti official logo
│   │   └── favicon.png               # Dhankranti favicon
│   ├── src/
│   │   ├── assets/
│   │   │   ├── logo.png              # High-res Dhankranti logo (1083x923)
│   │   │   ├── icon.png              # Compact Dhankranti icon (900x496)
│   │   │   └── favicon.png           # 192x192 favicon
│   │   ├── api/
│   │   │   └── client.js             # Axios instance with auth interceptor
│   │   ├── context/
│   │   │   └── AuthContext.jsx        # Global authentication state
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   │   └── AdminLayout.jsx    # Dark navy sidebar with Dhankranti logo
│   │   │   └── common/
│   │   │       └── ProtectedRoute.jsx # Auth guard for admin screens
│   │   ├── pages/
│   │   │   ├── HomePage.jsx           # Dhankranti portal with quick links
│   │   │   ├── customer/
│   │   │   │   └── CustomerReviewPage.jsx  # 3-screen mobile review flow
│   │   │   └── admin/
│   │   │       ├── AdminLogin.jsx     # Branded login card
│   │   │       ├── AdminDashboard.jsx # 4 metric cards & recent activity
│   │   │       ├── AdminShops.jsx     # Shops table & QR modal
│   │   │       ├── AdminCategories.jsx# Categories with review counts & toggle
│   │   │       ├── AdminReviews.jsx   # Reviews with 3 filters & 0/300 counter
│   │   │       └── AdminSessions.jsx  # Audit log with status badges
│   │   ├── utils/
│   │   │   └── iconMap.jsx            # Pure Lucide icon mapping (8 categories)
│   │   ├── App.jsx                    # React Router route definitions
│   │   ├── index.css                  # Dhankranti brand CSS design system
│   │   └── main.jsx                   # React entry point
│   ├── index.html                     # HTML shell with Inter typography
│   ├── vite.config.js                 # Vite config with /api proxy to :8000
│   └── package.json
├── README.md
└── WALKTHROUGH.md
```

---

## ⚡ Quick Start

### 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Seed the database (1 Admin, Dhankranti shop, 8 categories, 80 reviews)
python seed.py

# Start FastAPI server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Backend: `http://127.0.0.1:8000`  
Swagger Docs: `http://127.0.0.1:8000/docs`

---

### 2. Frontend Setup

```bash
cd frontend

# Install npm dependencies
npm install

# Start Vite dev server
npm run dev
```

Frontend: `http://localhost:5173`

---

## 🔑 Credentials & URLs

| Role | Value |
|---|---|
| **Admin Login URL** | `http://localhost:5173/admin/login` |
| **Admin Email** | `admin@example.com` *(dev only)* |
| **Admin Password** | `Admin@123` *(change before production)* |
| **Student QR Route** | `http://localhost:5173/r/dhankranti` |
| **Home Portal** | `http://localhost:5173/` |
| **Swagger API Docs** | `http://127.0.0.1:8000/docs` |

---

## 📱 Student Review Flow (Mobile Screens)

1. **Screen 1: Combined Brand & Category Selection** (`/r/dhankranti`)
   - Dhankranti official logo and name displayed prominently
   - Immediate 2-column grid of 8 educational categories:
     - 🎓 Teaching Quality
     - 📈 Practical Learning
     - 👥 Supportive Mentors
     - 🌱 Beginner Friendly
     - 📖 Course Content
     - ⚡ Live Market Sessions
     - 💬 Doubt Solving
     - ⭐ Overall Experience

2. **Screen 2: Review Selection**
   - 10 full-width clickable review cards for the selected category
   - Tap to select; blue highlight with checkmark on chosen review
   - Back arrow to return to categories

3. **Screen 3: Confirmation & Action**
   - Selected review displayed in a prominent card
   - Primary button: `[ Copy & Open Google Review ]`
   - Secondary button: `[ Choose Another Review ]`
   - Clipboard copy + `copied_at` timestamp recorded
   - Google Reviews opens in new tab + `redirected_at` timestamp recorded
   - Popup-blocker fallback with direct link

---

## 🖥 Admin Portal Screens

1. **Login** (`/admin/login`): Dhankranti-branded authentication card
2. **Dashboard** (`/admin/dashboard`): 4 metric cards (Active Shops, Categories, Templates, Sessions) + recent student review activity table
3. **Shops** (`/admin/shops`): Table with Open, QR, Edit, Deactivate actions + QR Modal with Download PNG, Print, Copy Link
4. **Categories** (`/admin/categories`): Table with Icon, Category, Description, Review Count, Status, Actions (toggle, edit, delete)
5. **Reviews** (`/admin/reviews`): Filterable by Shop, Category, Status + character counter `0 / 300` + toggle active/inactive
6. **Sessions** (`/admin/sessions`): Audit log showing Shop, Category, Selected Review, ✓ Selected, ✓ Copied, ✓ Opened, Time + detail modal

---

## 🧪 Testing

```bash
cd backend
python test_api.py
```

**16 test cases** verify:
- Health check
- Public shop review loading (8 categories, 80 reviews)
- Customer session initialization
- Selection, copy, and redirect timestamp tracking
- Review persistence (template never deleted after student selection)
- JWT authentication and unauthorized route blocking
- Authenticated CRUD operations (create/delete shop)
- Admin sessions audit list

---

## 📊 Seed Data Summary

| Entity | Count | Details |
|---|---|---|
| Admin | 1 | `admin@example.com` / `Admin@123` |
| Shop | 1 | Dhankranti Share Market Classes (slug: `dhankranti`) |
| Categories | 8 | Teaching Quality, Practical Learning, Supportive Mentors, Beginner Friendly, Course Content, Live Market Sessions, Doubt Solving, Overall Experience |
| Review Templates | 80 | 10 per category — realistic educational reviews mentioning Ram Sir, market concepts, candlestick patterns, risk management (no fake profit claims) |
| Google Review URL | — | Configured to exact Dhankranti Google Business listing |

---

## 🔒 Design Constraints

- **No AI/LLM generation** — all reviews are prewritten templates
- **No browser automation** — no Selenium, Playwright, or DOM injection on Google
- **No PostgreSQL** — SQLite only (`backend/data/review_app.db`)
- **No customer accounts** — anonymous session-based tracking only
- **No SMS/WhatsApp** — QR scan is the only entry point
- **Reviews are never deleted** globally when a student selects one; session-based tracking ensures unlimited reuse
- **Pure vanilla CSS** — no Tailwind dependency
