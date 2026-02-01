# Shiv Furniture - Budget Accounting System

A comprehensive, full-stack Budget Accounting System designed for Shiv Furniture. This application manages master data, transactions, budgets, and provides a customer portal, built with a modern React frontend and a robust Node.js/Express backend.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+ recommended)
- npm (comes with Node.js)

### Installation & Setup

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <repository-url>
   cd Odoo-GCET-Finals
   ```

2. **Server Setup**:
   ```bash
   cd server
   npm install
   # Create .env file (see Configuration section below)
   cp .env.example .env 
   # Initialize and seed the database
   npm run init-db
   npm run seed
   ```

3. **Client Setup**:
   Open a new terminal.
   ```bash
   cd client
   npm install
   ```

### Running the Application

You need to run both the backend server and the frontend client simultaneously.

**Terminal 1 (Server):**
```bash
cd server
npm run dev
```
*Server runs on `http://localhost:5000`*

**Terminal 2 (Client):**
```bash
cd client
npm run dev
```
*Client runs on `http://localhost:5173` (or similar)*

---

## 🔑 Default Credentials

Use these credentials to log in after seeding the database:

- **Username**: `admin`
- **Password**: `admin123`

*> **IMPORTANT**: Please change these credentials after your first login for security.*

---

## 🛠️ Tech Stack

### Frontend (Client)
- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) (primitives), Lucide React (icons)
- **State Management & Data Fetching**: React Hooks, Axios
- **Validation**: [Zod](https://zod.dev/) + React Hook Form
- **Visualization**: [Recharts](https://recharts.org/)
- **Utilities**: Date-fns, jsPDF

### Backend (Server)
- **Runtime**: Node.js
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: SQLite3
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, Rate Limiting, Bcrypt
- **Logging**: Winston, Morgan
- **Utilities**: Multer (uploads), Nodemailer (email), Razorpay (payments)

---

## ✨ Key Features

- **Master Data Management**: contacts (Vendors/Customers), Products, Analytical Accounts, and Budgets.
- **Budget Monitoring**:
  - Real-time tracking of Budget vs. Actuals.
  - Achievement percentages and variance analysis.
  - Theoretical budget calculation based on time elapsed.
- **Transaction Processing**:
  - Purchase Orders & Vendor Bills.
  - Sales Orders & Customer Invoices.
  - Payment processing and reconciliation.
- **Auto Analytical Models**: 
  - Automated cost center assignment based on predefined rules (Product Categoy, Partner Tags).
- **Customer Portal**: 
  - Dedicated interface for customers to view invoices, orders, and payment history.
- **Reporting**: 
  - Detailed budget reports, sales analysis, and purchase summaries.

---

## 📂 Project Structure

```
Odoo-GCET-Finals/
├── client/                 # Frontend React Application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React Context (Auth, etc.)
│   │   ├── layouts/        # Page layouts (Admin, Portal)
│   │   ├── lib/            # Utilities, API setup, Types
│   │   ├── pages/          # Application views/routes
│   │   ├── transactions/   # Transaction-specific components
│   │   └── App.tsx         # Main App component
│   ├── vite.config.ts      # Vite configuration
│   └── tailwind.config.js  # Tailwind configuration
│
├── server/                 # Backend Express Application
│   ├── src/
│   │   ├── config/         # App configuration & DB connection
│   │   ├── controllers/    # Request handlers (Business Logic)
│   │   ├── middleware/     # Auth, Error handling, Validation
│   │   ├── models/         # Database models/queries
│   │   ├── routes/         # API Endpoint definitions
│   │   ├── services/       # Complex business services
│   │   └── utils/          # Helpers (Logger, Validator)
│   ├── database/           # SQL Schema and Seed scripts
│   ├── uploads/            # Directory for file uploads
│   └── server.js           # Server entry point
│
└── README.md               # Project Documentation
```

---

## ⚙️ Configuration (.env)

**Server (`server/.env`):**
```env
NODE_ENV=development
PORT=5000
DB_PATH=./database/shiv_furniture.db
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
```

---

## 📚 API Overview

The backend exposes a RESTful API. Key resource endpoints include:

| Resource | Endpoints | Description |
|----------|-----------|-------------|
| **Auth** | `/api/auth/*` | Login, Register, Portal Access |
| **Contacts** | `/api/contacts` | Manage Vendors and Customers |
| **Products** | `/api/products` | Manage Inventory Items |
| **Budgets** | `/api/budgets` | Create and Track Budgets |
| **Analytical** | `/api/analytical-accounts` | Cost Center Management |
| **Portal** | `/api/portal/*` | Customer facing data |

*For detailed API documentation, please refer to `server/README.md` or look at the route files in `server/src/routes/`.*

---

## 💾 Database Schema

The comprehensive SQL schema is located in `server/database/schema.sql`. It defines the relationships between:
- Users & Contacts
- Orders, Bills, & Invoices
- Payments & Allocations
- General Ledger (Journal Entries)
- Analytical Accounts & Budgets

---

## 📝 License

Proprietary software developed for Shiv Furniture.
