import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Receipt,
    FileText,
    ArrowUpRight,
    ArrowDownRight,
    Loader2,
} from "lucide-react";
import { Card } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { reportsApi, budgetsApi, invoicesApi, billsApi, paymentsApi } from "@/lib/api";

export const Dashboard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<any>(null);
    const [budgets, setBudgets] = useState<any[]>([]);
    const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [statsData, budgetsData, invoicesData, billsData, paymentsData] = await Promise.all([
                reportsApi.getDashboardStats(),
                budgetsApi.getAll(),
                invoicesApi.getAll().catch(() => []),
                billsApi.getAll().catch(() => []),
                paymentsApi.getAll().catch(() => [])
            ]);
            console.log('📊 Dashboard Stats:', statsData);
            console.log('💰 Budgets Data:', budgetsData);
            console.log('📋 Budget Lines Sample:', budgetsData[0]?.lines);
            setStats(statsData);
            setBudgets(budgetsData);
            
            // Combine recent transactions from invoices, bills, and payments
            const transactions: any[] = [];
            
            // Add recent invoices
            invoicesData.slice(0, 3).forEach((inv: any) => {
                transactions.push({
                    id: `inv-${inv.id}`,
                    type: 'Invoice',
                    number: inv.invoiceNumber || inv.invoice_number,
                    amount: inv.totalAmount || inv.total_amount || 0,
                    status: inv.paymentStatus === 'paid' ? 'Paid' : 
                            inv.paymentStatus === 'partial' ? 'Partial' : 'Unpaid',
                    date: new Date(inv.invoiceDate || inv.invoice_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                });
            });
            
            // Add recent bills
            billsData.slice(0, 3).forEach((bill: any) => {
                transactions.push({
                    id: `bill-${bill.id}`,
                    type: 'Bill',
                    number: bill.billNumber || bill.bill_number,
                    amount: bill.totalAmount || bill.total_amount || 0,
                    status: bill.paymentStatus === 'paid' ? 'Paid' : 
                            bill.paymentStatus === 'partial' ? 'Partial' : 'Unpaid',
                    date: new Date(bill.billDate || bill.bill_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                });
            });
            
            // Add recent payments
            paymentsData.slice(0, 3).forEach((payment: any) => {
                transactions.push({
                    id: `pay-${payment.id}`,
                    type: 'Payment',
                    number: payment.paymentNumber || payment.payment_number,
                    amount: payment.amount || 0,
                    status: payment.status === 'posted' ? 'Completed' : 'Pending',
                    date: new Date(payment.paymentDate || payment.payment_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                });
            });
            
            // Sort by date (most recent first) and take top 5
            transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setRecentTransactions(transactions.slice(0, 5));
        } catch (err: any) {
            setError(err.message || 'Failed to fetch dashboard data');
            console.error('Error fetching dashboard:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                </div>
            </div>
        );
    }

    const statCards = [
        {
            label: "Total Budget",
            value: stats?.totalBudget || 0,
            change: 12.5,
            trend: "up" as const,
            icon: DollarSign,
            color: "from-indigo-500 to-violet-600",
        },
        {
            label: "Actual Spending",
            value: stats?.actualSpending || 0,
            change: 8.3,
            trend: "up" as const,
            icon: TrendingUp,
            color: "from-emerald-500 to-teal-600",
        },
        {
            label: "Remaining Balance",
            value: stats?.remainingBudget || 0,
            change: -4.2,
            trend: "down" as const,
            icon: TrendingDown,
            color: "from-amber-500 to-orange-600",
        },
        {
            label: "Pending Invoices",
            value: stats?.pendingInvoices || 0,
            change: 3,
            trend: "up" as const,
            icon: FileText,
            color: "from-rose-500 to-pink-600",
            isCurrency: false,
        },
    ];

    // Transform budgets into budget lines (by analytical account/cost center)
    const budgetBreakdown: Array<{
        name: string;
        budget: number;
        spent: number;
        percentage: number;
        color: string;
    }> = [];
    
    // Extract all budget lines from all budgets
    budgets.forEach((budget) => {
        const lines = budget.lines || [];
        lines.forEach((line: any) => {
            const budgetedAmount = line.budgetedAmount || line.budgeted_amount || 0;
            const actualAmount = line.actualAmount || line.actual_amount || 0;
            const percentage = budgetedAmount > 0 ? ((actualAmount / budgetedAmount) * 100) : 0;
            
            budgetBreakdown.push({
                name: line.analyticalAccountName || line.analytical_account_name || 'Unknown',
                budget: budgetedAmount,
                spent: actualAmount,
                percentage: Math.round(percentage),
                color: ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"][budgetBreakdown.length % 5],
            });
        });
    });
    
    // Take only top 5 cost centers (or show all if less than 5)
    const displayBudgets = budgetBreakdown.slice(0, 5);
    
    // Debug logging
    console.log('🎯 Budget Breakdown:', budgetBreakdown);
    console.log('📊 Display Budgets:', displayBudgets);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500 mt-1">
                        Welcome back! Here is your financial overview.
                        <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                            🔴 LIVE DATA
                        </span>
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>Last updated:</span>
                    <span className="font-medium text-gray-700">{new Date().toLocaleString()}</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, index) => (
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
                            </div>
                            <div className="mt-4">
                                <p className="text-sm text-gray-500">{stat.label}</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {stat.isCurrency === false ? stat.value : formatCurrency(stat.value)}
                                </p>
                                <p className="text-xs text-emerald-600 mt-1">✓ Real-time from DB</p>
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
                            {displayBudgets.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <p>No budget data available</p>
                                </div>
                            ) : (
                                displayBudgets.map((item) => {
                                    const percentage = item.percentage || Math.round((item.spent / item.budget) * 100);
                                    return (
                                        <div key={item.name} className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium text-gray-700">{item.name}</span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-gray-500">
                                                    {formatCurrency(item.spent)} / {formatCurrency(item.budget)}
                                                </span>
                                                <span className={`font-medium ${percentage > 80 ? "text-amber-600" : "text-emerald-600"}`}>
                                                    {percentage}%
                                                </span>
                                            </div>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(percentage, 100)}%` }}
                                                transition={{ duration: 0.8, delay: 0.5 }}
                                                className="h-full rounded-full"
                                                style={{ backgroundColor: item.color }}
                                            />
                                        </div>
                                    </div>
                                );
                            }))}
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
                                        animate={{ 
                                            strokeDasharray: `${(parseFloat(stats?.budgetUtilization || 0) / 100) * 264} 264` 
                                        }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-bold text-gray-900">{stats?.budgetUtilization || 0}%</span>
                                    <span className="text-sm text-gray-500">Utilized</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <p className="text-2xl font-bold text-indigo-600">{formatCurrency(stats?.actualSpending || 0)}</p>
                                <p className="text-xs text-gray-500 mt-1">Actual</p>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats?.totalBudget || 0)}</p>
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
