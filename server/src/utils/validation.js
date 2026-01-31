import { body, param, query } from 'express-validator';

// Contact validation schemas
const contactValidation = {
  create: [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('contact_type').isIn(['vendor', 'customer', 'both']).withMessage('Invalid contact type'),
    body('email').optional().isEmail().withMessage('Invalid email'),
    body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
    body('credit_limit').optional().isFloat({ min: 0 }).withMessage('Credit limit must be a positive number'),
    body('payment_terms').optional().isInt({ min: 0 }).withMessage('Payment terms must be a positive integer')
  ],
  update: [
    param('id').isInt().withMessage('Invalid contact ID'),
    body('email').optional().isEmail().withMessage('Invalid email'),
    body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
    body('credit_limit').optional().isFloat({ min: 0 }).withMessage('Credit limit must be a positive number')
  ]
};

// Product validation schemas
const productValidation = {
  create: [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('sale_price').isFloat({ min: 0 }).withMessage('Sale price must be a positive number'),
    body('cost_price').optional().isFloat({ min: 0 }).withMessage('Cost price must be a positive number'),
    body('product_type').optional().isIn(['goods', 'service']).withMessage('Invalid product type'),
    body('unit_of_measure').optional().trim().notEmpty().withMessage('Unit of measure cannot be empty')
  ],
  update: [
    param('id').isInt().withMessage('Invalid product ID'),
    body('sale_price').optional().isFloat({ min: 0 }).withMessage('Sale price must be a positive number'),
    body('cost_price').optional().isFloat({ min: 0 }).withMessage('Cost price must be a positive number')
  ]
};

