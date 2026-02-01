import type { PortalInvoice, PortalOrder, PaymentTransaction, ApiResponse } from "@/lib/types";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

/**
 * Portal Service - Handles all portal-related API calls
 * Ready for backend integration - just update the endpoints
 */
export const portalService = {
    /**
     * Fetch all invoices for the logged-in portal user
     */
    async getMyInvoices(): Promise<PortalInvoice[]> {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_BASE}/portal/invoices`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch invoices");
            }

            const data: ApiResponse<PortalInvoice[]> = await response.json();
            return data.data;
        } catch (error) {
            console.error("Error fetching invoices:", error);
            // Return mock data for development
            return getMockInvoices();
        }
    },

    /**
     * Fetch a single invoice by ID
     */
    async getInvoiceById(id: string): Promise<PortalInvoice | null> {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_BASE}/portal/invoices/${id}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch invoice");
            }

            const data: ApiResponse<PortalInvoice> = await response.json();
            return data.data;
        } catch (error) {
            console.error("Error fetching invoice:", error);
            // Return mock data for development
            const mockInvoices = getMockInvoices();
            return mockInvoices.find(inv => inv.id === id) || null;
        }
    },

    /**
     * Fetch all orders (Sales & Purchase) for the logged-in portal user
     */
    async getMyOrders(): Promise<PortalOrder[]> {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_BASE}/portal/orders`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch orders");
            }

            const data: ApiResponse<PortalOrder[]> = await response.json();
            return data.data;
        } catch (error) {
            console.error("Error fetching orders:", error);
            // Return mock data for development
            return getMockOrders();
        }
    },

    /**
     * Download invoice as PDF
     */
    async downloadInvoice(invoiceId: string): Promise<Blob> {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_BASE}/portal/invoices/${invoiceId}/download`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to download invoice");
            }

            return await response.blob();
        } catch (error) {
            console.error("Error downloading invoice:", error);
            throw error;
        }
    },

    /**
     * Initiate payment for an invoice
     */
    async initiatePayment(invoiceId: string, amount: number): Promise<{ orderId: string; transactionId: string }> {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_BASE}/portal/invoices/${invoiceId}/pay`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ amount }),
            });

            if (!response.ok) {
                throw new Error("Failed to initiate payment");
            }

            const data: ApiResponse<{ orderId: string; transactionId: string }> = await response.json();
            return data.data;
        } catch (error) {
            console.error("Error initiating payment:", error);
            // Return mock response for development
            return {
                orderId: `order_${Date.now()}`,
                transactionId: `txn_${Date.now()}`,
            };
        }
    },

    /**
     * Verify payment after Razorpay success
     */
    async verifyPayment(paymentData: {
        invoiceId: string;
        razorpayPaymentId: string;
        razorpayOrderId: string;
        razorpaySignature: string;
    }): Promise<PaymentTransaction> {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE}/portal/payments/verify`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(paymentData),
        });

        if (!response.ok) {
            throw new Error("Failed to verify payment");
        }

        const data: ApiResponse<PaymentTransaction> = await response.json();
        return data.data;
    },

    /**
     * Fetch payment history for the logged-in portal user
     */
    async getMyPayments(): Promise<PaymentTransaction[]> {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_BASE}/portal/payments`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch payments");
            }

            const data: ApiResponse<PaymentTransaction[]> = await response.json();
            return data.data;
        } catch (error) {
            console.error("Error fetching payments:", error);
            // Return mock data for development
            return getMockPayments();
        }
    },
};

// Mock Data for Development
const getMockPayments = (): PaymentTransaction[] => {
    return [
        {
            id: "txn_001",
            invoiceId: "1",
            invoiceNumber: "INV/2025/0001",
            amount: 21600,
            paymentMethod: "card",
            paymentGateway: "razorpay",
            transactionId: "pay_Op9xX8y7W6z",
            status: "completed",
            initiatedAt: "2025-01-16T10:30:00Z",
            completedAt: "2025-01-16T10:32:00Z",
        },
        {
            id: "txn_002",
            invoiceId: "3",
            invoiceNumber: "INV/2024/0198",
            amount: 29500,
            paymentMethod: "netbanking",
            paymentGateway: "razorpay",
            transactionId: "pay_Kj8H7g6F5d",
            status: "completed",
            initiatedAt: "2024-12-28T14:15:00Z",
            completedAt: "2024-12-28T14:18:00Z",
        },
        {
            id: "txn_003",
            invoiceId: "2",
            invoiceNumber: "INV/2025/0002",
            amount: 5000,
            paymentMethod: "upi",
            paymentGateway: "razorpay",
            transactionId: "pay_failed_1",
            status: "failed",
            initiatedAt: "2025-01-21T09:00:00Z",
            failureReason: "Payment cancelled by user",
        },
    ];
};

