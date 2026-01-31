// User and Auth Types
export type UserRole = "admin" | "portal";

export interface User {
    id: string;
    name: string;
    loginId: string;
    email: string;
    role: UserRole;
    contactId?: string; // For portal users - links to contact record
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
    type?: "customer" | "vendor" | "both"; // Keep for backward compatibility
    contactType?: "customer" | "vendor" | "both"; // What API actually returns
    address?: string; // Street
    city?: string;
    state?: string;
    country?: string;
    pincode?: string; // Keep for backward compatibility
    postalCode?: string; // What API actually returns
    tags?: string[];
    image?: string;
    imageUrl?: string; // What API actually returns
    gstNumber?: string;
    taxId?: string; // What API actually returns
    isActive?: boolean;
    active?: boolean; // What API actually returns
    createdAt?: string;
    updatedAt?: string;
}

// Product Types
export interface Product {
    id: string;
    name: string;
    sku?: string;
    internalReference?: string; // From internal_reference in DB
    category: string;
    description?: string;
    salesPrice?: number; // Frontend field name
    salePrice?: number; // API returns this from sale_price
    purchasePrice?: number; // Frontend field name
    costPrice?: number; // API returns this from cost_price
    productType?: string;
    unitOfMeasure?: string;
    image?: string;
    imageUrl?: string;
    unit?: string;
    taxRate?: number;
    isActive?: boolean;
    active?: boolean;
    createdAt?: string;
    updatedAt?: string;
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
    analyticalAccountId?: string;
    analyticalAccountName?: string;
    periodStart: string;
    periodEnd: string;
    plannedAmount?: number; // Frontend field
    budgetedAmount?: number; // API returns this from budgeted_amount
    actualAmount?: number;
    theoreticalAmount?: number;
    achievementPercentage?: number;
    remainingBalance?: number;
    variance?: number;
    status?: string;
    revisions?: BudgetRevision[];
    isActive?: boolean;
    active?: boolean;
    createdAt?: string;
    updatedAt?: string;
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
    analyticAccountId: string;
    analyticAccountName?: string;
    priority: number;
    // Conditions (optional matchers)
    partnerTag?: string;
    productCategory?: string;
    partnerId?: string;
    productId?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
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
    billReference?: string;
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

// Portal-Specific Types
export type PaymentMethodType = "upi" | "card" | "netbanking" | "emi" | "paylater" | "wallet";

export interface PortalInvoice {
    id: string;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    customerId: string;
    customerName: string;
    status: "draft" | "confirmed" | "done" | "cancelled";
    paymentStatus: "unpaid" | "partial" | "paid";
    lineItems: {
        id: string;
        productId: string;
        productName: string;
        analyticalAccountId?: string;
        analyticalAccountName?: string;
        quantity: number;
        unitPrice: number;
        taxRate: number;
        taxAmount: number;
        total: number;
    }[];
    subtotal: number;
    taxTotal: number;
    grandTotal: number;
    paidViaCash: number;
    paidViaBank: number;
    amountDue: number;
    createdAt: string;
    updatedAt: string;
}

export interface PortalOrder {
    id: string;
    orderNumber: string;
    orderDate: string;
    type: "sales" | "purchase";
    partnerId: string;
    partnerName: string;
    status: "draft" | "confirmed" | "done" | "cancelled";
    lineItems: {
        id: string;
        productId: string;
        productName: string;
        quantity: number;
        unitPrice: number;
        total: number;
    }[];
    total: number;
    createdAt: string;
    updatedAt: string;
}

export interface PaymentTransaction {
    id: string;
    invoiceId: string;
    invoiceNumber: string;
    amount: number;
    paymentMethod: PaymentMethodType;
    paymentGateway?: string;
    transactionId?: string;
    status: "pending" | "processing" | "completed" | "failed" | "cancelled";
    initiatedAt: string;
    completedAt?: string;
    failureReason?: string;
}

export interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    handler: (response: RazorpayResponse) => void;
    prefill: {
        name: string;
        email: string;
        contact: string;
    };
    theme: {
        color: string;
    };
}

export interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

