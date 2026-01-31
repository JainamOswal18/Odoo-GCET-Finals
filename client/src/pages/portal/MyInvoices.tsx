import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, CreditCard, Eye } from "lucide-react";
import { Card, Button } from "@/components/ui";
import type { PortalInvoice } from "@/lib/types";
import { portalService } from "@/services/portalService";
import { formatCurrency } from "@/lib/utils";

type InvoiceStatus = "all" | "draft" | "confirmed" | "done" | "cancelled";

export const MyInvoices: React.FC = () => {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState<PortalInvoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<InvoiceStatus>("all");

    useEffect(() => {
        loadInvoices();
    }, []);

    const loadInvoices = async () => {
        try {
            setLoading(true);
            const data = await portalService.getMyInvoices();
            setInvoices(data);
        } catch (error) {
            console.error("Failed to load invoices:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredInvoices = invoices.filter((inv) => {
        if (statusFilter === "all") return true;
        return inv.status === statusFilter;
    });

    const getStatusBadge = (status: string) => {
        const badges = {
            draft: "badge-neutral",
            confirmed: "badge-primary",
            done: "badge-success",
            cancelled: "badge-error",
        };
        return badges[status as keyof typeof badges] || "badge-neutral";
    };

    const getPaymentStatusBadge = (status: string) => {
        const badges = {
            unpaid: "badge-error",
            partial: "badge-warning",
            paid: "badge-success",
        };
        return badges[status as keyof typeof badges] || "badge-neutral";
    };

    const handleViewInvoice = (invoiceId: string) => {
        navigate(`/portal/invoices/${invoiceId}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="text-gray-500 mt-4">Loading invoices...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Invoices</h1>
                    <p className="text-gray-500 mt-1">View and manage your invoices</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Total:</span>
                    <span className="text-lg font-bold text-gray-900">{filteredInvoices.length}</span>
                </div>
            </div>

            {/* Status Filter */}
            <div className="flex flex-wrap gap-2">
                {(["all", "draft", "confirmed", "done", "cancelled"] as InvoiceStatus[]).map((status) => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === status
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                ))}
            </div>

            {/* Invoice List */}
            {filteredInvoices.length === 0 ? (
                <Card className="p-12 text-center">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900">No invoices found</h3>
                    <p className="text-gray-500 mt-2">
                        {statusFilter === "all"
                            ? "You don't have any invoices yet"
                            : `No ${statusFilter} invoices found`}
                    </p>
                </Card>
            ) : (
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Invoice No.</th>
                                    <th>Invoice Date</th>
                                    <th>Due Date</th>
                                    <th>Amount Due</th>
                                    <th>Amount Paid</th>
                                    <th>Status</th>
                                    <th>Payment Status</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInvoices.map((invoice, index) => (
                                    <motion.tr
                                        key={invoice.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="hover:bg-gray-50 cursor-pointer"
                                        onClick={() => handleViewInvoice(invoice.id)}
                                    >
                                        <td className="font-medium text-indigo-600">
                                            {invoice.invoiceNumber}
                                        </td>
                                        <td>{new Date(invoice.invoiceDate).toLocaleDateString("en-GB")}</td>
                                        <td>{new Date(invoice.dueDate).toLocaleDateString("en-GB")}</td>
                                        <td className="font-semibold text-red-600">
                                            {formatCurrency(invoice.amountDue)}
                                        </td>
                                        <td className="font-semibold text-green-600">
                                            {formatCurrency(invoice.paidViaCash + invoice.paidViaBank)}
                                        </td>
                                        <td>
                                            <span className={`badge ${getStatusBadge(invoice.status)}`}>
                                                {invoice.status}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${getPaymentStatusBadge(invoice.paymentStatus)}`}>
                                                {invoice.paymentStatus}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex items-center justify-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleViewInvoice(invoice.id);
                                                    }}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                {invoice.paymentStatus !== "paid" && (
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/portal/invoices/${invoice.id}?action=pay`);
                                                        }}
                                                    >
                                                        <CreditCard className="w-4 h-4 mr-1" />
                                                        Pay
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                    <p className="text-sm text-gray-500">Total Outstanding</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">
                        {formatCurrency(filteredInvoices.reduce((sum, inv) => sum + inv.amountDue, 0))}
                    </p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-gray-500">Total Paid</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                        {formatCurrency(
                            filteredInvoices.reduce((sum, inv) => sum + inv.paidViaCash + inv.paidViaBank, 0)
                        )}
                    </p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-gray-500">Pending Invoices</p>
                    <p className="text-2xl font-bold text-amber-600 mt-1">
                        {filteredInvoices.filter((inv) => inv.paymentStatus !== "paid").length}
                    </p>
                </Card>
            </div>
        </div>
    );
};
