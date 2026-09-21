# 🚗 AutoIQ — AI-Powered Used Car Research Assistant

> **Make smarter used-car decisions with AI.**

AutoIQ is an AI-powered used-car research assistant built specifically for the **Indian automotive market**. Enter a car's details and get a comprehensive analysis covering **fair market price, known model issues, negotiation strategy, ownership risks, and a personalized inspection checklist** — all in one place.

---

## 📌 Why AutoIQ?

Buying a used car in India often involves researching multiple websites, checking scattered reviews, estimating a fair price, and figuring out what to inspect.

AutoIQ brings these steps together into a single AI-powered workflow.

For example, instead of simply seeing that a **2019 Maruti Swift is listed for ₹5.5L**, AutoIQ can help answer:

* 💰 Is the asking price reasonable?
* ⚙️ What common issues should I look for in this model?
* 🔧 What repairs could potentially be expensive?
* 🤝 What price should I negotiate toward?
* 🔍 What should I inspect before buying?
* 🚨 Are there any red flags based on the car's age and mileage?

---

## ✨ Key Features

### 🔍 Comprehensive Car Analysis

Enter detailed vehicle information including:

* Make & Model
* Variant
* Manufacturing/Registration Year
* Kilometres Driven
* Asking Price
* Fuel Type
* Transmission
* City

AutoIQ generates a model-specific analysis using AI.

### 💰 Price Analysis

Get a structured assessment of the asking price:

* Estimated fair price range
* Approximate market average
* Asking price comparison
* Price verdict
* Visual price comparison chart

### ⚙️ Known Model Issues

Identify potential model-specific problems with:

* Issue description
* Severity
* Expected repair cost
* Relevant inspection points

### 🤝 Negotiation Guide

Get a practical negotiation strategy including:

* Recommended target price
* Key negotiation points
* Specific reasons to negotiate
* Model/condition-based talking points

### ✅ Personalized Inspection Checklist

Receive a checklist tailored to the selected vehicle, covering areas such as:

* Engine & transmission
* Suspension
* Brakes
* Electrical systems
* Tyres
* Exterior/interior
* Service history
* Accident or repair indicators

### 🚨 Red Flag Detection

Highlights potential concerns based on factors such as:

* Vehicle age
* Mileage
* Asking price
* Model-specific issues
* Ownership/maintenance considerations

### 💬 AI Follow-Up Chat

Continue the conversation after the initial analysis.

Ask questions such as:

> "Is this a good price if I negotiate to ₹4.8L?"

> "What should I check during the test drive?"

> "How much could the suspension repair cost?"

### 📋 Search History

MongoDB stores previous research sessions so users can:

* Review previous analyses
* Revisit researched cars
* Delete old searches
* Quickly compare frequently researched models

---

## 🛠️ Tech Stack

| Layer           | Technology                            |
| --------------- | ------------------------------------- |
| Frontend        | ReactJS 18, React Router, Recharts    |
| Backend         | Python, FastAPI, Uvicorn, Pydantic v2 |
| AI              | OpenAI GPT-4, GPT-3.5                 |
| Database        | MongoDB                               |
| Database Driver | Motor (Async MongoDB)                 |
| API Client      | Axios                                 |

---

## 🏗️ Architecture

```text
┌───────────────────────┐
│      ReactJS UI       │
│                       │
│ Car Form              │
│ Analysis Dashboard    │
│ Price Charts          │
│ AI Chat               │
│ Search History        │
└───────────┬───────────┘
            │
            │ REST API
            ▼
┌───────────────────────┐
│      FastAPI          │
│                       │
│ Cars Router           │
│ Chat Router           │
│ History Router        │
└───────────┬───────────┘
            │
      ┌─────┴─────┐
      ▼           ▼
┌───────────┐ ┌──────────────┐
│  OpenAI   │ │   MongoDB    │
│    API    │ │              │
│           │ │ Search Data  │
│ Analysis  │ │ Chat History │
│ + Chat    │ │              │
└───────────┘ └──────────────┘
```

---

## 📁 Project Structure

```text
autoiq/
│
├── backend/
│   ├── main.py
│   │
│   ├── core/
│   │   ├── config.py
│   │   └── database.py
│   │
│   ├── models/
│   │   └── car.py
│   │
│   ├── routers/
│   │   ├── cars.py
│   │   ├── chat.py
│   │   └── history.py
│   │
│   └── services/
│       ├── car_analysis_service.py
│       └── chat_service.py
│
└── frontend/
    └── src/
        ├── services/
        │   └── api.js
        │
        ├── hooks/
        │   ├── useCar.js
        │   └── useChat.js
        │
        ├── components/
        │   ├── ui/
        │   │   ├── CarForm.jsx
        │   │   ├── AnalysisResult.jsx
        │   │   └── ChatBox.jsx
        │   │
        │   └── charts/
        │       └── PriceCard.jsx
        │
        └── pages/
            ├── Home.jsx
            └── History.jsx
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

* Python 3.10+
* Node.js 18+
* MongoDB
* OpenAI API key

---

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd autoiq
```

---

### 2. Setup Backend

```bash
cd backend

python -m venv .venv
```

