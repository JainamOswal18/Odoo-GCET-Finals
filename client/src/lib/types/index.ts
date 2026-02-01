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
    type?: "customer" | "vendor" | "both"; // Frontend field name
    contactType?: "customer" | "vendor" | "both"; // Backend field name (contact_type)
    address?: string; // Street
    city?: string;
    state?: string;
    country?: string;
    pincode?: string; // Frontend field name
    postalCode?: string; // Backend field name (postal_code)
    tags?: string[];
    image?: string;
    imageUrl?: string; // Backend field name (image_url)
    companyLogoUrl?: string; // Backend field name (company_logo_url)
    gstNumber?: string; // Frontend field name
    taxId?: string; // Backend field name (tax_id)
    isActive?: boolean; // Frontend field name
    active?: boolean; // Backend field name
    createdAt?: string;
    updatedAt?: string;
}

// Product Types
export interface Product {
    id: string;
    name: string;
    sku?: string;
    internalReference?: string; // Backend field name (internal_reference)
    category: string;
    description?: string;
    salesPrice?: number; // Frontend field name
    salePrice?: number; // Backend field name (sale_price)
    purchasePrice?: number; // Frontend field name
    costPrice?: number; // Backend field name (cost_price)
    productType?: string;
    unitOfMeasure?: string;
    image?: string;
    imageUrl?: string; // Backend field name (image_url)
    unit?: string;
    taxRate?: number;
    isActive?: boolean; // Frontend field name
    active?: boolean; // Backend field name
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
    active?: boolean; // What API actually returns
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
    plannedAmount?: number; // Frontend field name (deprecated, use budgetedAmount)
    budgetedAmount?: number; // Backend field name (budgeted_amount)
    actualAmount?: number;
    theoreticalAmount?: number;
    achievementPercentage?: number;
    remainingBalance?: number;
    variance?: number;
    status?: string;
    lines?: BudgetLine[]; // Budget lines array
    revisions?: BudgetRevision[];
    isActive?: boolean; // Frontend field name
    active?: boolean; // Backend field name
    createdAt?: string;
    updatedAt?: string;
}

export interface BudgetLine {
    id?: string;
    budgetId?: string;
    analyticalAccountId?: string;
    analyticalAccountName?: string;
    analytical_account_name?: string; // Backend field name
    budgetedAmount?: number;
    budgeted_amount?: number; // Backend field name
    actualAmount?: number;
    actual_amount?: number; // Backend field name
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
    poNumber: string; // Backend field name (po_number) - PRIMARY
    orderNumber?: string; // Alternative field name for compatibility
    vendorId: string;
    vendorName: string;
    orderDate: string;
    expectedDate?: string;
    status: OrderStatus;
    lineItems: LineItem[];
    subtotal: number;
    taxTotal: number;
    taxAmount?: number; // Backend field name (tax_amount)
    grandTotal: number;
    totalAmount?: number; // Backend field name (total_amount) - PRIMARY
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
    totalAmount?: number; // Backend field name (total_amount), same as grandTotal
    amountPaid: number;
    amountDue: number;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

// Sales Order
export interface SalesOrder {
    id: string;
    soNumber: string; // Backend field name (so_number) - PRIMARY
    orderNumber?: string; // Alternative field name for compatibility
    customerId: string;
    customerName: string;
    orderDate: string;
    expectedDate?: string;
    deliveryDate?: string; // Backend field name (delivery_date)
    status: OrderStatus;
    lineItems: LineItem[];
    subtotal: number;
    taxTotal: number;
    taxAmount?: number; // Backend field name (tax_amount)
    grandTotal: number;
    totalAmount?: number; // Backend field name (total_amount) - PRIMARY
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
    referenceNumber?: string; // Alternative field name, same as reference
    type: "incoming" | "outgoing";
    contactId: string;
    contactName: string;
    partnerName?: string; // Alternative field name for contactName
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

// Region Types
export interface Country {
    id: number;
    iso2: string;
    iso3: string;
    name: string;
    phone_code: string;
    phoneCode?: string; // Alternative
    currency?: string;
    flag?: string;
}

export interface State {
    id: number;
    country_id: number;
    countryId?: number; // Alternative
    name: string;
    state_code?: string;
    stateCode?: string; // Alternative
}

export interface City {
    id: number;
    state_id: number;
    stateId?: number; // Alternative
    country_id: number;
    countryId?: number; // Alternative
    name: string;
}