// Analytical account validation schemas
const analyticalAccountValidation = {
  create: [
    body('code').trim().notEmpty().withMessage('Code is required'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('plan_name').optional().trim().notEmpty().withMessage('Plan name cannot be empty'),
    body('parent_id').optional().isInt().withMessage('Invalid parent ID'),
    body('is_budgetable').optional().isBoolean().withMessage('Is budgetable must be a boolean')
  ],
  update: [
    param('id').isInt().withMessage('Invalid account ID'),
    body('code').optional().trim().notEmpty().withMessage('Code cannot be empty'),
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty')
  ]
};

// Budget validation schemas
const budgetValidation = {
  create: [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('period_start').isDate().withMessage('Period start date is required'),
    body('period_end').isDate().withMessage('Period end date is required'),
    body('lines').optional().isArray().withMessage('Lines must be an array'),
    body('lines.*.analytical_account_id').optional().isInt().withMessage('Invalid analytical account ID'),
    body('lines.*.budgeted_amount').optional().isFloat({ min: 0 }).withMessage('Budgeted amount must be positive')
  ],
  update: [
    param('id').isInt().withMessage('Invalid budget ID'),
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('period_start').optional().isDate().withMessage('Invalid period start date'),
    body('period_end').optional().isDate().withMessage('Invalid period end date'),
    body('status').optional().isIn(['draft', 'confirmed', 'closed']).withMessage('Invalid status')
  ]
};

// Purchase order validation schemas
const purchaseOrderValidation = {
  create: [
    body('vendor_id').isInt().withMessage('Vendor ID is required'),
    body('order_date').isDate().withMessage('Order date is required'),
    body('expected_date').optional().isDate().withMessage('Invalid expected date'),
    body('lines').isArray({ min: 1 }).withMessage('At least one line is required'),
    body('lines.*.product_id').isInt().withMessage('Product ID is required'),
    body('lines.*.quantity').isFloat({ min: 0.01 }).withMessage('Quantity must be greater than 0'),
    body('lines.*.unit_price').isFloat({ min: 0 }).withMessage('Unit price must be positive')
  ],
  update: [
    param('id').isInt().withMessage('Invalid purchase order ID'),
    body('expected_date').optional().isDate().withMessage('Invalid expected date'),
    body('notes').optional().isString().withMessage('Notes must be a string')
  ]
};

// Sales order validation schemas
const salesOrderValidation = {
  create: [
    body('customer_id').isInt().withMessage('Customer ID is required'),
    body('order_date').isDate().withMessage('Order date is required'),
    body('delivery_date').optional().isDate().withMessage('Invalid delivery date'),
    body('lines').isArray({ min: 1 }).withMessage('At least one line is required'),
    body('lines.*.product_id').isInt().withMessage('Product ID is required'),
    body('lines.*.quantity').isFloat({ min: 0.01 }).withMessage('Quantity must be greater than 0'),
    body('lines.*.unit_price').isFloat({ min: 0 }).withMessage('Unit price must be positive')
  ],
  update: [
    param('id').isInt().withMessage('Invalid sales order ID'),
    body('delivery_date').optional().isDate().withMessage('Invalid delivery date'),
    body('notes').optional().isString().withMessage('Notes must be a string')
  ]
};

// Invoice validation schemas
const invoiceValidation = {
  create: [
    body('customer_id').isInt().withMessage('Customer ID is required'),
    body('invoice_date').isDate().withMessage('Invoice date is required'),
    body('due_date').optional().isDate().withMessage('Invalid due date'),
    body('so_id').optional().isInt().withMessage('Invalid sales order ID'),
    body('lines').isArray({ min: 1 }).withMessage('At least one line is required'),
    body('lines.*.product_id').isInt().withMessage('Product ID is required'),
    body('lines.*.quantity').isFloat({ min: 0.01 }).withMessage('Quantity must be greater than 0'),
    body('lines.*.unit_price').isFloat({ min: 0 }).withMessage('Unit price must be positive')
  ]
};

// Bill validation schemas
const billValidation = {
  create: [
    body('vendor_id').isInt().withMessage('Vendor ID is required'),
    body('bill_date').isDate().withMessage('Bill date is required'),
    body('due_date').optional().isDate().withMessage('Invalid due date'),
    body('po_id').optional().isInt().withMessage('Invalid purchase order ID'),
    body('lines').isArray({ min: 1 }).withMessage('At least one line is required'),
    body('lines.*.product_id').isInt().withMessage('Product ID is required'),
    body('lines.*.quantity').isFloat({ min: 0.01 }).withMessage('Quantity must be greater than 0'),
    body('lines.*.unit_price').isFloat({ min: 0 }).withMessage('Unit price must be positive')
  ]
};

// Payment validation schemas
const paymentValidation = {
  create: [
    body('payment_type').isIn(['inbound', 'outbound']).withMessage('Valid payment type is required'),
    body('contact_id').isInt().withMessage('Contact ID is required'),
    body('payment_date').isDate().withMessage('Payment date is required'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
    body('payment_method').optional().isString().withMessage('Payment method must be a string'),
    body('allocations').optional().isArray().withMessage('Allocations must be an array'),
    body('allocations.*.amount').optional().isFloat({ min: 0.01 }).withMessage('Allocation amount must be positive')
  ]
};

// Report query validation schemas
const reportValidation = {
  budgetVsActual: [
    query('budget_id').isInt().withMessage('Budget ID is required')
  ],
  analyticalAccount: [
    query('account_id').isInt().withMessage('Account ID is required'),
    query('start_date').isDate().withMessage('Start date is required'),
    query('end_date').isDate().withMessage('End date is required')
  ],
  paymentStatus: [
    query('start_date').isDate().withMessage('Start date is required'),
    query('end_date').isDate().withMessage('End date is required'),
    query('contact_type').optional().isIn(['customer', 'vendor']).withMessage('Invalid contact type')
  ],
  dateRange: [
    query('start_date').isDate().withMessage('Start date is required'),
    query('end_date').isDate().withMessage('End date is required')
  ]
};

// Auto analytical model validation schemas
const autoAnalyticalModelValidation = {
  create: [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('model_type').isIn(['purchase', 'sale', 'both']).withMessage('Valid model type is required'),
    body('priority').optional().isInt({ min: 1 }).withMessage('Priority must be a positive integer'),
    body('conditions').isArray({ min: 1 }).withMessage('At least one condition is required'),
    body('conditions.*.condition_type').isString().withMessage('Condition type is required'),
    body('conditions.*.field_name').isString().withMessage('Field name is required'),
    body('conditions.*.operator').isIn(['equals', 'contains', 'starts_with', 'greater_than', 'less_than'])
      .withMessage('Invalid operator'),
    body('conditions.*.value').notEmpty().withMessage('Value is required'),
    body('conditions.*.analytical_account_id').isInt().withMessage('Analytical account ID is required'),
    body('conditions.*.percentage').optional().isFloat({ min: 0, max: 100 }).withMessage('Percentage must be between 0 and 100')
  ],
  update: [
    param('id').isInt().withMessage('Invalid model ID'),
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('model_type').optional().isIn(['purchase', 'sale', 'both']).withMessage('Invalid model type'),
    body('priority').optional().isInt({ min: 1 }).withMessage('Priority must be a positive integer')
  ]
};

export {
  contactValidation,
  productValidation,
  analyticalAccountValidation,
  budgetValidation,
  purchaseOrderValidation,
  salesOrderValidation,
  invoiceValidation,
  billValidation,
  paymentValidation,
  reportValidation,
  autoAnalyticalModelValidation
};
