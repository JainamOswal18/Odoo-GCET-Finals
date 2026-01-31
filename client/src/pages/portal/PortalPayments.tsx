import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, CheckCircle, XCircle, Clock } from "lucide-react";
import { Card } from "@/components/ui";
import type { PaymentTransaction } from "@/lib/types";
import { portalService } from "@/services/portalService";
import { formatCurrency } from "@/lib/utils";

export const PortalPayments: React.FC = () => {
    const [payments, setPayments] = useState<PaymentTransaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPayments();
    }, []);

    const loadPayments = async () => {
        try {
            setLoading(true);
            const data = await portalService.getMyPayments();
            setPayments(data);
        } catch (error) {
            console.error("Failed to load payments:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            completed: "badge-success",
            failed: "badge-error",
            pending: "badge-warning",
        };
        return badges[status as keyof typeof badges] || "badge-neutral";
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "completed":
                return <CheckCircle className="w-4 h-4" />;
            case "failed":
                return <XCircle className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="text-gray-500 mt-4">Loading payments...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
                    <p className="text-gray-500 mt-1">View your past transactions</p>
                </div>
            </div>

            {/* Payments List */}
            {payments.length === 0 ? (
                <Card className="p-12 text-center">
                    <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900">No payments found</h3>
                    <p className="text-gray-500 mt-2">You haven't made any payments yet</p>
                </Card>
            ) : (
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="table min-w-[800px]">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Transaction ID</th>
                                    <th>Invoice ID</th>
                                    <th>Method</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map((payment, index) => (
                                    <motion.tr
                                        key={payment.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="hover:bg-gray-50"
                                    >
                                        <td>
                                            {new Date(payment.initiatedAt).toLocaleDateString("en-GB", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </td>
                                        <td className="font-mono text-xs">{payment.transactionId}</td>
                                        <td className="font-medium">INV/2025/00{payment.invoiceId}</td>
                                        <td className="capitalize">{payment.paymentMethod}</td>
                                        <td className="font-semibold">
                                            {formatCurrency(payment.amount)}
                                        </td>
                                        <td>
                                            <span className={`badge ${getStatusBadge(payment.status)} gap-1`}>
                                                {getStatusIcon(payment.status)}
                                                {payment.status}
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
};
