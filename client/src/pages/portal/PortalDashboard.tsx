import React from "react";
import { motion } from "framer-motion";
import { FileText, ShoppingCart, CreditCard, Clock } from "lucide-react";
import { Card, Button } from "@/components/ui";

export const PortalDashboard: React.FC = () => {
    const stats = [
        {
            label: "Open Invoices",
            value: "3",
            amount: "₹45,200",
            icon: <FileText className="w-5 h-5 text-indigo-600" />,
            color: "bg-indigo-50",
        },
        {
            label: "Pending Orders",
            value: "2",
            amount: "₹12,450",
            icon: <ShoppingCart className="w-5 h-5 text-violet-600" />,
            color: "bg-violet-50",
        },
        {
            label: "Total Paid",
            value: "12",
            amount: "₹1,25,000",
            icon: <CreditCard className="w-5 h-5 text-emerald-600" />,
            color: "bg-emerald-50",
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
                    <p className="text-gray-500">Welcome back! Here's your account overview.</p>
                </div>
                <Button>Pay Pending Invoices</Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
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

            {/* Recent Activity */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-gray-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Invoice #INV-2024-00{i} Generated</p>
                                    <p className="text-xs text-gray-500">2 hours ago</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm">View</Button>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};
