# Shiv Furniture - Budget Accounting System Backend

A comprehensive Budget Accounting System for Shiv Furniture built with Node.js, Express, and SQLite.

## Features

- **Master Data Management**: Contacts, Products, Analytical Accounts, Budgets
- **Transaction Processing**: Purchase Orders, Vendor Bills, Sales Orders, Customer Invoices, Payments
- **Budget Monitoring**: Real-time budget vs actual tracking, achievement percentage, variance analysis
- **Auto Analytical Models**: Automatic cost center assignment based on configurable rules
- **Customer Portal**: Self-service portal for viewing invoices, bills, orders, and making payments
- **Budget Revisions**: Track budget changes over time with revision history
- **Payment Reconciliation**: Automatic payment status updates and reconciliation
- **Comprehensive Reporting**: Budget reports, payment status, sales, and purchase reports

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite3
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **File Uploads**: Multer
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate Limiting

## Directory Structure

```
server/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Data models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   └── utils/           # Utility functions
├── database/            # Database schema and seeds
├── uploads/             # File uploads
├── logs/                # Application logs
└── server.js            # Entry point
```

## Installation

1. Clone the repository and navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Edit `.env` with your configuration:
```env
NODE_ENV=development
PORT=5000
DB_PATH=./database/shiv_furniture.db
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

5. Initialize database and seed data:
```bash
npm run init-db
npm run seed
```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on http://localhost:5000

## Default Credentials

After seeding the database:
- **Username**: admin
- **Password**: admin123

**IMPORTANT**: Change the default password after first login!

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new admin user
- `POST /api/auth/login` - Admin login
- `POST /api/auth/portal/login` - Portal user login
- `POST /api/auth/portal/create` - Create portal access
- `GET /api/auth/profile` - Get user profile

### Contacts
- `POST /api/contacts` - Create contact
- `GET /api/contacts` - List contacts (with filters)
- `GET /api/contacts/:id` - Get contact by ID
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id/archive` - Archive contact
- `POST /api/contacts/:id/restore` - Restore contact

### Products
- `POST /api/products` - Create product
- `GET /api/products` - List products (with filters)
- `GET /api/products/:id` - Get product by ID
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id/archive` - Archive product

### Analytical Accounts
- `POST /api/analytical-accounts` - Create analytical account
- `GET /api/analytical-accounts` - List analytical accounts
- `GET /api/analytical-accounts/:id` - Get analytical account by ID
- `PUT /api/analytical-accounts/:id` - Update analytical account
- `DELETE /api/analytical-accounts/:id/archive` - Archive analytical account

### Budgets
- `POST /api/budgets` - Create budget
- `GET /api/budgets` - List budgets
- `GET /api/budgets/:id` - Get budget by ID
- `PUT /api/budgets/:id` - Update budget
- `PUT /api/budgets/:id/lines` - Update budget lines
- `DELETE /api/budgets/:id` - Delete budget (draft only)
- `POST /api/budgets/:id/refresh-actuals` - Refresh budget actuals
- `GET /api/budgets/:id/report` - Get budget report
- `POST /api/budgets/:id/revisions` - Create budget revision
- `GET /api/budgets/:id/history` - Get budget revision history

### Customer Portal
- `GET /api/portal/invoices` - List customer invoices
- `GET /api/portal/bills` - List vendor bills
- `GET /api/portal/sales-orders` - List sales orders
- `GET /api/portal/purchase-orders` - List purchase orders

## Key Concepts

### Analytical Accounts (Cost Centers)
Track WHERE or ON WHAT ACTIVITY money is being spent. Examples:
- Projects: "Furniture Expo 2026"
- Departments: "Production", "Marketing"
- Events: "Annual Conference"

### Budget vs Actual
Compare planned budgets against real transactions:
- **Budgeted Amount**: Target amount
- **Actual Amount**: Money spent from posted journal entries
- **Theoretical Amount**: Pro-rated budget based on time elapsed
- **Achievement %**: (Actual / Budgeted) × 100
- **Remaining Balance**: Budgeted - Actual
- **Variance**: Actual - Theoretical

### Auto Analytical Models
Automatically assign cost centers based on rules:
- Product category matches
- Contact type matches
- Custom field conditions

### Payment Status
- **Unpaid**: No payment received
- **Partially Paid**: Some payment received
- **Paid**: Fully paid

## Business Logic Highlights

### 1. Budget Calculation
The system automatically calculates theoretical amounts based on time elapsed:
```javascript
theoretical = (budgeted / total_days) * days_elapsed
```

### 2. Payment Reconciliation
When a payment is allocated:
1. Payment is recorded
2. Allocation links payment to invoice/bill
3. Invoice/bill payment status updates automatically
4. Journal entries are created for accounting

### 3. Auto Analytical Assignment
When creating transaction lines:
1. Check if manual analytical account assigned
2. If not, evaluate auto analytical models by priority
3. Match conditions (category, product, contact)
4. Auto-assign analytical account to line

### 4. Budget Actuals Update
Budget actuals are calculated from posted journal entries:
```sql
SELECT SUM(debit) - SUM(credit) 
FROM journal_entry_lines
WHERE analytical_account_id = ? 
  AND posted = 1
  AND entry_date BETWEEN period_start AND period_end
```

## Database Schema Highlights

### Main Tables
- **users**: System users (admin)
- **contacts**: Vendors and customers
- **products**: Product master
- **analytical_accounts**: Cost centers
- **budgets**: Budget headers
- **budget_lines**: Budget line items
- **auto_analytical_models**: Auto assignment rules
- **purchase_orders / bills**: Purchase transactions
- **sales_orders / invoices**: Sales transactions
- **payments**: Payment records
- **payment_allocations**: Payment-to-invoice/bill links
- **journal_entries**: Accounting entries
- **portal_access**: Customer portal users

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (Admin/Portal)
- Rate limiting on API endpoints
- CORS protection
- Helmet security headers
- Input validation and sanitization

## Error Handling

The application uses centralized error handling:
- Validation errors return 400
- Authentication errors return 401
- Authorization errors return 403
- Not found errors return 404
- Database constraint violations return 409
- Server errors return 500

## Logging

Logs are stored in the `logs/` directory:
- `combined.log`: All logs
- `error.log`: Error logs only

In development mode, logs also output to console.

## Testing

Use tools like Postman or cURL to test the API:

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"loginId":"admin","email":"admin@test.com","password":"admin123","full_name":"Admin User"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"loginId":"admin","password":"admin123"}'

# Get contacts (with token)
curl -X GET http://localhost:5000/api/contacts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Scalability Considerations

1. **Database Indexing**: Key fields are indexed for performance
2. **Pagination**: All list endpoints support pagination
3. **Query Optimization**: Efficient SQL queries with proper joins
4. **Connection Pooling**: SQLite WAL mode for concurrent reads
5. **Caching Ready**: Structure supports future caching layer
6. **Modular Architecture**: Easy to extract services to microservices

## Future Enhancements

- [ ] File upload for documents
- [ ] Email notifications
- [ ] Advanced reporting with charts
- [ ] Multi-currency support
- [ ] Tax calculation engine
- [ ] Inventory management
- [ ] Production planning
- [ ] Advanced analytics dashboard

## Support

For issues and questions, please contact the development team.

## License

Proprietary - Shiv Furniture
