import type { RazorpayOptions, RazorpayResponse } from "@/lib/types";

declare global {
    interface Window {
        Razorpay: new (options: RazorpayOptions) => {
            open: () => void;
            on: (event: string, handler: () => void) => void;
        };
    }
}

/**
 * Payment Service - Handles Razorpay payment integration
 * Add your Razorpay key in .env as VITE_RAZORPAY_KEY
 */
export const paymentService = {
    /**
     * Initialize Razorpay payment
     */
    async initializePayment(
        orderId: string,
        amount: number,
        invoiceNumber: string,
        userDetails: { name: string; email: string; phone: string }
    ): Promise<RazorpayResponse> {
        return new Promise((resolve, reject) => {
            // Load Razorpay script if not already loaded
            if (!window.Razorpay) {
                this.loadRazorpayScript()
                    .then(() => {
                        this.openPaymentModal(orderId, amount, invoiceNumber, userDetails, resolve, reject);
                    })
                    .catch(reject);
            } else {
                this.openPaymentModal(orderId, amount, invoiceNumber, userDetails, resolve, reject);
            }
        });
    },

    /**
     * Load Razorpay SDK script
     */
    loadRazorpayScript(): Promise<void> {
        return new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
            document.body.appendChild(script);
        });
    },

    /**
     * Open Razorpay payment modal
     */
    openPaymentModal(
        orderId: string,
        amount: number,
        invoiceNumber: string,
        userDetails: { name: string; email: string; phone: string },
        resolve: (value: RazorpayResponse) => void,
        reject: (reason: Error) => void
    ): void {
        const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY;

        if (!razorpayKey || razorpayKey === "rzp_test_your_key_here" || razorpayKey === "your_razorpay_key_here") {
            const errorMsg = "Razorpay API Key is missing or invalid. Please set VITE_RAZORPAY_KEY in client/.env";
            console.error(errorMsg);
            reject(new Error(errorMsg));
            return;
        }

        const options: RazorpayOptions = {
            key: razorpayKey,
            amount: amount * 100, // Razorpay expects amount in paise
            currency: "INR",
            name: "Shiv Furniture",
            description: `Payment for ${invoiceNumber}`,
            order_id: orderId,
            handler: (response: RazorpayResponse) => {
                resolve(response);
            },
            prefill: {
                name: userDetails.name,
                email: userDetails.email,
                contact: userDetails.phone,
            },
            theme: {
                color: "#6366f1", // Indigo color matching your app theme
            },
        };

        const rzp = new window.Razorpay(options);

        rzp.on("payment.failed", () => {
            reject(new Error("Payment failed"));
        });

        rzp.open();
    },

    /**
     * Format amount for display
     */
    formatAmount(amount: number): string {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(amount);
    },

    /**
     * Get payment method icon
     */
    getPaymentMethodIcon(method: string): string {
        const icons: Record<string, string> = {
            upi: "📱",
            card: "💳",
            netbanking: "🏦",
            emi: "📊",
            paylater: "⏱️",
            wallet: "👛",
        };
        return icons[method] || "💰";
    },
};
