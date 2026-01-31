import { useState, useMemo, useEffect } from "react";
import { TrendingUp, TrendingDown, AlertTriangle, DollarSign, Calendar, PieChart as PieChartIcon, Loader2 } from "lucide-react";
import { Card, Badge } from "@/components/ui";
import { analyticalAccountsApi, budgetsApi } from "@/lib/api";

interface MetricCard {
    title: string;
    value: string;
    change: number;
    icon: React.ReactNode;
    trend: "up" | "down";
}

interface BudgetAlert {
    id: string;
    account: string;
    budgeted: number;
    actual: number;
    percentage: number;
    severity: "warning" | "error";
}

export default function BudgetOverview() {
    const [selectedPeriod, setSelectedPeriod] = useState("2024");
    const [budgets, setBudgets] = useState<any[]>([]);
    const [analyticalAccounts, setAnalyticalAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [budgetsData, accountsData] = await Promise.all([
                budgetsApi.getAll(),
                analyticalAccountsApi.getAll()
            ]);
            setBudgets(budgetsData);
            setAnalyticalAccounts(accountsData);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch budget data');
        } finally {
            setLoading(false);
        }
    };

    // Calculate metrics
    const metrics = useMemo(() => {
        const totalBudget = budgets.reduce((sum: number, b) => sum + (b.plannedAmount || 0), 0);
        const totalSpent = budgets.reduce((sum: number, b) => sum + (b.actualAmount || 0), 0);
        const utilization = totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : '0';
        const remaining = totalBudget - totalSpent;

        return {
            totalBudget,
            totalSpent,
            utilization: parseFloat(utilization),
            remaining,
        };
    }, [budgets]);

    // Prepare budget distribution data
    const budgetDistribution = useMemo(() => {
        const accountMap = new Map<string, { budget: number; spent: number }>();

        budgets.forEach((budget) => {
            const accountName = analyticalAccounts.find((a) => a.id === budget.analyticalAccountId)?.name || "Unknown";
            const existing = accountMap.get(accountName) || { budget: 0, spent: 0 };
            accountMap.set(accountName, {
                budget: existing.budget + (budget.plannedAmount || 0),
                spent: existing.spent + (budget.actualAmount || 0),
            });
        });

        return Array.from(accountMap.entries())
            .map(([name, data]) => ({
                name,
                budget: data.budget,
                spent: data.spent,
                percentage: data.budget > 0 ? ((data.spent / data.budget) * 100).toFixed(1) : '0',
            }))
            .sort((a, b) => b.budget - a.budget);
    }, [budgets, analyticalAccounts]);

    // Identify over-budget items
    const alerts: BudgetAlert[] = useMemo(() => {
        const overBudget: BudgetAlert[] = [];

        budgets.forEach((budget) => {
            const spent = budget.actualAmount || 0;
            const planned = budget.plannedAmount || 1;
            const percentage = (spent / planned) * 100;

            if (percentage >= 90) {
                const accountName = analyticalAccounts.find((a) => a.id === budget.analyticalAccountId)?.name || "Unknown";
                overBudget.push({
                    id: budget.id,
                    account: accountName,
                    budgeted: budget.plannedAmount,
                    actual: spent,
                    percentage,
                    severity: percentage >= 100 ? "error" : "warning",
                });
            }
        });

        return overBudget.sort((a, b) => b.percentage - a.percentage);
    }, [budgets, analyticalAccounts]);

    const metricCards: MetricCard[] = [
        {
            title: "Total Budget",
            value: `₹${metrics.totalBudget.toLocaleString()}`,
            change: 12.5,
            icon: <DollarSign className="w-6 h-6" />,
            trend: "up",
        },
        {
            title: "Total Spent",
            value: `₹${metrics.totalSpent.toLocaleString()}`,
            change: 8.3,
            icon: <TrendingUp className="w-6 h-6" />,
            trend: "up",
        },
        {
            title: "Budget Utilization",
            value: `${metrics.utilization}%`,
            change: -2.1,
            icon: <PieChartIcon className="w-6 h-6" />,
            trend: metrics.utilization > 80 ? "up" : "down",
        },
        {
            title: "Remaining Budget",
            value: `₹${metrics.remaining.toLocaleString()}`,
            change: -15.2,
            icon: <Calendar className="w-6 h-6" />,
            trend: "down",
        },
    ];

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

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Budget Overview</h1>
                    <p className="text-gray-600 mt-1">Monitor your budget performance at a glance</p>
                </div>
                <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="2024">FY 2024-25</option>
                    <option value="2023">FY 2023-24</option>
                    <option value="2022">FY 2022-23</option>
                </select>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metricCards.map((metric, index) => (
                    <Card key={index} className="p-6">
                        <div className="flex items-center justify-between">
                            <div className={`p-3 rounded-lg ${
                                metric.trend === "up" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                            }`}>
                                {metric.icon}
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                                {metric.trend === "up" ? (
                                    <TrendingUp className="w-4 h-4 text-green-500" />
                                ) : (
                                    <TrendingDown className="w-4 h-4 text-red-500" />
                                )}
                                <span className={metric.trend === "up" ? "text-green-600" : "text-red-600"}>
                                    {Math.abs(metric.change)}%
                                </span>
                            </div>
                        </div>
                        <h3 className="text-gray-600 text-sm mt-4">{metric.title}</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Budget Distribution */}
                <Card className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Budget Distribution by Account</h2>
                    <div className="space-y-4">
                        {budgetDistribution.map((item, index) => (
                            <div key={index}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                                    <span className="text-sm text-gray-600">
                                        ₹{item.spent.toLocaleString()} / ₹{item.budget.toLocaleString()}
                                    </span>
                                </div>
                                <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all ${
                                            parseFloat(item.percentage) >= 100
                                                ? "bg-red-500"
                                                : parseFloat(item.percentage) >= 90
                                                ? "bg-yellow-500"
                                                : "bg-green-500"
                                        }`}
                                        style={{ width: `${Math.min(parseFloat(item.percentage), 100)}%` }}
                                    />
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                    <span className="text-xs text-gray-500">{item.percentage}% utilized</span>
                                    <span className="text-xs text-gray-500">
                                        ₹{(item.budget - item.spent).toLocaleString()} remaining
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Budget Alerts */}
                <Card className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        <h2 className="text-xl font-bold text-gray-900">Budget Alerts</h2>
                        {alerts.length > 0 && (
                            <Badge variant="warning" className="ml-auto">
                                {alerts.length} {alerts.length === 1 ? "Alert" : "Alerts"}
                            </Badge>
                        )}
                    </div>

                    {alerts.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No budget alerts at the moment</p>
                            <p className="text-sm text-gray-400 mt-1">All accounts are within budget limits</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {alerts.map((alert) => (
                                <div
                                    key={alert.id}
                                    className={`p-4 rounded-lg border-l-4 ${
                                        alert.severity === "error"
                                            ? "bg-red-50 border-red-500"
                                            : "bg-yellow-50 border-yellow-500"
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="font-medium text-gray-900">{alert.account}</h4>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Spent: ₹{alert.actual.toLocaleString()} of ₹{alert.budgeted.toLocaleString()}
                                            </p>
                                        </div>
                                        <Badge variant={alert.severity === "error" ? "error" : "warning"}>
                                            {alert.percentage.toFixed(1)}%
                                        </Badge>
                                    </div>
                                    <div className="mt-2 w-full h-2 bg-white rounded-full overflow-hidden">
                                        <div
                                            className={alert.severity === "error" ? "h-full bg-red-500" : "h-full bg-yellow-500"}
                                            style={{ width: `${Math.min(alert.percentage, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>

            {/* Recent Activities */}
            <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Budget Activities</h2>
                <div className="space-y-4">
                    {[
                        { date: "2024-01-30", account: "Marketing & Sales", action: "Budget increased", amount: 50000, type: "increase" },
                        { date: "2024-01-28", account: "R&D Department", action: "Expense recorded", amount: 25000, type: "expense" },
                        { date: "2024-01-25", account: "Office Supplies", action: "Budget allocated", amount: 15000, type: "allocation" },
                        { date: "2024-01-22", account: "Marketing & Sales", action: "Expense recorded", amount: 35000, type: "expense" },
                        { date: "2024-01-20", account: "IT Infrastructure", action: "Budget revised", amount: 100000, type: "revision" },
                    ].map((activity, index) => (
                        <div key={index} className="flex items-center justify-between py-3 border-b last:border-b-0">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    activity.type === "increase" ? "bg-green-100 text-green-600" :
                                    activity.type === "expense" ? "bg-red-100 text-red-600" :
                                    activity.type === "allocation" ? "bg-blue-100 text-blue-600" :
                                    "bg-yellow-100 text-yellow-600"
                                }`}>
                                    <DollarSign className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{activity.account}</p>
                                    <p className="text-sm text-gray-600">{activity.action}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`font-semibold ${
                                    activity.type === "increase" || activity.type === "allocation" ? "text-green-600" : "text-gray-900"
                                }`}>
                                    {activity.type === "expense" ? "-" : "+"}₹{activity.amount.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500">{activity.date}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
