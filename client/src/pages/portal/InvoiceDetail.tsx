import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Download,
    CreditCard,
    Printer,
    Send,
    XCircle,
    CheckCircle,
} from "lucide-react";
import { Card, Button } from "@/components/ui";
import type { PortalInvoice } from "@/lib/types";
import { portalService } from "@/services/portalService";
import { formatCurrency } from "@/lib/utils";
import { PaymentModal } from "@/components/portal/PaymentModal";
import { useAuth } from "@/contexts/AuthContext";

type TabType = "confirm" | "print" | "send" | "cancel" | "pay";

export const InvoiceDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [invoice, setInvoice] = useState<PortalInvoice | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>("confirm");
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    useEffect(() => {
        if (id) {
            loadInvoice(id);
        }
        // Check if we should open payment modal
        if (searchParams.get("action") === "pay") {
            setShowPaymentModal(true);
        }
    }, [id, searchParams]);

    const loadInvoice = async (invoiceId: string) => {
        try {
            setLoading(true);
            const data = await portalService.getInvoiceById(invoiceId);
            setInvoice(data);
        } catch (error) {
            console.error("Failed to load invoice:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!invoice) return;

        // Use browser's print functionality for PDF generation
        window.print();

        // Alternatively, use backend endpoint:
        // try {
        //     const blob = await portalService.downloadInvoice(invoice.id);
        //     const url = window.URL.createObjectURL(blob);
        //     const a = document.createElement('a');
        //     a.href = url;
        //     a.download = `${invoice.invoiceNumber}.pdf`;
        //     a.click();
        //     window.URL.revokeObjectURL(url);
        // } catch (error) {
        //     console.error('Download failed:', error);
        // }
    };



    const handlePaymentSuccess = () => {
        // Reload invoice to get updated payment status
        if (id) {
            loadInvoice(id);
        }
        setShowPaymentModal(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="text-gray-500 mt-4">Loading invoice...</p>
                </div>
            </div>
        );
    }

    if (!invoice) {
        return (
            <Card className="p-12 text-center">
                <h3 className="text-lg font-semibold text-gray-900">Invoice not found</h3>
                <p className="text-gray-500 mt-2">The invoice you're looking for doesn't exist</p>
                <Button onClick={() => navigate("/portal/invoices")} className="mt-4">
                    Back to Invoices
                </Button>
            </Card>
        );
    }

    const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
        { id: "confirm", label: "Confirm", icon: <CheckCircle className="w-4 h-4" /> },
        { id: "print", label: "Print", icon: <Printer className="w-4 h-4" /> },
        { id: "send", label: "Send", icon: <Send className="w-4 h-4" /> },
        { id: "cancel", label: "Cancel", icon: <XCircle className="w-4 h-4" /> },
        { id: "pay", label: "Pay", icon: <CreditCard className="w-4 h-4" /> },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate("/portal/invoices")}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to Invoices</span>
                </button>
                <Button onClick={handleDownload} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                </Button>
            </div>

            {/* Invoice Card */}
            <Card className="overflow-hidden">
                {/* Tabs */}
                <div className="border-b border-gray-200 bg-gray-50">
                    <div className="flex overflow-x-auto no-scrollbar">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    if (tab.id === "print") handleDownload();
                                    if (tab.id === "pay" && invoice.amountDue > 0) setShowPaymentModal(true);
                                }}
                                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap min-w-fit ${activeTab === tab.id
                                    ? "text-indigo-600 border-b-2 border-indigo-600 bg-white"
                                    : "text-gray-600 hover:text-gray-900"
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Invoice Content */}
                <div className="p-8 print:p-4">
                    {/* Invoice Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Customer Invoice</h1>
                    </div>

                    {/* Invoice Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div>
                            <p className="text-sm text-gray-500">Customer Invoice No.</p>
                            <p className="text-lg font-bold text-gray-900 break-words">{invoice.invoiceNumber}</p>

                            <p className="text-sm text-gray-500 mt-4">Customer Name</p>
                            <p className="text-gray-900 font-medium break-words">{invoice.customerName}</p>

                            <p className="text-sm text-gray-500 mt-4">Reference</p>
                            <p className="text-gray-900 break-words">Shiv Furniture Pvt. Ltd.</p>
                        </div>
                        <div className="text-left md:text-right">
                            <p className="text-sm text-gray-500">Invoice Date</p>
                            <p className="text-gray-900 font-medium">
                                {new Date(invoice.invoiceDate).toLocaleDateString("en-GB")}
                            </p>

                            <p className="text-sm text-gray-500 mt-4">Due Date</p>
                            <p className="text-gray-900 font-medium">
                                {new Date(invoice.dueDate).toLocaleDateString("en-GB")}
                            </p>

                            <p className="text-sm text-gray-500 mt-4">Status</p>
                            <div className="flex justify-start md:justify-end gap-2">
                                <span className={`badge ${invoice.status === "done" ? "badge-success" :
                                    invoice.status === "confirmed" ? "badge-primary" :
                                        invoice.status === "cancelled" ? "badge-error" :
                                            "badge-neutral"
                                    }`}>
                                    {invoice.status}
                                </span>
                                <span className={`badge ${invoice.paymentStatus === "paid" ? "badge-success" :
                                    invoice.paymentStatus === "partial" ? "badge-warning" :
                                        "badge-error"
                                    }`}>
                                    {invoice.paymentStatus}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Line Items Table */}
                    <div className="mb-8">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Line Items</h3>
                        <div className="border rounded-lg overflow-x-auto">
                            <table className="w-full text-sm min-w-[600px]">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="p-3 text-left">Sr. No.</th>
                                        <th className="p-3 text-left">Product</th>
                                        <th className="p-3 text-left">Budget Analytics</th>
                                        <th className="p-3 text-center">Qty</th>
                                        <th className="p-3 text-right">Unit Price</th>
                                        <th className="p-3 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoice.lineItems.map((item, index) => (
                                        <tr key={item.id} className="border-t border-gray-100">
                                            <td className="p-3">{index + 1}</td>
                                            <td className="p-3">
                                                <p className="font-medium text-gray-900">{item.productName}</p>
                                                <p className="text-xs text-gray-500">From Product Master - Many to one</p>
                                            </td>
                                            <td className="p-3">
                                                <p className="text-gray-700">{item.analyticalAccountName || "None"}</p>
                                                <p className="text-xs text-gray-500">
                                                    {item.analyticalAccountId
                                                        ? "From Analytical Master - Many to One"
                                                        : "Auto Compute From Auto Analytical Model"}
                                                </p>
                                            </td>
                                            <td className="p-3 text-center font-medium">{item.quantity}</td>
                                            <td className="p-3 text-right">{formatCurrency(item.unitPrice)}</td>
                                            <td className="p-3 text-right font-semibold">{formatCurrency(item.total)}</td>
                                        </tr>
                                    ))}
                                    <tr className="border-t-2 border-gray-300 bg-gray-50 font-semibold">
                                        <td colSpan={5} className="p-3 text-right">Total</td>
                                        <td className="p-3 text-right">{formatCurrency(invoice.subtotal)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500">Paid via Cash</p>
                                <p className="text-lg font-semibold text-emerald-600">
                                    {formatCurrency(invoice.paidViaCash)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Paid via Bank</p>
                                <p className="text-lg font-semibold text-green-600">
                                    {formatCurrency(invoice.paidViaBank)}
                                </p>
                            </div>
                        </div>
                        <div className="text-right border-t-2 border-gray-300 pt-4">
                            <p className="text-sm text-gray-600">Amount Due</p>
                            <p className={`text-3xl font-bold ${invoice.amountDue === 0 ? "text-green-600" : "text-red-600"}`}>
                                {formatCurrency(invoice.amountDue)}
                            </p>
                            <p className="text-xs text-gray-500">(Total - Payment)</p>

                            {invoice.amountDue > 0 && (
                                <Button
                                    onClick={() => setShowPaymentModal(true)}
                                    className="mt-4"
                                >
                                    <CreditCard className="w-4 h-4 mr-2" />
                                    Pay Now
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Payment Modal */}
            {showPaymentModal && invoice && user && (
                <PaymentModal
                    invoice={invoice}
                    user={user}
                    onClose={() => setShowPaymentModal(false)}
                    onSuccess={handlePaymentSuccess}
                />
            )}
        </div>
    );
};
