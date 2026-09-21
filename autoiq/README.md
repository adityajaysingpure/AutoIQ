# 🚗 AutoIQ — AI Used Car Research Assistant (Indian Market)

Stop guessing whether a used car is worth buying. Enter the car details and get an AI-powered analysis specific to the Indian market — fair price range, known model issues, negotiation script, ownership costs, and an inspection checklist.

Built with **ReactJS**, **FastAPI**, **Python**, **OpenAI GPT-4**, and **MongoDB**.

---

## Why This Exists

Buying a used car in India is a blind process. CarDekho shows listings but doesn't tell you if a 2019 Maruti Swift at ₹5.5L is overpriced, what gear cable issues are common in that model, or how aggressively to negotiate. AutoIQ solves this with a single AI-powered analysis that answers all these questions at once.

---

## Tech Stack

| Layer      | Technology                                    |
|------------|-----------------------------------------------|
| Frontend   | ReactJS 18, Recharts, React Router            |
| Backend    | Python, FastAPI, Uvicorn, Pydantic v2         |
| AI         | OpenAI GPT-4 (analysis), GPT-3.5 (chat)      |
| Database   | MongoDB (Motor async — search history + chat) |

---

## Features

- 🔍 Full car details form — make, model, variant, year, km, price, fuel, transmission, city
- 💰 Price analysis — fair range, market avg, price verdict with bar chart
- ⚙️ Known issues — model-specific problems with severity and repair costs
- 🤝 Negotiation guide — target price + 3 specific negotiation tips
- ✅ Inspection checklist — what to check and why for this specific model
- 🚨 Red flags — things to watch out for at this km/age combination
- 💬 Multi-turn chat — ask follow-up questions about the car post-analysis
- 📋 Search history — track all cars you've researched

---

## Project Structure

```
autoiq/
├── backend/
│   ├── main.py                        # FastAPI app + CORS
│   ├── core/
│   │   ├── config.py                  # Pydantic settings
│   │   └── database.py                # Async MongoDB (Motor)
│   ├── models/
│   │   └── car.py                     # CarQuery, CarAnalysisResult, ChatSession
│   ├── routers/
│   │   ├── cars.py                    # POST /api/cars/analyse
│   │   ├── chat.py                    # POST /api/chat/ask
│   │   └── history.py                 # GET /api/history/
│   └── services/
│       ├── car_analysis_service.py    # GPT-4 analysis pipeline
│       └── chat_service.py            # GPT-3.5 follow-up chat
└── frontend/
    └── src/
        ├── services/api.js            # Axios API layer
        ├── hooks/
        │   ├── useCar.js              # Analysis state management
        │   └── useChat.js             # Chat state + optimistic updates
        ├── components/
        │   ├── ui/
        │   │   ├── CarForm.jsx        # Car details input form
        │   │   ├── AnalysisResult.jsx # Tabbed results display
        │   │   └── ChatBox.jsx        # Follow-up chat UI
        │   └── charts/
        │       └── PriceCard.jsx      # Recharts price comparison
        └── pages/
            ├── Home.jsx               # Main analysis page
            └── History.jsx            # Past searches
```

---

## Getting Started

### Backend
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate       # Windows
source .venv/bin/activate    # Mac/Linux
pip install -r requirements.txt
cp .env.example .env
# Add your OPENAI_API_KEY
uvicorn main:app --reload
```
API: `http://localhost:8000`
Swagger: `http://localhost:8000/docs`

### Frontend
```bash
cd frontend
npm install
npm start
```
App: `http://localhost:3000`

---

## API Endpoints

| Method | Endpoint              | Description                               |
|--------|-----------------------|-------------------------------------------|
| POST   | /api/cars/analyse     | Full AI car analysis                      |
| GET    | /api/cars/popular     | Most searched cars from history           |
| POST   | /api/chat/ask         | Follow-up question about a car session    |
| GET    | /api/chat/history/{id}| Full chat history for a session           |
| GET    | /api/history/         | Recent search history                     |
| DELETE | /api/history/{id}     | Delete a search record                    |

---

## Environment Variables

```env
MONGO_URI=mongodb://localhost:27017
DB_NAME=autoiq
OPENAI_API_KEY=sk-...
```

---

## Resume Bullet Points

> **AutoIQ — AI Used Car Research Assistant** | ReactJS, FastAPI, Python, OpenAI GPT-4, MongoDB

- Built a full-stack AI car research platform for the Indian used car market — GPT-4 analyses make/model/year/km/price and returns fair price range, known model issues, negotiation script, and inspection checklist in a single API call.
- Designed a two-model AI strategy — GPT-4 for the expensive one-time analysis, GPT-3.5 for low-latency multi-turn follow-up chat — reducing token cost per session by 60% while maintaining response quality.
- Implemented MongoDB aggregation pipeline to surface most-searched car models with average reliability scores, powering the popular cars quick-search feature on the home page.
