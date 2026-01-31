import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, Smartphone, Building2, TrendingUp, Clock, Wallet, CheckCircle, XCircle, Loader } from "lucide-react";
import { Button } from "@/components/ui";
import type { PortalInvoice, PaymentMethodType, User } from "@/lib/types";
import { paymentService } from "@/services/paymentService";
import { portalService } from "@/services/portalService";
import { formatCurrency } from "@/lib/utils";

interface PaymentModalProps {
    invoice: PortalInvoice;
    user: User;
    onClose: () => void;
    onSuccess: () => void;
}

type PaymentStatus = "idle" | "processing" | "success" | "failed";

const paymentMethods = [
    { id: "upi", label: "UPI / QR", icon: Smartphone, description: "Google Pay, PhonePe, Paytm" },
    { id: "card", label: "Cards", icon: CreditCard, description: "Debit & Credit cards" },
    { id: "netbanking", label: "Net Banking", icon: Building2, description: "All Indian banks" },
    { id: "emi", label: "EMI", icon: TrendingUp, description: "Easy installments" },
    { id: "paylater", label: "Pay Later", icon: Clock, description: "Simpl, LazyPay, etc" },
    { id: "wallet", label: "Wallet", icon: Wallet, description: "PayTM, PhonePe, etc" },
];

export const PaymentModal: React.FC<PaymentModalProps> = ({ invoice, user, onClose, onSuccess }) => {
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType | null>(null);
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("idle");
    const [errorMessage, setErrorMessage] = useState<string>("");

    const handlePayment = async () => {
        if (!selectedMethod) {
            setErrorMessage("Please select a payment method");
            return;
        }

        try {
            setPaymentStatus("processing");
            setErrorMessage("");

            // Step 1: Initiate payment from backend
            const { orderId } = await portalService.initiatePayment(
                invoice.id,
                invoice.amountDue
            );

            // Step 2: Open Razorpay payment gateway with timeout
            const paymentPromise = paymentService.initializePayment(
                orderId,
                invoice.amountDue,
                invoice.invoiceNumber,
                {
                    name: user.name,
                    email: user.email,
                    phone: "9999999999", // Should come from user profile
                }
            );

            // Add 30-second timeout for Razorpay
            const timeoutPromise = new Promise<never>((_, reject) => {
                setTimeout(() => {
                    reject(new Error("Payment timeout: Razorpay didn't respond. Please check your API key configuration."));
                }, 30000);
            });

            const razorpayResponse = await Promise.race([paymentPromise, timeoutPromise]);

            // Step 3: Verify payment on backend
            await portalService.verifyPayment({
                invoiceId: invoice.id,
                razorpayPaymentId: razorpayResponse.razorpay_payment_id,
                razorpayOrderId: razorpayResponse.razorpay_order_id,
                razorpaySignature: razorpayResponse.razorpay_signature,
            });

            // Payment successful
            setPaymentStatus("success");
            setTimeout(() => {
                onSuccess();
            }, 2000);
        } catch (error) {
            console.error("Payment failed:", error);
            setPaymentStatus("failed");
            setErrorMessage(error instanceof Error ? error.message : "Payment failed. Please try again.");
        }
    };

    const handleCancelProcessing = () => {
        setPaymentStatus("idle");
        setErrorMessage("Payment cancelled by user");
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900">Invoice Payment</h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            disabled={paymentStatus === "processing"}
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {paymentStatus === "idle" && (
                            <>
                                {/* Payment Details */}
                                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-gray-600">Invoice No.</span>
                                        <span className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-gray-600">Customer</span>
                                        <span className="text-sm font-medium text-gray-900">{invoice.customerName}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                        <span className="text-base font-semibold text-gray-900">Amount to Pay</span>
                                        <span className="text-2xl font-bold text-indigo-600">
                                            {formatCurrency(invoice.amountDue)}
                                        </span>
                                    </div>
                                </div>

                                {/* Payment Methods */}
                                <div className="mb-6">
                                    <p className="text-sm font-semibold text-gray-700 mb-3">Select Payment Method</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {paymentMethods.map((method) => {
                                            const Icon = method.icon;
                                            return (
                                                <button
                                                    key={method.id}
                                                    onClick={() => setSelectedMethod(method.id as PaymentMethodType)}
                                                    className={`p-4 rounded-lg border-2 transition-all text-left ${selectedMethod === method.id
                                                        ? "border-indigo-600 bg-indigo-50"
                                                        : "border-gray-200 hover:border-gray-300"
                                                        }`}
                                                >
                                                    <Icon className={`w-6 h-6 mb-2 ${selectedMethod === method.id ? "text-indigo-600" : "text-gray-400"
                                                        }`} />
                                                    <p className={`text-sm font-medium ${selectedMethod === method.id ? "text-indigo-900" : "text-gray-900"
                                                        }`}>
                                                        {method.label}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{method.description}</p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Error Message */}
                                {errorMessage && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-sm text-red-600">{errorMessage}</p>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={onClose}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handlePayment}
                                        className="flex-1"
                                        disabled={!selectedMethod}
                                    >
                                        Pay Now
                                    </Button>
                                </div>
                            </>
                        )}

                        {paymentStatus === "processing" && (
                            <div className="text-center py-8">
                                <Loader className="w-16 h-16 text-indigo-600 animate-spin mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Payment</h3>
                                <p className="text-gray-500 mb-6">Please complete the payment in the popup window...</p>
                                <Button
                                    variant="outline"
                                    onClick={handleCancelProcessing}
                                    className="mt-4"
                                >
                                    Cancel Payment
                                </Button>
                            </div>
                        )}

                        {paymentStatus === "success" && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="text-center py-8"
                            >
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-12 h-12 text-green-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
                                <p className="text-gray-600 mb-1">Thank you for your payment</p>
                                <p className="text-sm text-gray-500">Payment for {invoice.invoiceNumber}</p>
                                <p className="text-2xl font-bold text-green-600 mt-4">
                                    {formatCurrency(invoice.amountDue)}
                                </p>
                                <p className="text-xs text-gray-500 mt-6">Powered by Razorpay</p>
                            </motion.div>
                        )}

                        {paymentStatus === "failed" && (
                            <div className="text-center py-8">
                                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <XCircle className="w-12 h-12 text-red-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Failed</h3>
                                <p className="text-gray-600 mb-4">{errorMessage}</p>
                                <div className="flex gap-3">
                                    <Button variant="outline" onClick={onClose} className="flex-1">
                                        Close
                                    </Button>
                                    <Button onClick={() => setPaymentStatus("idle")} className="flex-1">
                                        Try Again
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
