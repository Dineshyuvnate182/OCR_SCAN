# 📄 LedgerScan — OCR to Excel AI Platform

LedgerScan is a full-stack web application that extracts text from images and PDFs using PaddleOCR, analyzes the data with AI, and generates structured Excel files — all from a beautiful, industry-standard UI.

---

## 🏗️ Project Architecture

```
LedgerScan/
├── frontend/          # React + Vite (UI)
├── backend/           # Node.js + Express + MongoDB (API)
├── python-service/    # Python + PaddleOCR (OCR Engine)
├── docker-compose.yml
└── README.md
```

---

## ✨ Features

- 📤 Upload Image / PDF / Image-PDF
- 🔍 PaddleOCR text extraction (multi-page support)
- 🤖 AI-powered data pattern analysis (Claude API)
- 📊 Auto-generate structured Excel files
- 🔐 Auth: Register / Login / JWT
- 🌐 Landing page with features, slider, testimonials
- 📬 Contact form
- 📁 Download Excel from dashboard

---

## 🛠️ Tech Stack

| Layer        | Technology                        |
|--------------|-----------------------------------|
| Frontend     | React 18, Vite, Tailwind CSS      |
| Backend      | Node.js, Express, MongoDB, Mongoose |
| OCR Engine   | Python, PaddleOCR, pdf2image      |
| AI Analysis  | Anthropic Claude API              |
| Excel Gen    | exceljs (Node.js)                 |
| Auth         | JWT, bcrypt                       |
| File Upload  | Multer                            |

---

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/yourname/LedgerScan.git
cd LedgerScan
```

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env   # Fill in your values
npm run dev
```

### 3. Setup Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### 4. Setup Python OCR Service
```bash
cd python-service
pip install -r requirements.txt
cp .env.example .env
python main.py
```

### 5. Or use Docker Compose
```bash
docker-compose up --build
```

---

## 🌍 Environment Variables

### Backend `.env`
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/ledgerscan
JWT_SECRET=your_jwt_secret
ANTHROPIC_API_KEY=your_claude_api_key
PYTHON_SERVICE_URL=http://localhost:8000
```

### Frontend `.env`
```
VITE_API_URL=http://localhost:5000/api
```

### Python Service `.env`
```
PORT=8000
```

---

## 📂 Folder Structure Details

```
frontend/src/
├── components/
│   ├── Navbar/          # Top navigation with auth links
│   ├── Footer/          # Footer with contact & links
│   ├── Landing/         # Home page sections
│   │   ├── HeroSection.jsx
│   │   ├── FeaturesSection.jsx
│   │   ├── HowItWorks.jsx
│   │   ├── Testimonials.jsx
│   │   └── CTASection.jsx
│   ├── Auth/            # Login & Register forms
│   ├── Dashboard/       # User dashboard + results
│   ├── Upload/          # File upload UI + preview
│   ├── Contact/         # Contact form page
│   └── About/           # About page
├── pages/               # Route-level page wrappers
├── context/             # Auth & Upload React Contexts
├── hooks/               # Custom hooks
└── utils/               # API helpers

backend/
├── config/              # DB & Multer config
├── models/              # Mongoose schemas
│   ├── User.js
│   ├── Upload.js
│   └── Result.js
├── routes/              # Express routers
├── controllers/         # Business logic
├── middleware/          # Auth & error handling
└── utils/
    ├── excelGenerator.js   # exceljs Excel creation
    └── aiAnalyzer.js       # Claude API integration

python-service/
├── ocr/
│   ├── image_ocr.py     # PaddleOCR on images
│   ├── pdf_ocr.py       # PDF → image → OCR
│   └── extractor.py     # Unified extractor
└── utils/
    ├── file_handler.py
    └── response_formatter.py
```

---

## 📡 API Endpoints

### Auth
| Method | Endpoint            | Description        |
|--------|---------------------|--------------------|
| POST   | /api/auth/register  | Register user      |
| POST   | /api/auth/login     | Login + JWT token  |
| GET    | /api/auth/me        | Get current user   |

### Upload & OCR
| Method | Endpoint            | Description               |
|--------|---------------------|---------------------------|
| POST   | /api/upload         | Upload file, trigger OCR  |
| GET    | /api/upload/history | User upload history       |

### Results
| Method | Endpoint            | Description               |
|--------|---------------------|---------------------------|
| GET    | /api/result/:id     | Get result by upload ID   |
| GET    | /api/result/excel/:id | Download Excel file     |

### Contact
| Method | Endpoint            | Description        |
|--------|---------------------|--------------------|
| POST   | /api/contact        | Submit contact form|

---

## 🎨 Design System

- **Theme**: Light UI with bright accent colors
- **Primary**: `#4F8EF7` (bright blue)
- **Accent**: `#FF6B35` (vibrant orange)
- **Background**: `#FAFBFF`
- **Font**: Outfit (display) + DM Sans (body)
- **Animations**: Framer Motion slide-ins, fade-ups

---

## 📄 License
MIT — Free to use and modify.
