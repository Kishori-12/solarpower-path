# ☀️ SolarWise — Smart Solar Decision Platform

> AI-powered solar advisory platform helping Indian homeowners and businesses make smarter solar energy decisions through intelligent recommendations, subsidy discovery, vendor comparison, solar savings calculation, and sustainability tracking.

---

## 🌍 Overview

SolarWise is a full-stack intelligent web platform designed to simplify solar adoption in India.

The platform enables users to:

- Estimate solar installation cost
- Calculate electricity savings and payback period
- Discover government subsidy schemes
- Compare verified solar vendors
- Track environmental impact
- Plan financing using EMI calculations
- Receive AI-powered recommendations

SolarWise combines **Machine Learning, cloud infrastructure, and modern web technologies** to deliver an end-to-end solar decision ecosystem.

---

# ✨ Features

## 🏠 Public User Platform

### ☀️ Solar Calculator
Calculate:
- Recommended solar capacity
- Installation cost
- Monthly and yearly savings
- Payback period

Inputs:
- Monthly electricity bill
- Roof area
- Location

---

### 🏛 Government Scheme Advisor
Discover:
- PM Surya Ghar Scheme
- MNRE Rooftop Solar
- State-level subsidies

Features:
- Eligibility prediction
- Subsidy estimation
- Scheme recommendation

---

### 🏢 Vendor Comparison
Compare verified vendors using:
- Price per kW
- Ratings
- Warranty
- Experience
- Service location

---

### 💳 EMI Calculator
Plan solar financing with:
- Loan amount
- Interest rate
- Duration
- EMI estimation

---

### 🌱 Carbon Tracker
Track:
- CO₂ reduction
- Trees equivalent
- Environmental contribution

---

### 🤖 AI Chatbot
Interactive assistant for:
- Solar guidance
- Cost estimation
- Savings insights
- Government schemes

---

### 🧹 Solar Panel Cleaning
Book:
- Cleaning services
- Service requests
- Appointment tracking

---

# 👥 Platform Modules

## User Module
- Register/Login
- Solar estimation
- Scheme recommendation
- Vendor recommendation
- Dashboard

---

## Vendor Portal (`/vendor`)
Features:
- JWT authentication
- Vendor registration
- Cloudinary document upload
- Approval workflow
- Profile management

Uploaded Documents:
- GST Certificate
- PAN
- License
- Business Proof

---

## Cleaner Portal (`/cleaner`)
Features:
- Registration
- Booking requests
- Approval workflow

---

## Admin Panel (`/admin`)
Features:
- User management
- Vendor approval
- Cleaner management
- Scheme CRUD
- Analytics dashboard

Analytics:
- User growth
- Vendor status
- Savings generated
- CO₂ reduction

---

# 🧠 Machine Learning Engine

SolarWise uses a hybrid architecture combining ML and rule-based decision systems.

## Models

```plaintext
backend/models/

vendor_recommendation_model.pkl
scheme_recommendation_model.pkl
location_encoder.pkl
```

---

## Vendor Recommendation

### Model
DecisionTreeRegressor

### Training Features
- Price
- Rating
- Warranty

### Runtime Recommendation Formula

score =
50% Budget Fit
+ 30% Rating
+ 20% Warranty

Budget categories:
- Economy
- Mid-range
- Premium

Data Source:
- Firestore Vendors
- Hardcoded fallback vendors

---

## Scheme Recommendation

### Model
DecisionTreeClassifier

### Features
- Location
- Budget
- Capacity

Runtime scheme selection:

| Condition | Recommendation |
|----------|---------------|
| ≤3kW | PM Surya Ghar |
| ≤10kW | MNRE Rooftop |
| Higher budget | National Solar Mission |
| Default | State Subsidy |

---

## Solar Calculation Engine

Rule-based financial and energy calculations.

### Assumptions

| Parameter | Value |
|----------|------|
| Cost/kW | ₹50,000 |
| Electricity | ₹8/unit |
| Efficiency | 80% |
| CO₂ | 0.82 kg/kWh |

Outputs:
- System size
- Cost
- Savings
- Payback
- Carbon offset

---

# 🏗 Architecture

```plaintext
Frontend (React + TS)
        ↓
REST APIs (Flask)
        ↓
Business Services
        ↓
ML Recommendation Engine
        ↓
Firebase Firestore
        ↓
Cloudinary Storage
```

---

# ⚙️ Tech Stack

## Frontend
- React 19
- TypeScript
- Vite 7
- TanStack Router
- TanStack Query
- Tailwind CSS v4
- shadcn/ui
- Radix UI
- Framer Motion
- Recharts
- Zustand

---

## Backend
- Python
- Flask 3
- Firebase Firestore
- Firebase Admin SDK
- Flask JWT Extended
- scikit-learn
- joblib
- Cloudinary
- Flask-CORS

---

# 📂 Project Structure

```plaintext
solarpower-path/

src/
├── components/
├── routes/
├── lib/
└── store/

backend/
├── routes/
├── services/
├── models/
├── app.py
└── requirements.txt
```

---

# 🔌 API Endpoints

| Method | Endpoint |
|---------|---------|
| POST | /auth/register |
| POST | /auth/login |
| POST | /auth/admin/login |
| POST | /calculate |
| GET | /vendor/list |
| POST | /vendor/register |
| POST | /recommend/vendor |
| POST | /recommend/scheme |
| GET | /admin/analytics |

---

# 🗄 Database

## Firebase Firestore Collections

```plaintext
users
vendors
documents
cleaners
schemes
calculations
```

---

# 🔐 Environment Variables

## Backend `.env`

```env
JWT_SECRET_KEY=

CLOUDINARY_CLOUD_NAME=

CLOUDINARY_API_KEY=

CLOUDINARY_API_SECRET=
```

Add:

```plaintext
firebase-service-account.json
```

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/Kishori-12/solarpower-path.git

cd solarpower-path
```

---

## Frontend

```bash
npm install

npm run dev
```

Frontend:
```
http://localhost:5173
```

---

## Backend

```bash
cd backend

pip install -r requirements.txt

python app.py
```

Backend:
```
http://localhost:5000
```

---

# 📈 Future Improvements

- Mobile application
- Real-time solar analytics
- IoT integration
- AI assistant enhancements
- GIS solar mapping
- Multi-language support

---

# 🤝 Contributors

Developed to promote smarter solar adoption and renewable energy awareness.

---

# 📄 License

This project is intended for educational and research purposes.
