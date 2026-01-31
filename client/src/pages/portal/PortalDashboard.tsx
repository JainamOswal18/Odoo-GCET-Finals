import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, ShoppingCart, CreditCard, ArrowRight } from "lucide-react";
import { Card, Button } from "@/components/ui";
import { portalService } from "@/services/portalService";
import type { PortalInvoice, PortalOrder } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export const PortalDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState<PortalInvoice[]>([]);
    const [orders, setOrders] = useState<PortalOrder[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [invoicesData, ordersData] = await Promise.all([
                portalService.getMyInvoices(),
                portalService.getMyOrders(),
            ]);
            setInvoices(invoicesData);
            setOrders(ordersData);
        } catch (error) {
            console.error("Failed to load dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const openInvoices = invoices.filter((inv) => inv.paymentStatus !== "paid");
    const totalOutstanding = openInvoices.reduce((sum, inv) => sum + inv.amountDue, 0);
    const totalPaid = invoices.reduce((sum, inv) => sum + inv.paidViaCash + inv.paidViaBank, 0);

    const stats = [
        {
            label: "Open Invoices",
            value: openInvoices.length.toString(),
            amount: formatCurrency(totalOutstanding),
            icon: <FileText className="w-5 h-5 text-indigo-600" />,
            color: "bg-indigo-50",
            action: () => navigate("/portal/invoices"),
        },
        {
            label: "Active Orders",
            value: orders.filter((o) => o.status !== "cancelled").length.toString(),
            amount: formatCurrency(orders.reduce((sum, o) => sum + o.total, 0)),
            icon: <ShoppingCart className="w-5 h-5 text-violet-600" />,
            color: "bg-violet-50",
            action: () => navigate("/portal/orders"),
        },
        {
            label: "Total Paid",
            value: invoices.filter((inv) => inv.paymentStatus === "paid").length.toString(),
            amount: formatCurrency(totalPaid),
            icon: <CreditCard className="w-5 h-5 text-emerald-600" />,
            color: "bg-emerald-50",
            action: () => navigate("/portal/invoices"),
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="text-gray-500 mt-4">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
                    <p className="text-gray-500">Welcome back! Here's your account overview.</p>
                </div>
                {openInvoices.length > 0 && (
                    <Button onClick={() => navigate("/portal/invoices")}>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pay Pending Invoices
                    </Button>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={stat.action}
                        className="cursor-pointer"
                    >
                        <Card className="p-6 transition-all hover:shadow-md">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                    <h3 className="text-2xl font-bold text-gray-900 mt-2">{stat.amount}</h3>
                                    <p className="text-sm text-gray-600 mt-1">{stat.value} Records</p>
                                </div>
                                <div className={`p-3 rounded-xl ${stat.color}`}>
                                    {stat.icon}
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Recent Invoices */}
            <Card className="overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Invoices</h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/portal/invoices")}
                    >
                        View All
                        <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>
                {invoices.length === 0 ? (
                    <div className="p-12 text-center">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No invoices yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {invoices.slice(0, 5).map((invoice) => (
                            <div
                                key={invoice.id}
                                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                                onClick={() => navigate(`/portal/invoices/${invoice.id}`)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {invoice.invoiceNumber}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(invoice.invoiceDate).toLocaleDateString("en-GB")}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-gray-900">
                                            {formatCurrency(invoice.grandTotal)}
                                        </p>
                                        <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${invoice.paymentStatus === "paid"
                                            ? "bg-green-100 text-green-700"
                                            : invoice.paymentStatus === "partial"
                                                ? "bg-amber-100 text-amber-700"
                                                : "bg-red-100 text-red-700"
                                            }`}>
                                            {invoice.paymentStatus}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* Recent Orders */}
            <Card className="overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/portal/orders")}
                    >
                        View All
                        <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>
                {orders.length === 0 ? (
                    <div className="p-12 text-center">
                        <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No orders yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {orders.slice(0, 5).map((order) => (
                            <div
                                key={order.id}
                                className="p-4 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${order.type === "sales" ? "bg-emerald-100" : "bg-violet-100"
                                            }`}>
                                            <ShoppingCart className={`w-5 h-5 ${order.type === "sales" ? "text-emerald-600" : "text-violet-600"
                                                }`} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {order.orderNumber}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {order.type === "sales" ? "Sales Order" : "Purchase Order"} • {" "}
                                                {new Date(order.orderDate).toLocaleDateString("en-GB")}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-gray-900">
                                            {formatCurrency(order.total)}
                                        </p>
                                        <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${order.status === "done"
                                            ? "bg-green-100 text-green-700"
                                            : order.status === "confirmed"
                                                ? "bg-blue-100 text-blue-700"
                                                : "bg-gray-100 text-gray-700"
                                            }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
};

