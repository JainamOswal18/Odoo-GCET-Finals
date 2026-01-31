import React from "react";
import { motion } from "framer-motion";
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Receipt,
    FileText,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react";
import { Card } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";

// Mock data for dashboard
const stats = [
    {
        label: "Total Budget",
        value: 5000000,
        change: 12.5,
        trend: "up" as const,
        icon: DollarSign,
        color: "from-indigo-500 to-violet-600",
    },
    {
        label: "Actual Spending",
        value: 3250000,
        change: 8.3,
        trend: "up" as const,
        icon: TrendingUp,
        color: "from-emerald-500 to-teal-600",
    },
    {
        label: "Remaining Balance",
        value: 1750000,
        change: -4.2,
        trend: "down" as const,
        icon: TrendingDown,
        color: "from-amber-500 to-orange-600",
    },
    {
        label: "Pending Invoices",
        value: 24,
        change: 3,
        trend: "up" as const,
        icon: FileText,
        color: "from-rose-500 to-pink-600",
        isCurrency: false,
    },
];

const recentTransactions = [
    { id: 1, type: "Invoice", number: "INV-2026-001", amount: 45000, status: "Paid", date: "Jan 30, 2026" },
    { id: 2, type: "Bill", number: "BILL-2026-015", amount: 32500, status: "Pending", date: "Jan 29, 2026" },
    { id: 3, type: "Invoice", number: "INV-2026-002", amount: 78000, status: "Partial", date: "Jan 28, 2026" },
    { id: 4, type: "Payment", number: "PAY-2026-008", amount: 45000, status: "Completed", date: "Jan 28, 2026" },
    { id: 5, type: "Bill", number: "BILL-2026-016", amount: 15000, status: "Paid", date: "Jan 27, 2026" },
];

const budgetBreakdown = [
    { name: "Production", budget: 2000000, actual: 1450000, color: "#6366f1" },
    { name: "Marketing", budget: 800000, actual: 650000, color: "#8b5cf6" },
    { name: "Operations", budget: 1200000, actual: 780000, color: "#a855f7" },
    { name: "R&D", budget: 500000, actual: 220000, color: "#d946ef" },
    { name: "Admin", budget: 500000, actual: 150000, color: "#ec4899" },
];

export const Dashboard: React.FC = () => {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500 mt-1">Welcome back! Here is your financial overview.</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>Last updated:</span>
                    <span className="font-medium text-gray-700">Jan 31, 2026, 12:30 PM</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.color}`}>
                                    <stat.icon className="w-5 h-5 text-white" />
                                </div>
                                <div className={`flex items-center gap-1 text-sm font-medium ${stat.trend === "up" ? "text-emerald-600" : "text-red-600"
                                    }`}>
                                    {stat.trend === "up" ? (
                                        <ArrowUpRight className="w-4 h-4" />
                                    ) : (
                                        <ArrowDownRight className="w-4 h-4" />
                                    )}
                                    {Math.abs(stat.change)}%
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="text-sm text-gray-500">{stat.label}</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {stat.isCurrency === false ? stat.value : formatCurrency(stat.value)}
                                </p>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Budget Breakdown */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2"
                >
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-gray-900">Budget vs Actuals by Cost Center</h2>
                            <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                                View All
                            </button>
                        </div>
                        <div className="space-y-4">
                            {budgetBreakdown.map((item) => {
                                const percentage = Math.round((item.actual / item.budget) * 100);
                                return (
                                    <div key={item.name} className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium text-gray-700">{item.name}</span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-gray-500">
                                                    {formatCurrency(item.actual)} / {formatCurrency(item.budget)}
                                                </span>
                                                <span className={`font-medium ${percentage > 80 ? "text-amber-600" : "text-emerald-600"}`}>
                                                    {percentage}%
                                                </span>
                                            </div>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{ duration: 0.8, delay: 0.5 }}
                                                className="h-full rounded-full"
                                                style={{ backgroundColor: item.color }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </motion.div>

                {/* Quick Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Card className="p-6 h-full">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Overall Achievement</h2>

                        {/* Circular Progress */}
                        <div className="flex flex-col items-center py-4">
                            <div className="relative w-36 h-36">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                    <circle
                                        className="text-gray-100"
                                        strokeWidth="8"
                                        stroke="currentColor"
                                        fill="transparent"
                                        r="42"
                                        cx="50"
                                        cy="50"
                                    />
                                    <motion.circle
                                        className="text-indigo-500"
                                        strokeWidth="8"
                                        strokeLinecap="round"
                                        stroke="currentColor"
                                        fill="transparent"
                                        r="42"
                                        cx="50"
                                        cy="50"
                                        initial={{ strokeDasharray: "0 264" }}
                                        animate={{ strokeDasharray: "171 264" }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-bold text-gray-900">65%</span>
                                    <span className="text-sm text-gray-500">Utilized</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <p className="text-2xl font-bold text-indigo-600">32.5L</p>
                                <p className="text-xs text-gray-500 mt-1">Actual</p>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <p className="text-2xl font-bold text-gray-900">50L</p>
                                <p className="text-xs text-gray-500 mt-1">Budget</p>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </div>

            {/* Recent Transactions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                <Card className="overflow-hidden">
                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
                        <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                            View All
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Number</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentTransactions.map((txn) => (
                                    <tr key={txn.id}>
                                        <td>
                                            <span className="flex items-center gap-2">
                                                {txn.type === "Invoice" && <FileText className="w-4 h-4 text-indigo-500" />}
                                                {txn.type === "Bill" && <Receipt className="w-4 h-4 text-amber-500" />}
                                                {txn.type === "Payment" && <DollarSign className="w-4 h-4 text-emerald-500" />}
                                                {txn.type}
                                            </span>
                                        </td>
                                        <td className="font-medium text-gray-900">{txn.number}</td>
                                        <td>{formatCurrency(txn.amount)}</td>
                                        <td>
                                            <span className={`badge ${txn.status === "Paid" || txn.status === "Completed" ? "badge-success" :
                                                    txn.status === "Partial" ? "badge-warning" : "badge-neutral"
                                                }`}>
                                                {txn.status}
                                            </span>
                                        </td>
                                        <td className="text-gray-500">{txn.date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
};
