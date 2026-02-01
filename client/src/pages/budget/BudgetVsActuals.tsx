import { useState, useMemo, useEffect } from "react";
import { Filter, Download, TrendingUp, TrendingDown, BarChart3, Loader2 } from "lucide-react";
import { Card, Button, Badge, Select } from "@/components/ui";
import { analyticalAccountsApi, budgetsApi } from "@/lib/api";

interface ComparisonData {
    id: string;
    account: string;
    period: string;
    budgeted: number;
    actual: number;
    variance: number;
    variancePercent: number;
    status: "under" | "over" | "on-track";
}

export default function BudgetVsActuals() {
    const [selectedAccount, setSelectedAccount] = useState<string>("all");
    const [selectedBudgetId, setSelectedBudgetId] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<"table" | "chart">("table");
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
            // Auto-select the first active/confirmed budget
            if (budgetsData.length > 0) {
                const activeBudget = budgetsData.find((b: any) => b.status === 'active' || b.status === 'confirmed');
                setSelectedBudgetId(activeBudget?.id || budgetsData[0].id);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    // Prepare comparison data from selected budget's lines
    const comparisonData: ComparisonData[] = useMemo(() => {
        const selectedBudget = budgets.find(b => b.id === selectedBudgetId);
        if (!selectedBudget || !selectedBudget.lines) {
            return [];
        }

        return selectedBudget.lines.map((line: any) => {
            const actual = line.actualAmount || 0;
            const planned = line.budgetedAmount || 1;
            const variance = actual - planned;
            const variancePercent = ((variance / planned) * 100);

            let status: "under" | "over" | "on-track" = "on-track";
            if (variancePercent > 10) status = "over";
            else if (variancePercent < -10) status = "under";

            return {
                id: line.id,
                account: line.analyticalAccountName || "Unknown",
                period: `${selectedBudget.periodStart} to ${selectedBudget.periodEnd}`,
                budgeted: planned,
                actual,
                variance,
                variancePercent,
                status,
            };
        });
    }, [budgets, selectedBudgetId]);

    // Filter data
    const filteredData = useMemo(() => {
        return comparisonData.filter((item) =>
            selectedAccount === "all" || item.account === selectedAccount
        );
    }, [comparisonData, selectedAccount]);

    // Calculate summary metrics
    const summary = useMemo(() => {
        const totalBudgeted = filteredData.reduce((sum, item) => sum + item.budgeted, 0);
        const totalActual = filteredData.reduce((sum, item) => sum + item.actual, 0);
        const totalVariance = totalActual - totalBudgeted;
        const variancePercent = totalBudgeted > 0 ? ((totalVariance / totalBudgeted) * 100) : 0;

        return {
            totalBudgeted,
            totalActual,
            totalVariance,
            variancePercent,
            overBudgetCount: filteredData.filter((d) => d.status === "over").length,
            underBudgetCount: filteredData.filter((d) => d.status === "under").length,
            onTrackCount: filteredData.filter((d) => d.status === "on-track").length,
        };
    }, [filteredData]);

    const accountOptions = [
        { value: "all", label: "All Accounts" },
        ...analyticalAccounts.map((acc) => ({
            value: acc.name,
            label: acc.name,
        })),
    ];

    const handleExport = () => {
        console.log("Exporting budget vs actuals data...");
        alert("Export functionality will download a CSV/Excel file");
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

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Budget vs Actuals</h1>
                    <p className="text-gray-600 mt-1">Compare budgeted amounts with actual spending</p>
                </div>
                <Button onClick={handleExport} className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export Report
                </Button>
            </div>

            {/* Filters */}
            <Card className="p-4">
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-500" />
                        <span className="font-medium text-gray-700">Filters:</span>
                    </div>
                    <Select
                        value={selectedAccount}
                        onValueChange={setSelectedAccount}
                        options={accountOptions}
                    />
                    <select
                        value={selectedBudgetId || ''}
                        onChange={(e) => setSelectedBudgetId(Number(e.target.value))}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                        {budgets.map((budget) => (
                            <option key={budget.id} value={budget.id}>
                                {budget.name}
                            </option>
                        ))}
                    </select>
                    <div className="ml-auto flex items-center gap-2">
                        <button
                            onClick={() => setViewMode("table")}
                            className={`p-2 rounded-lg ${
                                viewMode === "table" ? "bg-indigo-100 text-indigo-600" : "text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setViewMode("chart")}
                            className={`p-2 rounded-lg ${
                                viewMode === "chart" ? "bg-indigo-100 text-indigo-600" : "text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            <BarChart3 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm text-gray-600">Total Budgeted</h3>
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mt-2">₹{summary.totalBudgeted.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">{filteredData.length} accounts</p>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm text-gray-600">Total Actual</h3>
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <TrendingDown className="w-5 h-5 text-purple-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mt-2">₹{summary.totalActual.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">
                        {((summary.totalActual / summary.totalBudgeted) * 100).toFixed(1)}% utilized
                    </p>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm text-gray-600">Variance</h3>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            summary.totalVariance > 0 ? "bg-red-100" : "bg-green-100"
                        }`}>
                            {summary.totalVariance > 0 ? (
                                <TrendingUp className="w-5 h-5 text-red-600" />
                            ) : (
                                <TrendingDown className="w-5 h-5 text-green-600" />
                            )}
                        </div>
                    </div>
                    <p className={`text-2xl font-bold mt-2 ${
                        summary.totalVariance > 0 ? "text-red-600" : "text-green-600"
                    }`}>
                        {summary.totalVariance > 0 ? "+" : ""}₹{summary.totalVariance.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        {summary.variancePercent > 0 ? "+" : ""}{summary.variancePercent.toFixed(1)}%
                    </p>
                </Card>

                <Card className="p-6">
                    <h3 className="text-sm text-gray-600 mb-3">Status Distribution</h3>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">Over Budget</span>
                            <Badge variant="error">{summary.overBudgetCount}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">On Track</span>
                            <Badge variant="success">{summary.onTrackCount}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">Under Budget</span>
                            <Badge variant="info">{summary.underBudgetCount}</Badge>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Data View */}
            {viewMode === "table" ? (
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Analytical Account
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Period
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Budgeted
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actual
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Variance
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        %
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Progress
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredData.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{item.account}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">{item.period}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="text-sm text-gray-900">₹{item.budgeted.toLocaleString()}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="text-sm text-gray-900">₹{item.actual.toLocaleString()}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className={`text-sm font-medium ${
                                                item.variance > 0 ? "text-red-600" : "text-green-600"
                                            }`}>
                                                {item.variance > 0 ? "+" : ""}₹{item.variance.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className={`text-sm font-medium ${
                                                item.variancePercent > 0 ? "text-red-600" : "text-green-600"
                                            }`}>
                                                {item.variancePercent > 0 ? "+" : ""}{item.variancePercent.toFixed(1)}%
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <Badge
                                                variant={
                                                    item.status === "over" ? "error" :
                                                    item.status === "under" ? "info" :
                                                    "success"
                                                }
                                            >
                                                {item.status === "over" ? "Over" : item.status === "under" ? "Under" : "On Track"}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${
                                                            item.status === "over" ? "bg-red-500" :
                                                            item.status === "under" ? "bg-blue-500" :
                                                            "bg-green-500"
                                                        }`}
                                                        style={{ width: `${Math.min((item.actual / item.budgeted) * 100, 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-gray-600">
                                                    {((item.actual / item.budgeted) * 100).toFixed(0)}%
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            ) : (
                <Card className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Budget vs Actual Comparison</h2>
                    <div className="space-y-6">
                        {filteredData.map((item) => (
                            <div key={item.id} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-900">{item.account}</span>
                                    <span className="text-sm text-gray-600">
                                        {((item.actual / item.budgeted) * 100).toFixed(1)}% utilized
                                    </span>
                                </div>
                                <div className="relative h-12 flex gap-2">
                                    {/* Budgeted Bar (Background) */}
                                    <div className="flex-1 relative">
                                        <div className="absolute inset-0 bg-gray-200 rounded-lg" />
                                        <div
                                            className={`absolute inset-y-0 left-0 rounded-lg ${
                                                item.status === "over" ? "bg-red-500" :
                                                item.status === "under" ? "bg-blue-500" :
                                                "bg-green-500"
                                            }`}
                                            style={{ width: `${Math.min((item.actual / item.budgeted) * 100, 100)}%` }}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-between px-4">
                                            <span className="text-xs font-medium text-gray-700">
                                                Budget: ₹{item.budgeted.toLocaleString()}
                                            </span>
                                            <span className="text-xs font-medium text-gray-700">
                                                Actual: ₹{item.actual.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className={`font-medium ${
                                        item.variance > 0 ? "text-red-600" : "text-green-600"
                                    }`}>
                                        Variance: {item.variance > 0 ? "+" : ""}₹{item.variance.toLocaleString()} ({item.variancePercent > 0 ? "+" : ""}{item.variancePercent.toFixed(1)}%)
                                    </span>
                                    <Badge
                                        variant={
                                            item.status === "over" ? "error" :
                                            item.status === "under" ? "info" :
                                            "success"
                                        }
                                    >
                                        {item.status === "over" ? "Over Budget" : item.status === "under" ? "Under Budget" : "On Track"}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
}
