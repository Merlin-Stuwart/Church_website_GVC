# ✝ Grace Victory Church (GVC) - Official Web Platform

> **"A Place of Faith, Hope & Supernatural Victory in Christ"**  
> **"எப்பொழுதும் கிறிஸ்துவுக்குள் எங்களை வெற்றிபெறச் செய்கிற தேவனுக்கு ஸ்தோத்திரம்!"** (2 கொரிந்தியர் 2:14)

A world-class, modern, full-stack web application designed for **Grace Victory Church (GVC)**. Built with high performance, elegant typography, warm regal church aesthetics, and seamless responsiveness across all screen sizes (Mobile, Tablet, and Desktop).

---

## 🏛 Architecture & Tech Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | React 18 + Vite | Tailwind CSS, Lucide Icons, React Router DOM, Custom Gold & Navy Palette |
| **Backend** | Python 3 + FastAPI | High-speed Async REST API, Uvicorn, Automatic Swagger Documentation |
| **Database** | MongoDB | Motor (Async I/O) + PyMongo, with transparent fallback cache when MongoDB is offline |

---

## 📁 Project Structure

```
d:\Church Project\GVC website/
├── start-all.bat            # 1-Click launcher to start both Frontend & Backend
├── start-backend.bat        # Starts Python FastAPI server on http://localhost:8000
├── start-frontend.bat       # Starts React Vite frontend on http://localhost:3000
├── README.md                # Project documentation & setup instructions
│
├── frontend/                # React.js Frontend
│   ├── index.html           # Google Fonts (Cinzel, Plus Jakarta Sans) & Church Favicon
│   ├── vite.config.js       # Vite configuration with `/api` proxy to FastAPI backend
│   ├── tailwind.config.js   # Custom church color tokens (Gold, Royal Navy, Amber, Cream)
│   ├── package.json         # Node dependencies
│   ├── dist/                # Production build output
│   └── src/
│       ├── main.jsx         # App mounting point with BrowserRouter
│       ├── App.jsx          # Routes, Layout & global modals
│       ├── index.css        # Tailwind styles & gradients
│       ├── api/
│       │   └── client.js    # API service connecting to FastAPI backend
│       ├── components/
│       │   ├── Navbar.jsx           # Responsive sticky header with service notification
│       │   ├── Footer.jsx           # Church footer with timings, map & social links
│       │   ├── ServiceCountdown.jsx # Live countdown to upcoming Sunday Service
│       │   ├── PlanVisitModal.jsx   # VIP first-time guest registration modal
│       │   ├── PrayerModal.jsx      # Confidential / Community prayer request modal
│       │   └── SermonPlayerModal.jsx# Video & Audio player modal with scripture notes
│       ├── pages/
│       │   ├── Home.jsx             # Hero, Senior Pastor's Welcome, "I'm New Here", Sermons, Events, Prayer Wall teaser, Testimonies
│       │   ├── About.jsx            # 28-year history, Vision/Mission, Statement of Faith, Pastoral Team bios
│       │   ├── Ministries.jsx       # Kids, Youth, Women, Men, Worship, Missions + "Join a Serve Team" application form
│       │   ├── Sermons.jsx          # Searchable Sermon library with category & series filters
│       │   ├── Events.jsx           # Church events calendar with Free RSVP registration
│       │   ├── PrayerWall.jsx       # Interactive Community Prayer Wall ("I Prayed for This")
│       │   ├── Giving.jsx           # Online Giving, Official 80G tax receipt preview, UPI QR & Bank Wire info
│       │   ├── Contact.jsx          # Contact Form, Map directions & First-Time Visitor FAQ
│       │   └── AdminDashboard.jsx   # Church staff portal to manage Sermons, Events, Prayers & Giving
│       └── data/
│           └── mockData.js          # Authentic church data (Scriptures, pastors, ministries, seed sermons)
│
└── backend/                 # Python FastAPI Backend
    ├── requirements.txt     # Python dependencies (FastAPI, Uvicorn, Motor, Pydantic)
    ├── .env                 # Environment variables (Port, Host, MongoDB URL, Church Details)
    ├── .env.example         # Template for environment variables
    ├── run.py               # Server startup entrypoint
    └── app/
        ├── __init__.py
        ├── main.py          # FastAPI application, CORS, Lifespan startup
        ├── config.py        # Centralized settings & environment loader
        ├── database.py      # Async MongoDB connector (Motor) with fallback storage
        ├── seed_data.py     # Initial sermons, events, and prayer seeds
        ├── schemas/
        │   ├── sermon.py    # Pydantic validation schemas for sermons
        │   ├── event.py     # Pydantic validation schemas for events & RSVPs
        │   ├── prayer.py    # Pydantic validation schemas for prayer requests
        │   ├── contact.py   # Pydantic schemas for contact & Plan-a-Visit submissions
        │   └── donation.py  # Pydantic schemas for donations & 80G receipts
        └── routers/
            ├── sermons.py   # GET, POST, PUT, DELETE /api/sermons
            ├── events.py    # GET, POST, PUT, DELETE /api/events, POST /rsvp
            ├── prayers.py   # GET, POST /api/prayers, POST /api/prayers/{id}/pray
            ├── contact.py   # POST /api/contact, POST /api/contact/plan-visit
            └── donations.py # POST /api/donations, GET /details, GET /all
```

