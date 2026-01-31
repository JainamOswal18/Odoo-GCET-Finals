import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Package } from "lucide-react";
import { Card } from "@/components/ui";
import type { PortalOrder } from "@/lib/types";
import { portalService } from "@/services/portalService";
import { formatCurrency } from "@/lib/utils";

type OrderType = "all" | "sales" | "purchase";

export const MyOrders: React.FC = () => {
    const [orders, setOrders] = useState<PortalOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [typeFilter, setTypeFilter] = useState<OrderType>("all");

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const data = await portalService.getMyOrders();
            setOrders(data);
        } catch (error) {
            console.error("Failed to load orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter((order) => {
        if (typeFilter === "all") return true;
        return order.type === typeFilter;
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="text-gray-500 mt-4">Loading orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
                    <p className="text-gray-500 mt-1">View your sales and purchase orders</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Total:</span>
                    <span className="text-lg font-bold text-gray-900">{filteredOrders.length}</span>
                </div>
            </div>

            {/* Type Filter Tabs */}
            <div className="flex flex-wrap gap-2">
                {(["all", "sales", "purchase"] as OrderType[]).map((type) => (
                    <button
                        key={type}
                        onClick={() => setTypeFilter(type)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${typeFilter === type
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                    >
                        {type === "all" ? "All Orders" : type === "sales" ? "Sales Orders" : "Purchase Orders"}
                    </button>
                ))}
            </div>

            {/* Order List */}
            {filteredOrders.length === 0 ? (
                <Card className="p-12 text-center">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900">No orders found</h3>
                    <p className="text-gray-500 mt-2">
                        {typeFilter === "all"
                            ? "You don't have any orders yet"
                            : `No ${typeFilter} orders found`}
                    </p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredOrders.map((order, index) => (
                        <motion.div
                            key={order.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="p-6 hover:shadow-lg transition-shadow">
                                {/* Order Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-3 rounded-xl ${order.type === "sales"
                                            ? "bg-emerald-100"
                                            : "bg-indigo-100"
                                            }`}>
                                            {order.type === "sales" ? (
                                                <ShoppingCart className={`w-6 h-6 ${order.type === "sales" ? "text-emerald-600" : "text-indigo-600"
                                                    }`} />
                                            ) : (
                                                <Package className="w-6 h-6 text-indigo-600" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold text-gray-900">{order.orderNumber}</p>
                                            <p className="text-sm text-gray-500">
                                                {order.type === "sales" ? "Sales Order" : "Purchase Order"}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`badge ${getStatusBadge(order.status)}`}>
                                        {order.status}
                                    </span>
                                </div>

                                {/* Order Details */}
                                <div className="space-y-3 mb-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Partner</span>
                                        <span className="text-sm font-medium text-gray-900">{order.partnerName}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Order Date</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {new Date(order.orderDate).toLocaleDateString("en-GB")}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Items</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {order.lineItems.length} item(s)
                                        </span>
                                    </div>
                                </div>

                                {/* Line Items Preview */}
                                <div className="border-t border-gray-200 pt-4 mb-4">
                                    <p className="text-xs font-semibold text-gray-700 mb-2">Items:</p>
                                    <div className="space-y-1">
                                        {order.lineItems.slice(0, 3).map((item) => (
                                            <div key={item.id} className="flex justify-between items-center text-sm">
                                                <span className="text-gray-600 truncate max-w-[200px]">
                                                    {item.productName} × {item.quantity}
                                                </span>
                                                <span className="text-gray-900 font-medium">
                                                    {formatCurrency(item.total)}
                                                </span>
                                            </div>
                                        ))}
                                        {order.lineItems.length > 3 && (
                                            <p className="text-xs text-gray-500 italic">
                                                +{order.lineItems.length - 3} more item(s)
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Order Total */}
                                <div className="flex justify-between items-center pt-4 border-t-2 border-gray-300">
                                    <span className="text-sm font-semibold text-gray-700">Total Amount</span>
                                    <span className="text-xl font-bold text-indigo-600">
                                        {formatCurrency(order.total)}
                                    </span>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                    <p className="text-sm text-gray-500">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{filteredOrders.length}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-gray-500">Sales Orders</p>
                    <p className="text-2xl font-bold text-emerald-600 mt-1">
                        {orders.filter((o) => o.type === "sales").length}
                    </p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-gray-500">Purchase Orders</p>
                    <p className="text-2xl font-bold text-indigo-600 mt-1">
                        {orders.filter((o) => o.type === "purchase").length}
                    </p>
                </Card>
            </div>
        </div>
    );
};