#### Windows

```bash
.venv\Scripts\activate
```

#### macOS / Linux

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create your environment file:

```bash
cp .env.example .env
```

Configure your environment variables:

```env
MONGO_URI=mongodb://localhost:27017
DB_NAME=autoiq
OPENAI_API_KEY=your_openai_api_key
```

Start the FastAPI server:

```bash
uvicorn main:app --reload
```

Backend:

```text
http://localhost:8000
```

Swagger API Documentation:

```text
http://localhost:8000/docs
```

---

### 3. Setup Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm start
```

Frontend:

```text
http://localhost:3000
```

---

## 🔌 API Endpoints

| Method   | Endpoint                 | Description                          |
| -------- | ------------------------ | ------------------------------------ |
| `POST`   | `/api/cars/analyse`      | Generate complete AI car analysis    |
| `GET`    | `/api/cars/popular`      | Get frequently researched car models |
| `POST`   | `/api/chat/ask`          | Ask a follow-up question about a car |
| `GET`    | `/api/chat/history/{id}` | Retrieve chat history                |
| `GET`    | `/api/history/`          | Retrieve recent searches             |
| `DELETE` | `/api/history/{id}`      | Delete a search record               |

---

## 🤖 AI Workflow

AutoIQ separates the **initial deep analysis** from **follow-up conversations**.

### Initial Analysis

```text
Car Details
     ↓
FastAPI
     ↓
AI Analysis Service
     ↓
OpenAI GPT Model
     ↓
Structured Car Analysis
     ↓
MongoDB
     ↓
React Dashboard
```

The analysis produces structured information including:

* Price assessment
* Market range
* Known issues
* Repair estimates
* Negotiation strategy
* Inspection checklist
* Red flags

### Follow-Up Chat

```text
User Question
     ↓
FastAPI
     ↓
Chat Service
     ↓
AI Model + Conversation Context
     ↓
Response
     ↓
React Chat UI
```

This allows users to continue researching the same vehicle without running the complete analysis again.

---

## 💡 Engineering Highlights

* Built a **full-stack React + FastAPI application** with RESTful API architecture.
* Implemented **structured AI responses** for consistent frontend rendering.
* Used **Pydantic models** for request/response validation.
* Implemented **asynchronous MongoDB operations** using Motor.
* Designed separate services for **AI analysis and conversational chat**.
* Added **multi-turn conversation support** with persisted chat history.
* Implemented MongoDB aggregation for **popular car/model analytics**.
* Built interactive price visualizations using **Recharts**.
* Added reusable React hooks for analysis and chat state management.
* Separated frontend API communication into a dedicated Axios service layer.

---

## 📊 Example Analysis

### Input

```text
Make: Maruti Suzuki
Model: Swift
Variant: ZXi
Year: 2019
Mileage: 58,000 km
Fuel: Petrol
Transmission: Manual
Asking Price: ₹5.5 Lakh
City: Pune
```

### AutoIQ Analysis

```text
💰 Fair Price Range
₹4.8L — ₹5.3L

📊 Asking Price
₹5.5L

⚠️ Price Difference
Above estimated fair range

🔧 Potential Issues
• Clutch wear
• Suspension components
• AC performance
• Brake wear

🤝 Negotiation Target
Use vehicle condition, service history,
and identified maintenance items as
negotiation points.

🔍 Inspection
• Check clutch bite point
• Inspect suspension noise
• Verify service records
• Inspect tyres
• Check accident/paint history
```

> **Note:** AI-generated price estimates and repair costs are informational and should be validated against current listings, service records, and a professional vehicle inspection.

---

## 🔮 Future Improvements

* [ ] Live used-car listing price comparison
* [ ] Integration with Indian automotive listing platforms
* [ ] RTO/vehicle-history integration
* [ ] VIN-based vehicle history lookup
* [ ] Image-based vehicle damage detection
* [ ] Service-cost estimation by city
* [ ] Ownership cost calculator
* [ ] Insurance and resale value estimation
* [ ] Car-to-car comparison
* [ ] User authentication
* [ ] PDF report generation
* [ ] Mobile-responsive PWA
* [ ] AI-powered test-drive analysis

---

## 🎯 Project Goal

AutoIQ aims to turn fragmented used-car research into a **single, structured decision-support workflow** for Indian buyers.

Instead of asking:

> **"Is this used car worth ₹X?"**

AutoIQ helps users understand:

> **"What is this car likely worth, what could go wrong, what should I inspect, and how should I approach the negotiation?"**

---

## 👨‍💻 Resume Description

**AutoIQ — AI-Powered Used Car Research Assistant**
*ReactJS · FastAPI · Python · OpenAI · MongoDB*

* Built a full-stack AI-powered used-car research platform for the Indian market, generating structured analysis for **fair pricing, model-specific issues, negotiation strategy, inspection points, and ownership risks**.
* Designed an AI analysis and conversational architecture using **FastAPI, OpenAI APIs, Pydantic, and MongoDB**, with persisted search and multi-turn chat sessions.
* Implemented **MongoDB aggregation pipelines** to identify frequently researched car models and surface search insights through the React dashboard.