---

## 🚀 How to Run the Website

### Option 1: Quick 1-Click Launch (Windows)
Double-click `start-all.bat` in the root folder. It will automatically launch both the Backend server and Frontend dev server!

### Option 2: Running Manually

#### Step 1: Start Backend (FastAPI)
```powershell
cd backend
.\venv\Scripts\activate
python run.py
```
- API Server runs at: **http://localhost:8000**
- Interactive Swagger API Docs: **http://localhost:8000/docs**

#### Step 2: Start Frontend (React + Vite)
Open a new terminal window:
```powershell
cd frontend
npm run dev
```
- Open your browser at: **http://localhost:3000**

---

## 🗄 MongoDB Database Configuration

The backend connects to MongoDB via `backend/.env`:
```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=grace_victory_church
```

> **Note on MongoDB**: If you don't have MongoDB installed locally yet, **no problem!** The backend automatically detects when MongoDB is offline and seamlessly uses built-in in-memory storage with pre-populated seed data so all features work immediately. As soon as you install MongoDB or paste a MongoDB Atlas Cloud URL (`mongodb+srv://...`) into `backend/.env`, the system will automatically connect directly to MongoDB!

---

## ✨ Key Features Implemented

1. **Regal Church Aesthetics & Branding**:
   - Distinctive Grace Victory Church cross emblem, royal midnight blue (`#0B192C`) and gold accents (`#D4AF37`).
   - Bilingual support accents (Tamil & English) for verses, services, and sermon titles.
2. **Interactive Sunday Service Countdown**:
   - Live ticking countdown to the next Sunday worship service (09:30 AM – 11:30 AM).
   - Turns into a live animated "SERVICE IS IN PROGRESS NOW" banner on Sunday mornings!
3. **VIP "Plan Your Visit" Experience**:
   - First-time guests can schedule their Sunday visit in advance with adult and kids count, reserved seating, and welcoming instructions.
4. **Sermon Library & Media Player**:
   - Search by preacher, title, scripture, or filter by series.
   - Built-in video and audio podcast player modal with scripture notes and one-click share links.
5. **Interactive Community Prayer Wall**:
   - Believers can submit prayer requests (public or private to pastoral staff).
   - Other church members can click **"I Prayed for This"** to uplift one another.
6. **Online Tithes, Offerings & Building Fund**:
   - Giving calculator with instant receipt generator (Section 80G tax benefit ready).
   - Direct UPI QR Code and Copyable Bank Account (SBI) details for NEFT/RTGS.
7. **Ministries & "Serve on a Team" Form**:
   - Kids (GVC Champions), Youth (Ignite), Women of Worth, Men of Honor, Worship & Creative Arts, Village Missions.
   - Integrated volunteer registration form.
8. **Staff Admin Portal (`/admin`)**:
   - Easily publish new sermons, schedule church events, review prayer requests, and monitor giving records.
