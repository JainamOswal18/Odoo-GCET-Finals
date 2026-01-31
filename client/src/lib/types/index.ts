// User and Auth Types
export type UserRole = "admin" | "portal";

export interface User {
    id: string;
    name: string;
    loginId: string;
    email: string;
    role: UserRole;
    createdAt: string;
    updatedAt: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

// Contact Types
export interface Contact {
    id: string;
    name: string;
    email: string;
    phone?: string;
    type: "customer" | "vendor" | "both";
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    gstNumber?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// Product Types
export interface Product {
    id: string;
    name: string;
    sku: string;
    category: string;
    description?: string;
    unitPrice: number;
    costPrice: number;
    unit: string;
    taxRate: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// Analytical Account (Cost Center) Types
export interface AnalyticalAccount {
    id: string;
    code: string;
    name: string;
    description?: string;
    parentId?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// Budget Types
export interface Budget {
    id: string;
    name: string;
    analyticalAccountId: string;
    analyticalAccountName?: string;
    periodStart: string;
    periodEnd: string;
    plannedAmount: number;
    actualAmount: number;
    achievementPercentage: number;
    remainingBalance: number;
    revisions: BudgetRevision[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface BudgetRevision {
    id: string;
    budgetId: string;
    previousAmount: number;
    newAmount: number;
    reason: string;
    revisedAt: string;
    revisedBy: string;
}

// Auto Analytical Model Types
export interface AutoAnalyticalModel {
    id: string;
    name: string;
    description?: string;
    rules: AutoAnalyticalRule[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AutoAnalyticalRule {
    id: string;
    modelId: string;
    condition: {
        field: "productCategory" | "contactType" | "transactionType";
        operator: "equals" | "contains" | "startsWith";
        value: string;
    };
    analyticalAccountId: string;
    analyticalAccountName?: string;
}

// Transaction Line Item
export interface LineItem {
    id: string;
    productId: string;
    productName: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    taxAmount: number;
    subtotal: number;
    total: number;
    analyticalAccountId?: string;
    analyticalAccountName?: string;
}

// Order Status
export type OrderStatus = "draft" | "confirmed" | "done" | "cancelled";

// Payment Status
export type PaymentStatus = "paid" | "partial" | "unpaid";

// Purchase Order
export interface PurchaseOrder {
    id: string;
    orderNumber: string;
    vendorId: string;
    vendorName: string;
    orderDate: string;
    expectedDate?: string;
    status: OrderStatus;
    lineItems: LineItem[];
    subtotal: number;
    taxTotal: number;
    grandTotal: number;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

// Vendor Bill
export interface VendorBill {
    id: string;
    billNumber: string;
    vendorId: string;
    vendorName: string;
    purchaseOrderId?: string;
    purchaseOrderNumber?: string;
    billDate: string;
    dueDate: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    lineItems: LineItem[];
    subtotal: number;
    taxTotal: number;
    grandTotal: number;
    amountPaid: number;
    amountDue: number;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

// Sales Order
export interface SalesOrder {
    id: string;
    orderNumber: string;
    customerId: string;
    customerName: string;
    orderDate: string;
    expectedDate?: string;
    status: OrderStatus;
    lineItems: LineItem[];
    subtotal: number;
    taxTotal: number;
    grandTotal: number;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

// Customer Invoice
export interface CustomerInvoice {
    id: string;
    invoiceNumber: string;
    customerId: string;
    customerName: string;
    salesOrderId?: string;
    salesOrderNumber?: string;
    invoiceDate: string;
    dueDate: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    lineItems: LineItem[];
    subtotal: number;
    taxTotal: number;
    grandTotal: number;
    amountPaid: number;
    amountDue: number;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

// Payment
export interface Payment {
    id: string;
    paymentNumber: string;
    type: "incoming" | "outgoing";
    contactId: string;
    contactName: string;
    invoiceId?: string;
    invoiceNumber?: string;
    billId?: string;
    billNumber?: string;
    paymentDate: string;
    amount: number;
    paymentMethod: "cash" | "bank_transfer" | "upi" | "razorpay" | "cheque";
    reference?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

// Dashboard Stats
export interface DashboardStats {
    totalBudget: number;
    actualSpending: number;
    remainingBudget: number;
    overallAchievement: number;
    pendingInvoices: number;
    pendingBills: number;
    recentTransactions: number;
}

// API Response Types
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