function getMockInvoices(): PortalInvoice[] {
    return [
        {
            id: "1",
            invoiceNumber: "INV/2025/0001",
            invoiceDate: "2025-01-15",
            dueDate: "2025-02-15",
            customerId: "1",
            customerName: "Ansadi Pathak",
            status: "confirmed",
            paymentStatus: "partial",
            lineItems: [
                {
                    id: "1",
                    productId: "1",
                    productName: "Gran Product Master - Many to one",
                    analyticalAccountId: "1",
                    analyticalAccountName: "Gran Analytical Master - Many to one",
                    quantity: 4,
                    unitPrice: 3500,
                    taxRate: 18,
                    taxAmount: 2520,
                    total: 16520,
                },
                {
                    id: "2",
                    productId: "2",
                    productName: "Sofa",
                    quantity: 6,
                    unitPrice: 3100,
                    taxRate: 18,
                    taxAmount: 3348,
                    total: 21948,
                },
                {
                    id: "3",
                    productId: "3",
                    productName: "Chair",
                    quantity: 2,
                    unitPrice: 1000,
                    taxRate: 18,
                    taxAmount: 360,
                    total: 2360,
                },
            ],
            subtotal: 34800,
            taxTotal: 6228,
            grandTotal: 41028,
            paidViaCash: 0,
            paidViaBank: 21600,
            amountDue: 19428,
            createdAt: "2025-01-15T10:00:00Z",
            updatedAt: "2025-01-20T15:30:00Z",
        },
        {
            id: "2",
            invoiceNumber: "INV/2025/0002",
            invoiceDate: "2025-01-20",
            dueDate: "2025-02-20",
            customerId: "1",
            customerName: "Ansadi Pathak",
            status: "confirmed",
            paymentStatus: "unpaid",
            lineItems: [
                {
                    id: "4",
                    productId: "4",
                    productName: "Dining Table",
                    quantity: 1,
                    unitPrice: 15000,
                    taxRate: 18,
                    taxAmount: 2700,
                    total: 17700,
                },
            ],
            subtotal: 15000,
            taxTotal: 2700,
            grandTotal: 17700,
            paidViaCash: 0,
            paidViaBank: 0,
            amountDue: 17700,
            createdAt: "2025-01-20T10:00:00Z",
            updatedAt: "2025-01-20T10:00:00Z",
        },
        {
            id: "3",
            invoiceNumber: "INV/2024/0198",
            invoiceDate: "2024-12-05",
            dueDate: "2025-01-05",
            customerId: "1",
            customerName: "Ansadi Pathak",
            status: "done",
            paymentStatus: "paid",
            lineItems: [
                {
                    id: "5",
                    productId: "5",
                    productName: "Office Chair",
                    quantity: 10,
                    unitPrice: 2500,
                    taxRate: 18,
                    taxAmount: 4500,
                    total: 29500,
                },
            ],
            subtotal: 25000,
            taxTotal: 4500,
            grandTotal: 29500,
            paidViaCash: 0,
            paidViaBank: 29500,
            amountDue: 0,
            createdAt: "2024-12-05T10:00:00Z",
            updatedAt: "2024-12-28T14:20:00Z",
        },
    ];
}

function getMockOrders(): PortalOrder[] {
    return [
        {
            id: "1",
            orderNumber: "SO/2025/0001",
            orderDate: "2025-01-10",
            type: "sales",
            partnerId: "1",
            partnerName: "Ansadi Pathak",
            status: "confirmed",
            lineItems: [
                {
                    id: "1",
                    productId: "1",
                    productName: "Gran Product Master",
                    quantity: 4,
                    unitPrice: 3500,
                    total: 14000,
                },
                {
                    id: "2",
                    productId: "2",
                    productName: "Sofa",
                    quantity: 6,
                    unitPrice: 3100,
                    total: 18600,
                },
            ],
            total: 32600,
            createdAt: "2025-01-10T10:00:00Z",
            updatedAt: "2025-01-10T10:00:00Z",
        },
        {
            id: "2",
            orderNumber: "PO/2025/0005",
            orderDate: "2025-01-12",
            type: "purchase",
            partnerId: "2",
            partnerName: "Furniture Supplier Ltd",
            status: "confirmed",
            lineItems: [
                {
                    id: "3",
                    productId: "3",
                    productName: "Wood Panels",
                    quantity: 50,
                    unitPrice: 800,
                    total: 40000,
                },
            ],
            total: 40000,
            createdAt: "2025-01-12T10:00:00Z",
            updatedAt: "2025-01-12T10:00:00Z",
        },
    ];
}
