<div align="center">

# 💸 TranSactly AI

### AI-Powered Personal Finance Assistant for Android

[![React Native](https://img.shields.io/badge/React_Native-TypeScript-3178C6?style=for-the-badge&logo=react)](https://reactnative.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-316192?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-Powered-4285F4?style=for-the-badge&logo=google)](https://deepmind.google/technologies/gemini/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

> **Automatically reads your banking SMS → extracts transactions → categorizes spending → and lets you chat with AI about your money.**

[Features](#-features) • [Architecture](#-system-architecture) • [Installation](#-installation) • [API Docs](#-api-endpoints) • [Contributing](#-contributing)

</div>

---

## 📌 Problem Statement

Most Indians receive 10–30 banking SMS messages every week — UPI alerts, bank debits, credit card charges. Yet virtually no tool reads them automatically, categorizes them intelligently, and gives users a clear picture of where their money actually goes.

Manual expense tracking apps require you to log every transaction yourself. Bank apps show raw statements with no intelligence. Budgeting tools require bank integrations that most Indian banks don't support.

**TranSactly AI solves this by going directly to the source — your SMS inbox — and doing all the heavy lifting automatically.**

---

## ✨ Features

### 📲 SMS Transaction Detection
- Automatically reads banking SMS messages from your Android device
- Filters out spam, OTPs, promotions, and failed transactions
- Extracts **amount**, **merchant**, **transaction type**, and **date** with high accuracy

### 🧠 7-Layer AI Categorization Engine
| Layer | Method | Description |
|-------|---------|-------------|
| 1 | Income Detection Rules | Rule-based detection for salary, cashback, refunds |
| 2 | Merchant Priors | Known merchant → category mapping database |
| 3 | Keyword Classification | Fast keyword matching for common patterns |
| 4 | Database Memory | Learns from your past categorizations |
| 5 | Person Transfer Detection | Detects UPI person-to-person transfers |
| 6 | Semantic AI | Sentence Transformers for contextual understanding |
| 7 | Gemini Fallback | Gemini AI handles anything the pipeline can't classify |

### 📊 Dashboard Analytics
- **Income vs Expenses vs Savings** overview
- **Savings Rate** calculation
- **Top Spending Categories** with breakdowns
- **Top Merchants** by spend volume
- **Full Transaction History** with search
- **Date Range Filtering** (weekly, monthly, custom)

### 💬 AI Financial Chat
Ask natural language questions about your finances:
- *"How much did I spend on food this month?"*
- *"What's my biggest expense category?"*
- *"Show me all Swiggy transactions in June"*
- *"Am I saving more than last month?"*

### 🔒 Smart Protection Features
- **Duplicate Transaction Protection** — never counts the same SMS twice
- **Merchant Memory Learning** — improves categorization accuracy over time
- **Historical Storage** — full transaction archive with analytics

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     ANDROID DEVICE                          │
│                                                             │
│   ┌─────────────┐     ┌──────────────┐    ┌─────────────┐  │
│   │  SMS Inbox  │────▶│ React Native │────▶│  API Layer  │  │
│   │  (Banking)  │     │   Frontend   │    │  (FastAPI)  │  │
│   └─────────────┘     └──────────────┘    └──────┬──────┘  │
└──────────────────────────────────────────────────│──────────┘
                                                   │
                    ┌──────────────────────────────▼──────────────────────────────┐
                    │                     BACKEND SERVICES                        │
                    │                                                             │
                    │  ┌─────────────┐   ┌──────────────┐   ┌─────────────────┐ │
                    │  │SMS Processor│──▶│  Decision    │──▶│ Categorization  │ │
                    │  │  Service    │   │   Engine     │   │    Engine       │ │
                    │  └─────────────┘   └──────────────┘   └────────┬────────┘ │
                    │                                                 │          │
                    │  ┌─────────────┐   ┌──────────────┐            │          │
                    │  │  Analytics  │   │   AI Chat    │            ▼          │
                    │  │  Service    │   │   Service    │   ┌─────────────────┐ │
                    │  └──────┬──────┘   └──────┬───────┘   │  Gemini AI /   │ │
                    │         │                 │            │  Sentence      │ │
                    │         └────────┬────────┘            │  Transformers  │ │
                    │                  ▼                      └────────────────┘ │
                    │         ┌────────────────┐                                 │
                    │         │   PostgreSQL   │                                 │
                    │         │   + SQLAlchemy │                                 │
                    │         └────────────────┘                                 │
                    └─────────────────────────────────────────────────────────────┘
```

---

## 🔄 SMS Processing Pipeline

```
Raw SMS Received
      │
      ▼
┌─────────────────┐
│  Filter Layer   │  ──── Removes OTPs, spam, promotions, failed txns
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Parser Layer   │  ──── Extracts amount, merchant, date, txn type
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Duplicate Check │  ──── Hash-based deduplication against DB
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Categorization │  ──── 7-layer AI pipeline (see above)
│     Engine      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Database Store │  ──── Persist to PostgreSQL via SQLAlchemy
└────────┬────────┘
         │
         ▼
  Dashboard Update
```

---

## 🧠 AI Categorization Engine — Deep Dive

The categorization engine runs each transaction through 7 sequential layers, stopping as soon as a layer returns a confident result:

```python
def categorize(transaction):
    # Layer 1 — Fast rule-based income detection
    if income_rules.match(transaction):       return "Income"

    # Layer 2 — Known merchant lookup
    if merchant_priors.lookup(transaction):   return merchant_priors.category

    # Layer 3 — Keyword classification
    if keyword_engine.match(transaction):     return keyword_engine.category

    # Layer 4 — Learn from your own history
    if db_memory.has_seen(transaction):       return db_memory.past_category

    # Layer 5 — Person transfer (UPI P2P)
    if transfer_detector.is_person(transaction): return "Transfer"

    # Layer 6 — Semantic similarity via Sentence Transformers
    if semantic_engine.confidence > 0.85:    return semantic_engine.category

    # Layer 7 — Gemini AI fallback (handles everything else)
    return gemini.classify(transaction)
```

**Supported Categories:**
`Food` • `Shopping` • `Travel` • `Entertainment` • `Utilities` • `Education` • `Healthcare` • `Income` • `Transfer`

---

## 🛠 Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Mobile Frontend | React Native (TypeScript) | Android application |
| UI Framework | Expo Go | Development & build tooling |
| Backend API | FastAPI (Python) | REST API server |
| ORM | SQLAlchemy | Database abstraction layer |
| Database | PostgreSQL | Transaction & user data storage |
| AI — Semantic | Sentence Transformers | Contextual text classification |
| AI — Fallback | Gemini AI (Google) | LLM-based categorization & chat |
| Validation | Pydantic | Request/response schema validation |
| SMS Access | Android SMS Permissions API | Native SMS inbox reading |

---

## 📁 Project Structure

```
transactly-ai/
│
├── backend/                        # FastAPI Python backend
│   ├── main.py                     # App entry point & router registration
│   ├── database.py                 # SQLAlchemy engine & session
│   ├── models.py                   # Database ORM models
│   ├── schemas.py                  # Pydantic request/response schemas
│   │
│   ├── services/
│   │   ├── sms_processor.py        # SMS parsing & filtering
│   │   ├── decision_engine.py      # Transaction validation logic
│   │   ├── categorization/
│   │   │   ├── engine.py           # Main categorization orchestrator
│   │   │   ├── income_rules.py     # Layer 1 — income detection
│   │   │   ├── merchant_priors.py  # Layer 2 — merchant lookup
│   │   │   ├── keyword_engine.py   # Layer 3 — keyword matching
│   │   │   ├── db_memory.py        # Layer 4 — history learning
│   │   │   ├── transfer_detector.py# Layer 5 — P2P detection
│   │   │   ├── semantic_engine.py  # Layer 6 — sentence transformers
│   │   │   └── gemini_fallback.py  # Layer 7 — Gemini AI
│   │   ├── analytics_service.py    # Dashboard aggregation logic
│   │   └── chat_service.py         # AI financial chat handler
│   │
│   ├── routers/
│   │   ├── transactions.py         # Transaction CRUD endpoints
│   │   ├── analytics.py            # Dashboard data endpoints
│   │   └── chat.py                 # AI chat endpoints
│   │
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/                       # React Native TypeScript app
│   ├── App.tsx                     # Root component & navigation
│   ├── src/
│   │   ├── screens/
│   │   │   ├── DashboardScreen.tsx
│   │   │   ├── TransactionScreen.tsx
│   │   │   ├── ChatScreen.tsx
│   │   │   └── SettingsScreen.tsx
│   │   │
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   │   ├── SummaryCard.tsx
│   │   │   │   ├── CategoryChart.tsx
│   │   │   │   └── MerchantList.tsx
│   │   │   ├── transactions/
│   │   │   │   ├── TransactionCard.tsx
│   │   │   │   └── DateRangeFilter.tsx
│   │   │   └── chat/
│   │   │       ├── ChatBubble.tsx
│   │   │       └── ChatInput.tsx
│   │   │
│   │   ├── services/
│   │   │   ├── api.ts              # Axios base config
│   │   │   ├── smsReader.ts        # Android SMS permission & read
│   │   │   ├── transactionService.ts
│   │   │   ├── analyticsService.ts
│   │   │   └── chatService.ts
│   │   │
│   │   └── types/
│   │       └── index.ts            # Shared TypeScript interfaces
│   │
│   ├── package.json
│   └── .env.example
│
├── README.md
└── LICENSE
```

---

## 📡 API Endpoints

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/transactions/process-sms` | Process batch of raw SMS messages |
| `GET` | `/api/transactions/` | Get all transactions (with filters) |
| `GET` | `/api/transactions/{id}` | Get single transaction |
| `PATCH` | `/api/transactions/{id}/category` | Manually update category |
| `DELETE` | `/api/transactions/{id}` | Delete a transaction |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/analytics/summary` | Income, expenses, savings overview |
| `GET` | `/api/analytics/categories` | Spending by category |
| `GET` | `/api/analytics/merchants` | Top merchants by spend |
| `GET` | `/api/analytics/trends` | Month-over-month trends |

### AI Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat/message` | Send a finance question, get AI response |
| `GET` | `/api/chat/history` | Get past chat messages |

> All endpoints accept `?from_date=YYYY-MM-DD&to_date=YYYY-MM-DD` query params for date filtering.

---

## 🚀 Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+
- Android device or emulator (API level 23+)
- Google Gemini API key

---

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/transactly-ai.git
cd transactly-ai
```

---

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment variables
cp .env.example .env
# → Fill in your values (see Environment Variables section)

# Run database migrations
python -m alembic upgrade head

# Start the backend server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

---

### 3. Database Setup

```bash
# Login to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE transactly;
CREATE USER transactly_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE transactly TO transactly_user;
\q
```

Update your `.env` with the connection string:
```
DATABASE_URL=postgresql://transactly_user:your_password@localhost:5432/transactly
```

---

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# → Set your backend URL

# Start Expo development server
npx expo start

# Scan QR code with Expo Go app on your Android device
# OR press 'a' to open Android emulator
```

---

## 🔐 Environment Variables

### Backend (`backend/.env`)
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/transactly

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# App Config
SECRET_KEY=your_secret_key_here
DEBUG=True
ALLOWED_ORIGINS=http://localhost:8081
```

### Frontend (`frontend/.env`)
```env
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:8000
```

> ⚠️ Use your machine's **local IP address** (e.g. `192.168.1.5`), not `localhost`, when connecting a physical Android device.

---

## 📸 Screenshots

| Dashboard | Transactions | AI Chat |
|-----------|-------------|---------|
| ![Dashboard](screenshots/dashboard.png) | ![Transactions](screenshots/transactions.png) | ![Chat](screenshots/chat.png) |

> 📁 Add screenshots to a `/screenshots` folder in the root directory.

---

## 🔮 Future Enhancements

- [ ] **iOS Support** — Extend SMS reading to iOS (via alternate data sources)
- [ ] **Budget Goals** — Set monthly spending limits per category with alerts
- [ ] **Bill Detection** — Identify recurring bills and subscription charges
- [ ] **Export to CSV/PDF** — Download transaction history reports
- [ ] **Multi-account Support** — Handle transactions across multiple bank accounts
- [ ] **Voice Queries** — Ask financial questions via voice input
- [ ] **WhatsApp Integration** — Parse transaction notifications from WhatsApp
- [ ] **Shared Expenses** — Split and track expenses with contacts

---

## 🔒 Security & Privacy

- **All data stays on-device or your own server** — no third-party data storage
- SMS data is processed locally and never sent to external servers except for Gemini AI categorization (merchant name + amount only — no personal identifiers)
- PostgreSQL database should be run locally or on a private server you control
- API keys are stored in `.env` files and never committed to version control
- Android SMS permissions are requested at runtime and can be revoked at any time

> **TranSactly AI is designed as a self-hosted, privacy-first application.**

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

```bash
# 1. Fork the repository
# 2. Create your feature branch
git checkout -b feature/your-feature-name

# 3. Make your changes and commit
git commit -m "feat: add your feature description"

# 4. Push to your fork
git push origin feature/your-feature-name

# 5. Open a Pull Request
```

### Contribution Guidelines
- Follow existing code style and naming conventions
- Write clear commit messages using [Conventional Commits](https://www.conventionalcommits.org/)
- Add comments for complex logic, especially in the categorization engine
- Test your changes on a physical Android device before submitting a PR
- Update this README if you add new features or change setup steps

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Built with ❤️ by [Laukik Waikar](https://github.com/yourusername)

⭐ Star this repo if you found it useful!

</div>
